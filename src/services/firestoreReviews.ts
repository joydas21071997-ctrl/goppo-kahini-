import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { getGoppoFirestore } from './firestoreUser';
import { ItemReview, AudienceUser } from '../types';

/**
 * Real-time listener for reviews of a specific story in Firestore:
 * Path: `stories/{storyId}/reviews/{userId}`
 */
export function subscribeStoryReviews(
  storyId: string,
  onUpdate: (reviews: ItemReview[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (!storyId) {
    onUpdate([]);
    return () => {};
  }

  const db: Firestore | null = getGoppoFirestore();
  if (!db) {
    console.warn('Firestore database unavailable for story reviews.');
    onUpdate([]);
    return () => {};
  }

  try {
    const reviewsCol = collection(db, 'stories', storyId, 'reviews');

    const unsubscribe = onSnapshot(
      reviewsCol,
      (snapshot) => {
        const list: ItemReview[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            itemId: storyId,
            itemTitle: data.itemTitle || '',
            itemType: 'story' as const,
            userId: data.userId || docSnap.id,
            userName: data.userName || 'শ্রোতা',
            userEmail: data.userEmail || '',
            userPhotoURL: data.userPhotoURL || '',
            rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
            comment: data.comment || '',
            createdAt: data.createdAt
              ? typeof data.createdAt === 'string'
                ? data.createdAt
                : data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
              : new Date().toISOString(),
            updatedAt: data.updatedAt
              ? typeof data.updatedAt === 'string'
                ? data.updatedAt
                : data.updatedAt?.toDate?.()?.toISOString() || undefined
              : undefined,
            likes: Number(data.likes) || 0,
          };
        });

        // Sort: newest review first
        list.sort((a, b) => {
          const tA = new Date(a.updatedAt || a.createdAt).getTime();
          const tB = new Date(b.updatedAt || b.createdAt).getTime();
          return tB - tA;
        });

        onUpdate(list);
      },
      (error) => {
        console.warn(`Firestore reviews subscription error for story ${storyId}:`, error);
        if (onError) onError(error);
        onUpdate([]);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to set up reviews listener:', err);
    if (onError) onError(err);
    onUpdate([]);
    return () => {};
  }
}

/**
 * Fetch reviews once for a story.
 */
export async function getStoryReviewsOnce(storyId: string): Promise<ItemReview[]> {
  if (!storyId) return [];

  const db = getGoppoFirestore();
  if (!db) return [];

  try {
    const reviewsCol = collection(db, 'stories', storyId, 'reviews');
    const snapshot = await getDocs(reviewsCol);

    const list: ItemReview[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        itemId: storyId,
        itemTitle: data.itemTitle || '',
        itemType: 'story' as const,
        userId: data.userId || docSnap.id,
        userName: data.userName || 'শ্রোতা',
        userEmail: data.userEmail || '',
        userPhotoURL: data.userPhotoURL || '',
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        comment: data.comment || '',
        createdAt: data.createdAt
          ? typeof data.createdAt === 'string'
            ? data.createdAt
            : data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: data.updatedAt
          ? typeof data.updatedAt === 'string'
            ? data.updatedAt
            : data.updatedAt?.toDate?.()?.toISOString() || undefined
          : undefined,
        likes: Number(data.likes) || 0,
      };
    });

    list.sort((a, b) => {
      const tA = new Date(a.updatedAt || a.createdAt).getTime();
      const tB = new Date(b.updatedAt || b.createdAt).getTime();
      return tB - tA;
    });

    return list;
  } catch (error) {
    console.warn(`Failed to fetch reviews for story ${storyId}:`, error);
    return [];
  }
}

/**
 * Submits or updates a single user's rating & review for a story in Firestore.
 * Each user has exactly ONE review document at `stories/{storyId}/reviews/{userId}`.
 * If user already reviewed, updating overwrites/merges their existing review.
 */
export async function submitOrUpdateStoryReview(
  storyId: string,
  reviewData: {
    rating: number;
    comment: string;
    itemTitle?: string;
  },
  user: AudienceUser
): Promise<ItemReview> {
  if (!user || !user.uid) {
    throw new Error('রেটিং দেওয়ার জন্য আপনাকে অবশ্যই লগইন করতে হবে।');
  }

  if (!storyId) {
    throw new Error('Story ID পাওয়া যায়নি।');
  }

  const rating = Math.min(5, Math.max(1, Math.round(Number(reviewData.rating) || 5)));
  const comment = (reviewData.comment || '').trim();

  if (!comment) {
    throw new Error('অনুগ্রহ করে আপনার মূল্যবান মতামত বা মন্তব্য লিখুন।');
  }

  const db = getGoppoFirestore();
  if (!db) {
    throw new Error('Firestore ডেটাবেজ সংযোগ সক্রিয় নয়।');
  }

  const reviewDocRef = doc(db, 'stories', storyId, 'reviews', user.uid);

  // Check if previous document exists to preserve original createdAt and likes
  let prevCreatedAt: string | null = null;
  let prevLikes = 0;

  try {
    const existingSnap = await getDoc(reviewDocRef);
    if (existingSnap.exists()) {
      const exData = existingSnap.data();
      prevCreatedAt = exData.createdAt || null;
      prevLikes = typeof exData.likes === 'number' ? exData.likes : 0;
    }
  } catch (e) {
    console.warn('Could not check existing review doc:', e);
  }

  const now = new Date().toISOString();
  const displayName = user.displayName?.trim() || user.email?.split('@')[0] || 'শ্রোতা';

  const payload = {
    id: user.uid,
    storyId,
    itemId: storyId,
    itemTitle: reviewData.itemTitle || '',
    itemType: 'story',
    userId: user.uid,
    userName: displayName,
    userEmail: user.email || '',
    userPhotoURL: user.photoURL || '',
    rating,
    comment,
    createdAt: prevCreatedAt || now,
    updatedAt: now,
    likes: prevLikes,
  };

  await setDoc(reviewDocRef, payload, { merge: true });

  return {
    id: user.uid,
    itemId: storyId,
    itemTitle: reviewData.itemTitle || '',
    itemType: 'story',
    userId: user.uid,
    userName: displayName,
    userEmail: user.email || '',
    userPhotoURL: user.photoURL || '',
    rating,
    comment,
    createdAt: prevCreatedAt || now,
    updatedAt: now,
    likes: prevLikes,
  };
}

/**
 * Delete a user's own review.
 * Only the owner user or an admin can delete a review.
 */
export async function deleteStoryReview(
  storyId: string,
  reviewUserId: string,
  requestingUser: AudienceUser
): Promise<void> {
  if (!requestingUser || !requestingUser.uid) {
    throw new Error('অননুমোদিত অনুরোধ।');
  }

  const isOwner = requestingUser.uid === reviewUserId;
  const isAdmin = requestingUser.role === 'admin' || requestingUser.email === 'joydas.21071997@gmail.com';

  if (!isOwner && !isAdmin) {
    throw new Error('আপনি অন্য কারো রিভিউ ডিলিট করতে পারবেন না।');
  }

  const db = getGoppoFirestore();
  if (!db) {
    throw new Error('Firestore ডেটাবেজ সংযোগ সক্রিয় নয়।');
  }

  const reviewDocRef = doc(db, 'stories', storyId, 'reviews', reviewUserId);
  await deleteDoc(reviewDocRef);
}

/**
 * Helper to calculate average rating and review count from a list of reviews.
 * Returns 0 if there are no ratings/reviews.
 */
export function calculateReviewStats(reviews: ItemReview[]): {
  averageRating: number;
  totalCount: number;
} {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalCount: 0 };
  }

  const validRatings = reviews.filter((r) => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  if (validRatings.length === 0) {
    return { averageRating: 0, totalCount: 0 };
  }

  const sum = validRatings.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sum / validRatings.length).toFixed(1));

  return {
    averageRating: avg,
    totalCount: validRatings.length,
  };
}
