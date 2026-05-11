
"use client"

import { useState, useEffect } from "react";

export interface EmergencyProfile {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  emergencyContacts: string;
  preferredLanguage: string;
  lastUpdated?: string;
}

const STORAGE_KEY = "axon_ai_emergency_profile";

export function useEmergencyProfile() {
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse emergency profile", e);
      }
    }
    setIsLoading(false);
  }, []);

  const updateProfile = (newProfile: EmergencyProfile) => {
    const updatedProfile = {
      ...newProfile,
      lastUpdated: new Date().toISOString()
    };
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { profile, updateProfile, clearProfile, isLoading };
}
