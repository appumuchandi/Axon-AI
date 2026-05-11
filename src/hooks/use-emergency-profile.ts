"use client"

import { useState, useEffect } from "react";

export interface EmergencyProfile {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  emergencyContacts: string;
  preferredLanguage: string;
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
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  };

  return { profile, updateProfile, isLoading };
}