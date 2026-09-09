import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { getGoppoFirestore } from './firestoreUser';
import { Story } from '../types';
import { INITIAL_STORIES } from '../data/stories';
import { deleteStorageFileByUrl } from './firebaseStorage';
import { ensureAdminFirebaseAuth } from './adminAuth';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Stories Error:', JSON.stringify(errInfo));
}

/**
 * Real-time listener for the `stories` collection in Cloud Firestore.
 * Notifies the callback whenever a story is added, edited, or deleted.
 * Falls back to local initial stories if Firestore is offline or empty.
 */
export function subscribeStoriesFromFirestore(
  onUpdate: (stories: Story[]) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    console.warn('Firestore instance not available, using offline storage');
    return () => {};
  }

  const storiesCol = collection(db, 'stories');

  try {
    const unsubscribe = onSnapshot(
      storiesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Story[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title: data.title || 'শিরোনামহীন গল্প',
              tagline: data.tagline || '',
              description: data.description || '',
              author: data.author || 'অজানা লেখক',
              narrator: data.narrator || 'কথক',
              voiceStyle: data.voiceStyle || 'deep',
              genre: data.genre || 'ভৌতিক ও অলৌকিক',
              lengthCategory: data.lengthCategory || 'standard',
              duration: Number(data.duration) || 300,
              isLittlePassOnly: Boolean(data.isLittlePassOnly),
              pricingType: data.pricingType || (data.isLittlePassOnly ? 'paid' : 'free'),
              singlePurchasePrice: data.singlePurchasePrice ? Number(data.singlePurchasePrice) : undefined,
              audioUrl: data.audioUrl || '',
              audioFileName: data.audioFileName || '',
              coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
              colorGradient: data.colorGradient || 'from-purple-900 to-indigo-950',
              releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
              rating: Number(data.rating) || 5.0,
              listenCount: Number(data.listenCount) || 0,
              chapters: Array.isArray(data.chapters) ? data.chapters : [],
              transcript: Array.isArray(data.transcript) ? data.transcript : [],
              fullStoryText: data.fullStoryText || '',
              createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
            });
          });

          // Sort by listenCount or releaseDate
          list.sort((a, b) => (b.listenCount || 0) - (a.listenCount || 0));
          onUpdate(list);
        } else {
          // If Firestore collection has 0 stories, signal empty
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'stories');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'stories');
    return () => {};
  }
}

/**
 * One-time fetch of all audio stories from Firestore `stories` collection
 */
export async function fetchStoriesFromFirestore(): Promise<Story[]> {
  const db = getGoppoFirestore();
  if (!db) return [];

  try {
    const storiesCol = collection(db, 'stories');
    const snap = await getDocs(storiesCol);
    if (snap.empty) return [];

    const list: Story[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        title: data.title || '',
        tagline: data.tagline || '',
        description: data.description || '',
        author: data.author || '',
        narrator: data.narrator || '',
        voiceStyle: data.voiceStyle || 'deep',
        genre: data.genre || 'ভৌতিক ও অলৌকিক',
        lengthCategory: data.lengthCategory || 'standard',
        duration: Number(data.duration) || 0,
        isLittlePassOnly: Boolean(data.isLittlePassOnly),
        pricingType: data.pricingType,
        singlePurchasePrice: data.singlePurchasePrice,
        audioUrl: data.audioUrl || '',
        audioFileName: data.audioFileName || '',
        coverImage: data.coverImage || '',
        colorGradient: data.colorGradient || '',
        releaseDate: data.releaseDate || '',
        rating: Number(data.rating) || 5,
        listenCount: Number(data.listenCount) || 0,
        chapters: Array.isArray(data.chapters) ? data.chapters : [],
        transcript: Array.isArray(data.transcript) ? data.transcript : [],
        fullStoryText: data.fullStoryText || '',
      });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'stories');
    return [];
  }
}

/**
 * Saves or updates an audio story in Firestore at `stories/{storyId}`.
 * Strictly validates that required fields and a valid Firebase Storage audioUrl are present.
 */
export async function saveStoryToFirestore(story: Story): Promise<{ success: boolean; id: string; error?: string }> {
  // Ensure Admin Firebase Auth session is active
  await ensureAdminFirebaseAuth();

  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  if (!story.title || !story.title.trim()) {
    throw new Error('গল্পের শিরোনাম আবশ্যক।');
  }
  if (!story.audioUrl || !story.audioUrl.trim()) {
    throw new Error('গল্পের অডিও ফাইল আবশ্যক।');
  }
  if (story.audioUrl.startsWith('blob:')) {
    throw new Error('লোকাল ব্লব (Blob) লিঙ্ক ফায়ারবেসে সেভ করা যাবে না। অনুগ্রহ করে অডিও ফাইলটি সম্পূর্ণ আপলোড হওয়া পর্যন্ত অপেক্ষা করুন।');
  }

  const storyDocRef = doc(db, 'stories', story.id);
  try {
    const payload = {
      id: story.id,
      title: story.title.trim(),
      tagline: (story.tagline || '').trim(),
      description: (story.description || '').trim(),
      author: (story.author || '').trim(),
      narrator: (story.narrator || 'কথক').trim(),
      voiceStyle: story.voiceStyle || 'deep',
      genre: story.genre || 'ভৌতিক ও অলৌকিক',
      lengthCategory: story.lengthCategory || 'standard',
      duration: Math.round(Number(story.duration) || 0),
      isLittlePassOnly: Boolean(story.isLittlePassOnly),
      pricingType: story.pricingType || (story.isLittlePassOnly ? 'paid' : 'free'),
      singlePurchasePrice: story.singlePurchasePrice ? Number(story.singlePurchasePrice) : (story.isLittlePassOnly ? 20 : 0),
      audioUrl: story.audioUrl,
      audioFileName: story.audioFileName || '',
      coverImage: story.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      colorGradient: story.colorGradient || 'from-purple-900 to-indigo-950',
      releaseDate: story.releaseDate || new Date().toISOString().split('T')[0],
      rating: Number(story.rating) || 5.0,
      listenCount: Number(story.listenCount) || 0,
      chapters: Array.isArray(story.chapters) ? story.chapters : [],
      transcript: Array.isArray(story.transcript) ? story.transcript : [],
      fullStoryText: story.fullStoryText || '',
      createdAt: story.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(storyDocRef, payload, { merge: true });
    return { success: true, id: story.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `stories/${story.id}`);
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`ফায়ারস্টোরে গল্প সংরক্ষণ ব্যর্থ: ${msg}`);
  }
}

/**
 * Deletes a story document from Firestore and purges its associated
 * audio file and cover image from Firebase Storage.
 */
export async function deleteStoryFromFirestore(
  storyId: string,
  audioUrl?: string,
  coverImage?: string
): Promise<{ success: boolean; error?: string }> {
  // Ensure Admin Firebase Auth session is active
  await ensureAdminFirebaseAuth();

  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  const storyDocRef = doc(db, 'stories', storyId);

  let fileAudioUrl = audioUrl;
  let fileCoverUrl = coverImage;

  // If audioUrl or coverImage was not passed, fetch the document first
  if (!fileAudioUrl || !fileCoverUrl) {
    try {
      const snap = await getDoc(storyDocRef);
      if (snap.exists()) {
        const data = snap.data();
        fileAudioUrl = fileAudioUrl || data.audioUrl;
        fileCoverUrl = fileCoverUrl || data.coverImage;
      }
    } catch (e) {
      console.warn('Could not read story document before deletion:', e);
    }
  }

  try {
    // 1. Delete document from Firestore
    await deleteDoc(storyDocRef);

    // 2. Delete audio file from Firebase Storage
    if (fileAudioUrl) {
      await deleteStorageFileByUrl(fileAudioUrl);
    }

    // 3. Delete cover image from Firebase Storage if it's hosted there
    if (fileCoverUrl) {
      await deleteStorageFileByUrl(fileCoverUrl);
    }

    return { success: true };
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `stories/${storyId}`);
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`গল্প ডিলিট করতে সমস্যা হয়েছে: ${msg}`);
  }
}

/**
 * Seeds or backs up default stories to Firestore `stories` collection.
 */
export async function seedInitialStoriesToFirestore(
  customStories?: Story[]
): Promise<{ success: boolean; count: number; message: string }> {
  await ensureAdminFirebaseAuth();

  const db = getGoppoFirestore();
  if (!db) {
    return { success: false, count: 0, message: 'ফায়ারবেস ডেটাবেস পাওয়া যায়নি।' };
  }

  const listToSeed = customStories && customStories.length > 0 ? customStories : INITIAL_STORIES;

  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const story of listToSeed) {
      const ref = doc(db, 'stories', story.id);
      batch.set(
        ref,
        {
          ...story,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      count++;
    }

    await batch.commit();
    return {
      success: true,
      count,
      message: `সফলভাবে ${count}টি অডিও গল্প ফায়ারবেস ক্লাউড ডেটাবেসে ব্যাকআপ ও সিঙ্ক করা হয়েছে!`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    handleFirestoreError(err, OperationType.WRITE, 'stories');
    return {
      success: false,
      count: 0,
      message: `ফায়ারবেসে ব্যাকআপ সিঙ্ক করতে ত্রুটি: ${msg}`,
    };
  }
}
