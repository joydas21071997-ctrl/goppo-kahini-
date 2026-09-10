import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getGoppoFirebaseApp } from './firebaseStorage';
import { AudienceUser } from '../types';
import { VERIFIED_ADMIN_EMAILS } from './adminAuth';
import { OFFICIAL_GOPPO_FIREBASE_CONFIG } from './firebaseConfig';
import {
  createFirestoreUserOnRegister,
  syncUserWithFirestore
} from './firestoreUser';
import {
  validateRealName,
  validateRealEmail,
  validateRealPhone,
  validateStrongPassword
} from '../utils/validation';

let cachedAuth: ReturnType<typeof getAuth> | null = null;
let fallbackAuthInstance: ReturnType<typeof getAuth> | null = null;

export function getOfficialFallbackAuth(): ReturnType<typeof getAuth> | null {
  if (!fallbackAuthInstance) {
    try {
      const existing = getApps().find((a) => a.name === 'officialGoppoAuthApp');
      const app =
        existing ||
        initializeApp(
          {
            apiKey: OFFICIAL_GOPPO_FIREBASE_CONFIG.apiKey,
            authDomain: OFFICIAL_GOPPO_FIREBASE_CONFIG.authDomain,
            projectId: OFFICIAL_GOPPO_FIREBASE_CONFIG.projectId,
            storageBucket: OFFICIAL_GOPPO_FIREBASE_CONFIG.storageBucket,
            messagingSenderId: OFFICIAL_GOPPO_FIREBASE_CONFIG.messagingSenderId,
            appId: OFFICIAL_GOPPO_FIREBASE_CONFIG.appId,
          },
          'officialGoppoAuthApp'
        );
      fallbackAuthInstance = getAuth(app);
      setPersistence(fallbackAuthInstance, browserLocalPersistence).catch(() => {});
    } catch (e) {
      console.warn('Official fallback auth init notice:', e);
    }
  }
  return fallbackAuthInstance;
}

export function getGoppoAuth() {
  if (!cachedAuth) {
    try {
      const app = getGoppoFirebaseApp();
      cachedAuth = getAuth(app);
      setPersistence(cachedAuth, browserLocalPersistence).catch((err) => {
        console.warn('Firebase Auth persistence set warning:', err);
      });
    } catch (err) {
      console.error('Firebase Auth initialization error:', err);
      cachedAuth = null;
    }
  }
  return cachedAuth;
}

// Convert Firebase user to clean AudienceUser
export function mapFirebaseUserToAudience(fbUser: FirebaseUser, provider: 'google' | 'password'): AudienceUser {
  const email = (fbUser.email || '').trim().toLowerCase();
  const isAdmin = VERIFIED_ADMIN_EMAILS.includes(email);
  return {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'শ্রোতা',
    photoURL: fbUser.photoURL || undefined,
    phoneNumber: fbUser.phoneNumber || undefined,
    emailVerified: fbUser.emailVerified,
    provider,
    createdAt: new Date().toISOString(),
    role: isAdmin ? 'admin' : 'user',
  };
}

// Get saved audience session from localStorage
export function getSavedAudienceUser(): AudienceUser | null {
  try {
    const raw = localStorage.getItem('goppo_audience_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && typeof user.uid === 'string') {
        return user;
      }
    }
  } catch {}
  return null;
}

// Save audience session
export function saveAudienceUser(user: AudienceUser | null) {
  if (user) {
    localStorage.setItem('goppo_audience_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('goppo_audience_user');
  }
}

// Real Firebase Google Sign-In with popup (no mock or demo fallbacks)
export async function signInWithGoogle(): Promise<{ user: AudienceUser }> {
  const auth = getGoppoAuth();
  if (!auth) {
    throw new Error('Firebase Authentication সিস্টেম এই মুহূর্তে সংযোগযোগ্য নয়। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    if (!cred || !cred.user) {
      throw new Error('Google অথেনটিকেশন ব্যর্থ হয়েছে।');
    }
    const audienceUser = mapFirebaseUserToAudience(cred.user, 'google');
    saveAudienceUser(audienceUser);

    // Automatically create document in Firestore if not exists, or update updatedAt
    try {
      await syncUserWithFirestore(audienceUser, 'google');
    } catch (fsErr) {
      console.warn('Firestore sync notice on Google sign-in:', fsErr);
    }

    return { user: audienceUser };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Google Auth popup error:', error?.code, error?.message);
    throw new Error(translateAuthError(error?.code || ''));
  }
}

// Real Firebase Email & Password Login (no localStorage fallback)
export async function loginWithEmail(email: string, pass: string): Promise<AudienceUser> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !pass) {
    throw new Error('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দুটিই সঠিকভাবে প্রদান করুন।');
  }

  const auth = getGoppoAuth();
  if (!auth) {
    throw new Error('Firebase Authentication সিস্টেম এই মুহূর্তে সংযোগযোগ্য নয়। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
  }

  try {
    let cred: UserCredential;
    try {
      cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (primaryErr: unknown) {
      const pErr = primaryErr as { code?: string; message?: string };
      if (pErr?.code === 'auth/operation-not-allowed') {
        const fallbackAuth = getOfficialFallbackAuth();
        if (fallbackAuth && fallbackAuth !== auth) {
          cred = await signInWithEmailAndPassword(fallbackAuth, cleanEmail, pass);
        } else {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    if (!cred || !cred.user) {
      throw new Error('লগইন ব্যর্থ হয়েছে।');
    }

    // STRICT ANTI-FAKE ACCOUNT BACKEND LOCK:
    // Reload user from Firebase to check if email was truly verified
    try {
      await cred.user.reload();
    } catch {}

    const isVerified = cred.user.emailVerified;
    const isOfficialAdmin = VERIFIED_ADMIN_EMAILS.includes(cleanEmail);

    if (!isVerified && !isOfficialAdmin) {
      // Re-send verification link to their real email
      try {
        await sendEmailVerification(cred.user);
      } catch {}
      // Sign out immediately so unverified sessions cannot persist
      try {
        await signOut(auth);
      } catch {}
      saveAudienceUser(null);
      throw new Error(
        'আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি! কোনো ফেক বা আনভেরিফায়েড অ্যাকাউন্ট দিয়ে প্রবেশ করা সম্পূর্ণ নিষিদ্ধ। আপনার জিমেইল/ইমেইল ইনবক্সে (বা Spam ফোল্ডারে) ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে। লিঙ্কে ক্লিক করে ভেরিফাই করুন।'
      );
    }

    const audienceUser = mapFirebaseUserToAudience(cred.user, 'password');
    audienceUser.emailVerified = true;
    saveAudienceUser(audienceUser);

    // Sync with Firestore: update updatedAt without overwriting existing subscription info
    try {
      await syncUserWithFirestore(audienceUser, 'password');
    } catch (fsErr) {
      console.warn('Firestore sync notice on login:', fsErr);
    }

    return audienceUser;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Email Login error:', error?.code, error?.message);
    if (error?.message && !error?.code) {
      throw err;
    }
    throw new Error(translateAuthError(error?.code || ''));
  }
}

export interface RegistrationResult {
  user: AudienceUser;
  verificationSent: boolean;
}

// Real Firebase Email & Password Registration with Strict Anti-Fraud Validation & Verification
export async function registerWithEmail(
  email: string,
  pass: string,
  name: string,
  phone?: string
): Promise<RegistrationResult> {
  // 1. Strict Name Validation (no fake names, gibberish, or repetitive letters)
  const nameVal = validateRealName(name);
  if (!nameVal.isValid) {
    throw new Error(nameVal.errorMessage);
  }

  // 2. Strict Email Validation (no disposable/fake domains, valid format)
  const emailVal = validateRealEmail(email);
  if (!emailVal.isValid) {
    throw new Error(emailVal.errorMessage);
  }

  // 3. Strict Password Validation (min 8 chars, mixed letters & numbers)
  const passVal = validateStrongPassword(pass);
  if (!passVal.isValid) {
    throw new Error(passVal.errorMessage);
  }

  // 4. Strict Phone Validation (worldwide real mobile number)
  if (phone && phone.trim()) {
    const phoneVal = validateRealPhone(phone);
    if (!phoneVal.isValid) {
      throw new Error(phoneVal.errorMessage);
    }
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPhone = phone?.trim() || undefined;

  const auth = getGoppoAuth();
  if (!auth) {
    throw new Error('Firebase Authentication সিস্টেম এই মুহূর্তে সংযোগযোগ্য নয়। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
  }

  const role = VERIFIED_ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user';

  try {
    let cred: UserCredential;
    try {
      cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (primaryErr: unknown) {
      const pErr = primaryErr as { code?: string; message?: string };
      if (pErr?.code === 'auth/operation-not-allowed') {
        const fallbackAuth = getOfficialFallbackAuth();
        if (fallbackAuth && fallbackAuth !== auth) {
          cred = await createUserWithEmailAndPassword(fallbackAuth, cleanEmail, pass);
        } else {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

    if (!cred || !cred.user) {
      throw new Error('রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    }

    if (cleanName) {
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (profErr) {
        console.warn('Firebase profile update notice:', profErr);
      }
    }

    // Send Real Email Verification Link to User's Email Inbox
    let verificationSent = false;
    try {
      await sendEmailVerification(cred.user);
      verificationSent = true;
    } catch (vErr) {
      console.warn('Email verification send notice:', vErr);
    }

    const audienceUser: AudienceUser = {
      uid: cred.user.uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: cred.user.photoURL || undefined,
      phoneNumber: cleanPhone,
      emailVerified: false,
      provider: 'password',
      createdAt: new Date().toISOString(),
      role,
    };

    // Store pending registration info in sessionStorage so verification can sync
    try {
      sessionStorage.setItem(
        'goppo_pending_reg',
        JSON.stringify({
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: cleanName,
          phoneNumber: cleanPhone,
        })
      );
    } catch {}

    // DO NOT save to audienceUser session yet to prevent unverified entry!
    return { user: audienceUser, verificationSent };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Email Register error:', error?.code, error?.message);
    if (error?.message && !error?.code) {
      throw err;
    }
    throw new Error(translateAuthError(error?.code || ''));
  }
}

// Resend verification email to the current Firebase user or by credentials
export async function resendVerificationEmail(): Promise<boolean> {
  const auth = getGoppoAuth();
  if (auth && auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
    return true;
  }
  throw new Error('কোনো সক্রিয় সেশন পাওয়া যায়নি। অনুগ্রহ করে লগইন ফর্মে ফিরে যান।');
}

// Check if currently signed-in user has verified their email
export async function checkCurrentUserEmailVerification(): Promise<{ isVerified: boolean; user?: AudienceUser }> {
  const auth = getGoppoAuth();
  if (auth && auth.currentUser) {
    await auth.currentUser.reload();
    const isVerified = auth.currentUser.emailVerified;
    if (isVerified) {
      const u = auth.currentUser;
      const cleanEmail = (u.email || '').trim().toLowerCase();
      const role = VERIFIED_ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user';

      let pendingPhone: string | undefined;
      let pendingName = u.displayName || 'শ্রোতা';
      try {
        const raw = sessionStorage.getItem('goppo_pending_reg');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.phoneNumber) pendingPhone = parsed.phoneNumber;
          if (parsed.displayName) pendingName = parsed.displayName;
        }
      } catch {}

      const audienceUser: AudienceUser = {
        uid: u.uid,
        email: cleanEmail,
        displayName: pendingName,
        photoURL: u.photoURL || undefined,
        phoneNumber: pendingPhone || u.phoneNumber || undefined,
        emailVerified: true,
        provider: 'password',
        createdAt: new Date().toISOString(),
        role,
      };

      saveAudienceUser(audienceUser);
      sessionStorage.removeItem('goppo_pending_reg');

      // Create and sync Firestore user document with emailVerified: true
      try {
        await createFirestoreUserOnRegister(audienceUser);
      } catch (fsErr) {
        console.warn('Firestore user create notice on verify:', fsErr);
      }

      return { isVerified: true, user: audienceUser };
    }
    return { isVerified: false };
  }
  return { isVerified: false };
}

// User Logout
export async function logoutAudience(): Promise<void> {
  const auth = getGoppoAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase SignOut warning:', err);
    }
  }
  saveAudienceUser(null);
}

// Aliases for clear external consumption
export const getCurrentAudienceUser = getSavedAudienceUser;
export const logoutAudienceUser = logoutAudience;

// Send Password Reset Email
export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('অনুগ্রহ করে আপনার অ্যাকাউন্টের সঠিক ইমেইল আইডি দিন।');
  }

  const auth = getGoppoAuth();
  if (!auth) {
    throw new Error('Firebase Authentication সিস্টেম এই মুহূর্তে সংযোগযোগ্য নয়।');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase Password Reset error:', error?.code, error?.message);
    throw new Error(translateAuthError(error?.code || ''));
  }
}

// Update current user's password (when logged in)
export async function changeUserPassword(newPass: string): Promise<void> {
  if (newPass.length < 6) {
    throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
  }
  const auth = getGoppoAuth();
  if (!auth?.currentUser) {
    throw new Error('পাসওয়ার্ড পরিবর্তন করতে অনুগ্রহ করে প্রথমে লগইন করুন।');
  }
  try {
    await updatePassword(auth.currentUser, newPass);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error('Firebase update password error:', error?.code, error?.message);
    if (error?.code === 'auth/requires-recent-login') {
      throw new Error('নিরাপত্তার স্বার্থে অনুগ্রহ করে একবার লগআউট করে পুনরায় লগইন করে পাসওয়ার্ড পরিবর্তন করুন।');
    }
    throw new Error(translateAuthError(error?.code || ''));
  }
}

// Subscribe to auth state changes with persistent session sync
// When Firebase reports null, clears the saved audience session and returns null
export function onAudienceAuthStateChanged(callback: (user: AudienceUser | null) => void): () => void {
  const auth = getGoppoAuth();
  if (auth) {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const isGoogle = fbUser.providerData?.some((p) => p.providerId === 'google.com');
        const mapped = mapFirebaseUserToAudience(fbUser, isGoogle ? 'google' : 'password');

        // Restore pass status if exists in user subscription storage
        const userSubKey = `goppo_user_sub_${fbUser.uid}`;
        const savedSub = localStorage.getItem(userSubKey);
        if (savedSub) {
          try {
            const parsed = JSON.parse(savedSub);
            if (parsed && parsed.status === 'active') {
              mapped.hasTwentyTakaPass = true;
            }
          } catch {}
        }

        saveAudienceUser(mapped);
        // Ensure Firestore document exists at users/{uid} and update updatedAt without overwriting subscription
        syncUserWithFirestore(mapped, isGoogle ? 'google' : 'password').catch(() => {});
        callback(mapped);
      } else {
        // When Firebase reports null, clear the saved audience session and return null.
        // Never restore a local/fake user when Firebase says there is no authenticated user.
        saveAudienceUser(null);
        callback(null);
      }
    });
  }

  // If Firebase Auth is not initialized, clear saved session and return null
  saveAudienceUser(null);
  callback(null);
  return () => {};
}

// Translate Firebase Error Codes into Bengali
function translateAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'ভুল পাসওয়ার্ড বা ইমেইল আইডি! দয়া করে সঠিক তথ্য দিয়ে চেষ্টা করুন।';
    case 'auth/user-not-found':
      return 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। অনুগ্রহ করে রেজিস্ট্রেশন করুন।';
    case 'auth/email-already-in-use':
      return 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। দয়া করে লগইন করুন।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ডটি অত্যন্ত ছোট। কমপক্ষে ৬টি অক্ষর বা সংখ্যার পাসওয়ার্ড দিন।';
    case 'auth/invalid-email':
      return 'অনুগ্রহ করে একটি সঠিক ইমেইল আইডি প্রদান করুন (উদা: yourname@gmail.com)।';
    case 'auth/missing-email':
      return 'অনুগ্রহ করে আপনার অ্যাকাউন্টের ইমেইল আইডি প্রদান করুন।';
    case 'auth/too-many-requests':
      return 'অনেকবার ব্যর্থ চেষ্টা করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে পুনরায় চেষ্টা করুন।';
    case 'auth/popup-closed-by-user':
      return 'Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    case 'auth/popup-blocked':
      return 'ব্রাউজারে পপআপ ব্লক করা হয়েছে। অনুগ্রহ করে পপআপ অনুমোদন করে পুনরায় চেষ্টা করুন।';
    case 'auth/unauthorized-domain':
      return 'এই ডোমেনটি Firebase Authentication-এ অনুমোদিত নয়। অনুগ্রহ করে Firebase Console-এ ডোমেন যোগ করুন।';
    case 'auth/cancelled-popup-request':
      return 'সাইন-ইন রিকোয়েস্ট বাতিল করা হয়েছে।';
    case 'auth/operation-not-allowed':
      return 'Firebase Authentication-এ ইমেইল/পাসওয়ার্ড পদ্ধতি সক্রিয় করা নেই। অনুগ্রহ করে Firebase Console থেকে Email/Password সক্রিয় করুন অথবা Google দিয়ে লগইন করুন।';
    case 'auth/configuration-not-found':
      return 'Firebase Console-এ Authentication চালু করা হয়নি। অনুগ্রহ করে Firebase Console > Authentication-এ গিয়ে "Get Started"-এ ক্লিক করুন এবং Email/Password চালু করুন।';
    case 'auth/network-request-failed':
      return 'ইন্টারনেট সংযোগে ত্রুটি। অনুগ্রহ করে নেটওয়ার্ক চেক করুন।';
    case 'auth/account-exists-with-different-credential':
      return 'এই ইমেইলটি অন্য একটি সাইন-ইন মেথডের সাথে যুক্ত রয়েছে।';
    case 'auth/user-disabled':
      return 'এই ব্যবহারকারী অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।';
    default:
      return 'অথেন্টিকেশনে সমস্যা হয়েছে। অনুগ্রহ করে তথ্য যাচাই করে পুনরায় চেষ্টা করুন।';
  }
}
