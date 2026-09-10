import { AudienceUser, CreatorSession, AuthorizedAdminUser } from '../types';
import { getGoppoFirestore } from './firestoreUser';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { getGoppoAuth, getOfficialFallbackAuth } from './firebaseAuth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

/**
 * SOLE AUTHORIZED ADMIN: joydas.21071997@gmail.com
 * Verified Firebase Auth UID: hwvu4siXbGhcpbreCQfca6b1P0h1
 */
export const SOLE_AUTHORIZED_ADMIN_UID = 'hwvu4siXbGhcpbreCQfca6b1P0h1';
export const VERIFIED_ADMIN_EMAILS = [
  'joydas.21071997@gmail.com',
];

/**
 * Check if an email belongs to the primary founding Super Admin.
 */
export function isPrimarySuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === 'joyfulfilms21@gmail.com') return false;
  return VERIFIED_ADMIN_EMAILS.includes(clean);
}

/**
 * Dynamic delegated admin management
 */
const LOCAL_STORAGE_ADMINS_KEY = 'goppo_delegated_admin_users';

export function getDelegatedAdmins(): AuthorizedAdminUser[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_ADMINS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (a) => a.email && a.email.toLowerCase() !== 'joyfulfilms21@gmail.com'
        );
      }
    }
  } catch {}
  return [
    {
      id: 'admin-joy-1',
      email: 'joydas.21071997@gmail.com',
      name: 'জয় দাস (Joy - একমাত্র প্রতিষ্ঠাতা ও সুপার অ্যাডমিন)',
      role: 'super_admin',
      addedAt: '2026-01-01',
    },
  ];
}

export async function addDelegatedAdmin(
  newAdmin: Omit<AuthorizedAdminUser, 'id' | 'addedAt'>
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = newAdmin.email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'সঠিক ইমেইল এড্রেস লিখুন' };
  }

  const list = getDelegatedAdmins();
  if (list.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'এই ইমেইলটি ইতিমধ্যে অ্যাডমিন তালিকায় আছে' };
  }

  const created: AuthorizedAdminUser = {
    id: `adm-${Date.now()}`,
    email: cleanEmail,
    name: newAdmin.name.trim() || 'অনুমোদিত অ্যাডমিন',
    role: newAdmin.role || 'editor',
    addedAt: new Date().toISOString().split('T')[0],
  };

  const updated = [...list, created];
  localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('goppo_admins_updated'));

  // Sync with Firestore if available
  try {
    const db = getGoppoFirestore();
    if (db) {
      await setDoc(doc(db, 'admin_users', cleanEmail), {
        ...created,
        status: 'active',
        grantedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('Firestore admin_users sync failed:', e);
  }

  return { success: true, message: `${cleanEmail}-কে সফলভাবে অ্যাডমিন এক্সেস দেওয়া হয়েছে` };
}

export async function removeDelegatedAdmin(
  email: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (isPrimarySuperAdminEmail(cleanEmail)) {
    return { success: false, message: 'প্রধান প্রতিষ্ঠাতা সুপার অ্যাডমিনকে মুছে ফেলা যাবে না' };
  }

  const list = getDelegatedAdmins();
  const updated = list.filter((a) => a.email.toLowerCase() !== cleanEmail);
  localStorage.setItem(LOCAL_STORAGE_ADMINS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('goppo_admins_updated'));

  // Sync delete with Firestore
  try {
    const db = getGoppoFirestore();
    if (db) {
      await deleteDoc(doc(db, 'admin_users', cleanEmail));
    }
  } catch (e) {
    console.warn('Firestore delete failed:', e);
  }

  return { success: true, message: 'অ্যাডমিন পারমিশন সফলভাবে প্রত্যাহার করা হয়েছে' };
}

/**
 * Checks whether the current user / session is authorized to access the Admin Panel.
 */
export function isAuthorizedAdmin(
  creatorSession: CreatorSession | null,
  currentUser: AudienceUser | null
): boolean {
  // Explicitly block former admin joyfulfilms21@gmail.com
  if (currentUser?.email && currentUser.email.trim().toLowerCase() === 'joyfulfilms21@gmail.com') {
    return false;
  }
  if (creatorSession?.email && creatorSession.email.trim().toLowerCase() === 'joyfulfilms21@gmail.com') {
    return false;
  }

  // 1. Active Creator Session
  if (creatorSession?.isLoggedIn && (creatorSession.role === 'super_admin' || creatorSession.role === 'approved_narrator')) {
    return true;
  }

  // 2. Verified Super Admin email or admin role
  if (currentUser?.email) {
    const cleanEmail = currentUser.email.trim().toLowerCase();
    if (isPrimarySuperAdminEmail(cleanEmail)) {
      return true;
    }
  }

  // 3. Custom Firebase token role claim
  if (currentUser?.role === 'admin') {
    return true;
  }

  return false;
}

/**
 * Ensures Firebase Auth is actively authenticated as the authorized Admin:
 * joydas.21071997@gmail.com (UID: hwvu4siXbGhcpbreCQfca6b1P0h1)
 * Refreshes the ID token so Firebase Storage and Firestore security rules permit audio/cover uploads.
 */
export async function ensureAdminFirebaseAuth(): Promise<boolean> {
  const auth = getGoppoAuth();
  const fallbackAuth = getOfficialFallbackAuth();

  const adminEmail = 'joydas.21071997@gmail.com';
  const adminPass = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';

  let authenticated = false;

  // 1. Check/authenticate on primary auth
  if (auth) {
    if (auth.currentUser && (auth.currentUser.uid === SOLE_AUTHORIZED_ADMIN_UID || isPrimarySuperAdminEmail(auth.currentUser.email))) {
      try {
        await auth.currentUser.getIdToken(true);
        authenticated = true;
      } catch {}
    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPass);
        if (cred.user) {
          await cred.user.getIdToken(true);
          authenticated = true;
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
            if (newCred.user) {
              await newCred.user.getIdToken(true);
              authenticated = true;
            }
          } catch {}
        }
      }
    }
  }

  // 2. Also ensure authenticated on fallback auth (official project) if distinct
  if (fallbackAuth && fallbackAuth !== auth) {
    if (fallbackAuth.currentUser && (fallbackAuth.currentUser.uid === SOLE_AUTHORIZED_ADMIN_UID || isPrimarySuperAdminEmail(fallbackAuth.currentUser.email))) {
      try {
        await fallbackAuth.currentUser.getIdToken(true);
        authenticated = true;
      } catch {}
    } else {
      try {
        const cred = await signInWithEmailAndPassword(fallbackAuth, adminEmail, adminPass);
        if (cred.user) {
          await cred.user.getIdToken(true);
          authenticated = true;
        }
      } catch {}
    }
  }

  return authenticated;
}

/**
 * Sign in Admin with Google directly using Firebase Auth popup.
 * Guarantees that Firebase Storage and Firestore see a verified token for joydas.21071997@gmail.com.
 */
export async function signInAdminWithGoogle(): Promise<{ success: boolean; email?: string; error?: string }> {
  const auth = getGoppoAuth();
  if (!auth) return { success: false, error: 'Firebase Auth is not available' };

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account', login_hint: 'joydas.21071997@gmail.com' });
    const cred = await signInWithPopup(auth, provider);
    const userEmail = cred.user.email?.toLowerCase();
    if (userEmail === 'joydas.21071997@gmail.com') {
      return { success: true, email: cred.user.email || undefined };
    } else {
      await auth.signOut();
      return { success: false, error: 'অননুমোদিত একাউন্ট: শুধুমাত্র joydas.21071997@gmail.com অনুমোদিত।' };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

