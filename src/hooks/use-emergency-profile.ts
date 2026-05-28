
"use client"

import { useState, useEffect } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface EmergencyProfile {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  emergencyContacts: string;
  preferredLanguage: string;
  lastUpdated?: any;
}

const STORAGE_KEY = "axon_ai_emergency_profile";

export function useEmergencyProfile() {
  const { user } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage immediately for offline responsiveness
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse local profile", e);
      }
    }
    if (!user) setIsLoading(false);
  }, [user]);

  // Sync with Firestore if authenticated
  useEffect(() => {
    if (!user || !db) return;

    setIsLoading(true);
    const docRef = doc(db, "users", user.uid, "profile", "emergency");
    
    const unsubscribe = onSnapshot(docRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as EmergencyProfile;
          setProfile(cloudData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
        }
        setIsLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get'
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, db]);

  const updateProfile = (newProfile: EmergencyProfile) => {
    // 1. Update local state and cache first (Optimistic UI)
    const localUpdate = { ...newProfile, lastUpdated: new Date().toISOString() };
    setProfile(localUpdate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUpdate));

    // 2. Sync to cloud if online
    if (user && db) {
      const docRef = doc(db, "users", user.uid, "profile", "emergency");
      setDoc(docRef, {
        ...newProfile,
        lastUpdated: serverTimestamp()
      }, { merge: true })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: newProfile
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  };

  return { profile, updateProfile, isLoading, isAuthenticated: !!user };
}
