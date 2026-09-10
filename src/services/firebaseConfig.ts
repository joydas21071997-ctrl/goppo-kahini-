/// <reference types="vite/client" />
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

// Default fallback configuration container
export const getFirebaseConfig = (): FirebaseAppConfig => {
  const localSaved = localStorage.getItem('goppo_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.projectId && parsed.projectId !== 'argon-yarrow-wpthm') {
        return { ...OFFICIAL_GOPPO_FIREBASE_CONFIG, ...parsed };
      }
    } catch {}
  }

  // Check environment variables safely
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

  const isArgonPlaceholder = !metaEnv.VITE_FIREBASE_PROJECT_ID && appletConfig.projectId === 'argon-yarrow-wpthm';

  const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID || (!isArgonPlaceholder && appletConfig.projectId) || OFFICIAL_GOPPO_FIREBASE_CONFIG.projectId || 'jd-productions-app';
  const apiKey = metaEnv.VITE_FIREBASE_API_KEY || (!isArgonPlaceholder && appletConfig.apiKey) || OFFICIAL_GOPPO_FIREBASE_CONFIG.apiKey || '';
  const authDomain = metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (!isArgonPlaceholder && appletConfig.authDomain) || OFFICIAL_GOPPO_FIREBASE_CONFIG.authDomain || `${projectId}.firebaseapp.com`;
  const storageBucket = metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (!isArgonPlaceholder && appletConfig.storageBucket && !appletConfig.storageBucket.includes('argon-yarrow-wpthm') ? appletConfig.storageBucket : OFFICIAL_GOPPO_FIREBASE_CONFIG.storageBucket);
  const messagingSenderId = metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (!isArgonPlaceholder && appletConfig.messagingSenderId) || OFFICIAL_GOPPO_FIREBASE_CONFIG.messagingSenderId || '';
  const appId = metaEnv.VITE_FIREBASE_APP_ID || (!isArgonPlaceholder && appletConfig.appId) || OFFICIAL_GOPPO_FIREBASE_CONFIG.appId || '';
  const firestoreDatabaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || (!isArgonPlaceholder && appletConfig.firestoreDatabaseId) || '';

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || OFFICIAL_GOPPO_FIREBASE_CONFIG.databaseURL || `https://${projectId}-default-rtdb.firebaseio.com`,
    firestoreDatabaseId,
    packageName: OFFICIAL_GOPPO_FIREBASE_CONFIG.packageName,
    projectNumber: OFFICIAL_GOPPO_FIREBASE_CONFIG.projectNumber,
    clientId: OFFICIAL_GOPPO_FIREBASE_CONFIG.clientId,
  };
};

export const saveFirebaseConfig = (config: FirebaseAppConfig) => {
  localStorage.setItem('goppo_firebase_config', JSON.stringify(config));
};

