import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { OFFICIAL_GOPPO_FIREBASE_CONFIG, getFirebaseConfig } from './firebaseConfig';
import { ensureAdminFirebaseAuth } from './adminAuth';

// Initialize Firebase App instance safely
export function getGoppoFirebaseApp() {
  const currentConfig = getFirebaseConfig();
  const config = {
    apiKey: currentConfig.apiKey || OFFICIAL_GOPPO_FIREBASE_CONFIG.apiKey,
    authDomain: currentConfig.authDomain || `${currentConfig.projectId || 'goppo-kahini-app'}.firebaseapp.com`,
    projectId: currentConfig.projectId || 'goppo-kahini-app',
    storageBucket: currentConfig.storageBucket || `${currentConfig.projectId || 'goppo-kahini-app'}.firebasestorage.app`,
    messagingSenderId: currentConfig.messagingSenderId || OFFICIAL_GOPPO_FIREBASE_CONFIG.messagingSenderId,
    appId: currentConfig.appId || OFFICIAL_GOPPO_FIREBASE_CONFIG.appId,
  };

  if (!getApps().length) {
    return initializeApp(config);
  }
  return getApp();
}

// Get Firebase Storage instance
export function getGoppoStorage() {
  const app = getGoppoFirebaseApp();
  return getStorage(app);
}

export interface UploadProgressInfo {
  progress: number; // 0 - 100
  bytesTransferred: number;
  totalBytes: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  downloadUrl?: string;
  fileName?: string;
}

/**
 * Upload an audio file (MP3, WAV, M4A, AAC) directly to Firebase Storage.
 * Tracks actual progress and returns the public download URL.
 * NEVER falls back to local Object URLs on failure.
 */
export async function uploadAudioToFirebaseStorage(
  file: File,
  onProgress?: (info: UploadProgressInfo) => void
): Promise<{ downloadUrl: string; fileName: string; isFirebaseStored: boolean; storagePath: string }> {
  // Ensure admin session is ready for Firebase rules
  await ensureAdminFirebaseAuth();

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `stories/audio/${Date.now()}_${cleanName}`;
  const storage = getGoppoStorage();
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'audio/mpeg',
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Goppo Kahini Admin',
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const total = snapshot.totalBytes || file.size || 1;
        const pct = Math.min(100, Math.round((snapshot.bytesTransferred / total) * 100)) || 0;
        if (onProgress) {
          onProgress({
            progress: pct,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: total,
            status: 'uploading',
          });
        }
      },
      (error) => {
        console.error('Firebase Storage audio upload error:', error);
        if (onProgress) {
          onProgress({
            progress: 0,
            bytesTransferred: 0,
            totalBytes: file.size,
            status: 'error',
            errorMessage: error.message || 'অডিও ফাইলটি Firebase Storage-এ আপলোড করতে সমস্যা হয়েছে।',
          });
        }
        reject(new Error(`Firebase Storage অডিও আপলোড ব্যর্থ হয়েছে: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) {
            onProgress({
              progress: 100,
              bytesTransferred: file.size,
              totalBytes: file.size,
              status: 'completed',
              downloadUrl,
              fileName: file.name,
            });
          }
          resolve({
            downloadUrl,
            fileName: file.name,
            isFirebaseStored: true,
            storagePath,
          });
        } catch (err: unknown) {
          const errObj = err as { message?: string };
          console.error('Failed to get audio download URL from Firebase Storage:', err);
          if (onProgress) {
            onProgress({
              progress: 0,
              bytesTransferred: 0,
              totalBytes: file.size,
              status: 'error',
              errorMessage: 'ডাউনলোড লিঙ্ক সংগ্রহ করা সম্ভব হয়নি।',
            });
          }
          reject(new Error(`ডাউনলোড লিঙ্ক সংগ্রহ ব্যর্থ: ${errObj?.message || ''}`));
        }
      }
    );
  });
}

/**
 * Upload a story cover image directly to Firebase Storage.
 * NEVER falls back to local Object URLs on failure.
 */
export async function uploadCoverToFirebaseStorage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ downloadUrl: string; isFirebaseStored: boolean; storagePath: string }> {
  // Ensure admin session is ready for Firebase rules
  await ensureAdminFirebaseAuth();

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `stories/covers/${Date.now()}_${cleanName}`;
  const storage = getGoppoStorage();
  const storageRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'image/jpeg',
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const total = snapshot.totalBytes || file.size || 1;
        const pct = Math.min(100, Math.round((snapshot.bytesTransferred / total) * 100)) || 0;
        if (onProgress) onProgress(pct);
      },
      (error) => {
        console.error('Firebase Storage cover upload error:', error);
        reject(new Error(`কভার ছবি Firebase Storage-এ আপলোড ব্যর্থ হয়েছে: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, isFirebaseStored: true, storagePath });
        } catch (err: unknown) {
          const errObj = err as { message?: string };
          reject(new Error(`কভার ছবির ডাউনলোড লিঙ্ক সংগ্রহ ব্যর্থ: ${errObj?.message || ''}`));
        }
      }
    );
  });
}

/**
 * Deletes a file from Firebase Storage given its full download URL or bucket storage path.
 * If the URL is external (Unsplash/Picsum) or local blob, safely skips deletion.
 */
export async function deleteStorageFileByUrl(urlOrPath?: string | null): Promise<boolean> {
  if (!urlOrPath) return true;

  // If it's not a Firebase Storage URL or path, ignore safely
  const isFirebaseStorage =
    urlOrPath.includes('firebasestorage.googleapis.com') ||
    urlOrPath.includes('.firebasestorage.app') ||
    urlOrPath.startsWith('gs://') ||
    urlOrPath.startsWith('stories/');

  if (!isFirebaseStorage) {
    return true;
  }

  // Ensure admin auth is established before deletion
  await ensureAdminFirebaseAuth();

  try {
    const storage = getGoppoStorage();
    let fileRef;
    try {
      fileRef = ref(storage, urlOrPath);
    } catch {
      // Fallback: extract path between /o/ and ?
      const match = urlOrPath.match(/\/o\/([^?]+)/);
      if (match && match[1]) {
        const decodedPath = decodeURIComponent(match[1]);
        fileRef = ref(storage, decodedPath);
      } else {
        throw new Error('Invalid storage reference');
      }
    }
    await deleteObject(fileRef);
    console.log('Firebase Storage file deleted successfully:', urlOrPath);
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'storage/object-not-found') {
      // File was already removed, return success
      return true;
    }
    console.warn('Firebase Storage delete warning:', error?.message);
    return false;
  }
}
