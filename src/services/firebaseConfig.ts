/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import appletConfig from '../../firebase-applet-config.json';

// Firebase Configuration and Auth Bridge for Goppo Kahini
// Gracefully initializes and safely handles credentials from Applet Config or Environment Variables

export interface FirebaseAppConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
  firestoreDatabaseId?: string;
  packageName?: string;
  projectNumber?: string;
  clientId?: string;
}

// Official Web App Firebase Configuration for JD Productions / Goppo Kahini
export const OFFICIAL_GOPPO_FIREBASE_CONFIG: FirebaseAppConfig = {
  apiKey: 'AIzaSyBqvxZ_Y4gTdjES8nB_lvjwSxTebVqbPmY',
  authDomain: 'jd-productions-app.firebaseapp.com',
  projectId: 'jd-productions-app',
  storageBucket: 'jd-productions-app.firebasestorage.app',
  messagingSenderId: '451367721746',
  appId: '1:451367721746:web:f5fb54079c746e8d0f31cb',
  databaseURL: 'https://jd-productions-app-default-rtdb.firebaseio.com',
};

// Default configuration container - prioritizes provisioned appletConfig
export const getFirebaseConfig = (): FirebaseAppConfig => {
  const localSaved = localStorage.getItem('goppo_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      // Only use local overrides if it has valid credentials and does not hijack the provisioned project
      if (parsed.projectId && parsed.apiKey && parsed.projectId !== 'jd-productions-app') {
        return {
          firestoreDatabaseId: appletConfig.firestoreDatabaseId,
          ...parsed,
        };
      } else {
        localStorage.removeItem('goppo_firebase_config');
      }
    } catch {}
  }

  // Check environment variables safely
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

  const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || 'argon-yarrow-wpthm';
  const apiKey = metaEnv.VITE_FIREBASE_API_KEY || appletConfig.apiKey || '';
  const authDomain = metaEnv.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || `${projectId}.firebaseapp.com`;
  const storageBucket = metaEnv.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || `${projectId}.firebasestorage.app`;
  const messagingSenderId = metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '';
  const appId = metaEnv.VITE_FIREBASE_APP_ID || appletConfig.appId || '';
  const firestoreDatabaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || 'ai-studio-8thsep5goppokahi-54c61b69-958f-49b7-97b1-8d4a3b90b263';

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
    firestoreDatabaseId,
    packageName: (appletConfig as any).packageName,
    projectNumber: appletConfig.messagingSenderId,
    clientId: (appletConfig as any).oAuthClientId,
  };
};

export const saveFirebaseConfig = (config: FirebaseAppConfig) => {
  localStorage.setItem('goppo_firebase_config', JSON.stringify(config));
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getFirebaseAppInstance(): FirebaseApp {
  if (!_app) {
    const existing = getApps();
    if (existing.length > 0) {
      _app = existing[0];
    } else {
      _app = initializeApp({
        apiKey: appletConfig.apiKey,
        projectId: appletConfig.projectId,
        appId: appletConfig.appId,
        authDomain: appletConfig.authDomain,
        storageBucket: appletConfig.storageBucket,
        messagingSenderId: appletConfig.messagingSenderId,
      });
    }
  }
  return _app;
}

export function getFirestoreInstance(): Firestore {
  if (!_db) {
    const fbApp = getFirebaseAppInstance();
    const dbId =
      appletConfig.firestoreDatabaseId && appletConfig.firestoreDatabaseId !== '(default)'
        ? appletConfig.firestoreDatabaseId
        : undefined;
    try {
      _db = initializeFirestore(
        fbApp,
        { experimentalAutoDetectLongPolling: true },
        dbId
      );
    } catch {
      _db = dbId ? getFirestore(fbApp, dbId) : getFirestore(fbApp);
    }
  }
  return _db;
}

export function getAuthInstance(): Auth {
  if (!_auth) {
    const fbApp = getFirebaseAppInstance();
    _auth = getAuth(fbApp);
  }
  return _auth;
}

export const app = getFirebaseAppInstance();
export const db = getFirestoreInstance();
export const auth = getAuthInstance();


