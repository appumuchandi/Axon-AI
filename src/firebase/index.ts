'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  Auth
} from 'firebase/auth';

import { firebaseConfig } from './config';

let authInstance: Auth;

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp();

  const firestore = getFirestore(firebaseApp);

  authInstance = getAuth(firebaseApp);

  if (typeof window !== 'undefined') {
    setPersistence(authInstance, browserLocalPersistence)
      .catch(console.error);
  }

  return {
    firebaseApp,
    firestore,
    auth: authInstance,
  };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';