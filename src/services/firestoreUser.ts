import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { getGoppoFirebaseApp } from './firebaseStorage';
import { getFirebaseConfig } from './firebaseConfig';
import { AudienceUser } from '../types';

let cachedFirestore: Firestore | null = null;

export function resetCachedFirestore(): void {
  cachedFirestore = null;
}

/**
 * Returns the Cloud Firestore instance for the configured database in goppo-kahini-app.
 */
export function getGoppoFirestore(): Firestore | null {
  if (!cachedFirestore) {
    try {
      const app = getGoppoFirebaseApp();
      const config = getFirebaseConfig();
      if (
        config.firestoreDatabaseId &&
        config.firestoreDatabaseId !== '(default)' &&
        config.projectId !== 'jd-productions-app'
      ) {
        cachedFirestore = getFirestore(app, config.firestoreDatabaseId);
      } else {
        cachedFirestore = getFirestore(app);
      }
    } catch (err) {
      console.warn('Firestore initialization notice:', err);
    }
  }
  return cachedFirestore;
}

export interface FirestoreUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  provider: string;
  createdAt: any;
  updatedAt: any;
  subscriptionStatus: 'inactive' | 'active' | string;
  subscriptionExpiry: any | null;
}

/**
 * Creates a new user document in Cloud Firestore at `users/{uid}`
 * on user registration with Email + Password.
 * Ensures default subscriptionStatus: "inactive" and subscriptionExpiry: null.
 */
export async function createFirestoreUserOnRegister(user: AudienceUser): Promise<void> {
  const db = getGoppoFirestore();
  if (!db || !user.uid) return;

  const userDocRef = doc(db, 'users', user.uid);

  try {
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      // User already exists, only update updatedAt to avoid overwriting existing data
      await updateDoc(userDocRef, {
        updatedAt: serverTimestamp(),
        phoneNumber: user.phoneNumber || null,
        emailVerified: user.emailVerified ?? false,
      });
      return;
    }

    const newProfile: FirestoreUserProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'শ্রোতা',
      email: (user.email || '').toLowerCase().trim(),
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      emailVerified: user.emailVerified ?? false,
      provider: user.provider || 'password',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      subscriptionStatus: 'inactive',
      subscriptionExpiry: null,
    };

    await setDoc(userDocRef, newProfile);
  } catch (err) {
    console.warn('Firestore create user document notice:', err);
  }
}

/**
 * Ensures a user document exists in Cloud Firestore at `users/{uid}`.
 * - If user does not exist (e.g. first-time Google sign-in), creates it automatically with:
 *   subscriptionStatus: "inactive", subscriptionExpiry: null, createdAt & updatedAt server timestamps.
 * - If user already exists, DOES NOT overwrite their existing subscription information!
 *   Only updates updatedAt (and profile details if updated).
 */
export async function syncUserWithFirestore(
  user: AudienceUser,
  providerHint?: 'google' | 'password'
): Promise<FirestoreUserProfile | null> {
  const db = getGoppoFirestore();
  if (!db || !user.uid) return null;

  const userDocRef = doc(db, 'users', user.uid);

  try {
    const existingSnap = await getDoc(userDocRef);

    if (!existingSnap.exists()) {
      // Document does not exist: create new profile (e.g., first-time Google sign-in)
      const newProfile: FirestoreUserProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'শ্রোতা',
        email: (user.email || '').toLowerCase().trim(),
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || null,
        emailVerified: user.emailVerified ?? (providerHint === 'google' || user.provider === 'google'),
        provider: providerHint || user.provider || 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscriptionStatus: 'inactive',
        subscriptionExpiry: null,
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    }

    // Existing user: Do NOT overwrite subscription information!
    const existingData = existingSnap.data() as DocumentData;

    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (!existingData.displayName && user.displayName) {
      updates.displayName = user.displayName;
    }
    if (!existingData.photoURL && user.photoURL) {
      updates.photoURL = user.photoURL;
    }
    if (!existingData.phoneNumber && user.phoneNumber) {
      updates.phoneNumber = user.phoneNumber;
    }
    if (user.emailVerified !== undefined) {
      updates.emailVerified = user.emailVerified;
    }

    await updateDoc(userDocRef, updates);

    return {
      uid: user.uid,
      displayName: existingData.displayName || user.displayName,
      email: existingData.email || user.email,
      photoURL: existingData.photoURL ?? user.photoURL ?? null,
      provider: existingData.provider || user.provider,
      createdAt: existingData.createdAt,
      updatedAt: new Date().toISOString(),
      subscriptionStatus: existingData.subscriptionStatus || 'inactive',
      subscriptionExpiry: existingData.subscriptionExpiry ?? null,
    };
  } catch (err) {
    console.warn('Firestore sync user document notice:', err);
    return null;
  }
}

/**
 * Updates editable profile information (displayName, photoURL) in Firestore at `users/{uid}`.
 * Automatically updates `updatedAt` with server timestamp.
 * Never modifies subscriptionStatus or subscriptionExpiry.
 */
export async function updateUserProfileInFirestore(
  uid: string,
  updates: { displayName?: string; photoURL?: string | null }
): Promise<void> {
  const db = getGoppoFirestore();
  if (!db || !uid) return;

  const userDocRef = doc(db, 'users', uid);
  try {
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore update profile notice:', err);
  }
}

/**
 * Fetches user profile from Firestore at `users/{uid}`
 */
export async function fetchUserProfileFromFirestore(uid: string): Promise<FirestoreUserProfile | null> {
  const db = getGoppoFirestore();
  if (!db || !uid) return null;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
  } catch (err) {
    console.warn('Firestore fetch user profile notice:', err);
  }
  return null;
}
