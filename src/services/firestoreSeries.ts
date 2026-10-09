import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { getGoppoFirestore } from './firestoreUser';
import { Series, Episode } from '../types';
import { INITIAL_SERIES, INITIAL_SERIES_EPISODES } from '../data/seriesData';
import { deleteStorageFileByUrl } from './firebaseStorage';
import { ensureAdminFirebaseAuth } from './adminAuth';
import { notifyNewEpisode } from './notificationService';

/**
 * Validates a Series entity according to system integrity rules.
 */
export function validateSeriesData(series: Partial<Series>): string[] {
  const errors: string[] = [];
  if (!series.title || !series.title.trim()) {
    errors.push('সিরিজের শিরোনাম (Title) আবশ্যক।');
  }
  if (!series.description || !series.description.trim()) {
    errors.push('সিরিজের বিবরণ (Description) আবশ্যক।');
  }
  if (!series.category || !series.category.trim()) {
    errors.push('সিরিজের ক্যাটাগরি আবশ্যক।');
  }
  if (!series.author || !series.author.trim()) {
    errors.push('সিরিজের লেখকের নাম আবশ্যক।');
  }
  return errors;
}

/**
 * Validates an Episode entity (Rule 24):
 * - Missing Series
 * - Missing Episode number
 * - Duplicate Episode number inside a Series
 * - Negative price
 * - Paid Episode without price
 * - Published Episode without audio
 * - Invalid status
 */
export function validateEpisodeData(
  episode: Partial<Episode>,
  existingEpisodes: Episode[] = []
): string[] {
  const errors: string[] = [];

  if (!episode.seriesId || !episode.seriesId.trim()) {
    errors.push('সিরিজ আইডি অনুপস্থিত (Missing Series)।');
  }

  if (episode.episodeNumber === undefined || episode.episodeNumber === null || episode.episodeNumber <= 0) {
    errors.push('সঠিক পর্ব নম্বর প্রদান করুন (Missing or Invalid Episode Number)।');
  }

  // Check duplicate episode number in the same series (exclude current episode when editing)
  if (episode.episodeNumber !== undefined) {
    const isDuplicate = existingEpisodes.some(
      (ep) => ep.episodeNumber === Number(episode.episodeNumber) && ep.id !== episode.id
    );
    if (isDuplicate) {
      errors.push(`এই সিরিজে ইতিমধ্যে পর্ব নম্বর ${episode.episodeNumber} রয়েছে (Duplicate Episode Number)।`);
    }
  }

  if (!episode.title || !episode.title.trim()) {
    errors.push('পর্বের শিরোনাম আবশ্যক (Missing Episode Title)।');
  }

  // Access type and price validation
  if (episode.accessType === 'paid') {
    if (episode.price === undefined || episode.price === null || isNaN(Number(episode.price))) {
      errors.push('পেইড পর্বের মূল্য নির্ধারণ করুন (Paid Episode without price)।');
    } else if (Number(episode.price) < 0) {
      errors.push('মূল্য ঋণাত্মক হতে পারে না (Negative Price)।');
    }
  }

  // Published audio requirement
  if (episode.status === 'published') {
    if (episode.accessType === 'paid') {
      const hasAudio = (episode.storagePath && episode.storagePath.trim()) || (episode.audioUrl && episode.audioUrl.trim());
      if (!hasAudio) {
        errors.push('প্রকাশিত পেইড পর্বের জন্য সুরক্ষিত অডিও ফাইল আবশ্যক (Published Paid Episode without audio file)।');
      }
    } else {
      if (!episode.audioUrl || !episode.audioUrl.trim()) {
        errors.push('প্রকাশিত পর্বের জন্য অডিও ফাইল আবশ্যক (Published Episode without audio)।');
      }
    }
    if (episode.audioUrl && episode.audioUrl.startsWith('blob:')) {
      errors.push('লোকাল ব্লব লিঙ্ক সার্ভারে সেভ করা যাবে না। অডিও সম্পূর্ণ আপলোড হওয়া পর্যন্ত অপেক্ষা করুন।');
    }
  }

  const validStatuses = ['draft', 'scheduled', 'published', 'archived'];
  if (episode.status && !validStatuses.includes(episode.status)) {
    errors.push('অবৈধ পর্ব স্ট্যাটাস (Invalid status)।');
  }

  return errors;
}

/**
 * Real-time subscription to the `series` collection in Cloud Firestore.
 * Falls back to INITIAL_SERIES if Firestore is empty or offline.
 */
export function subscribeSeriesFromFirestore(
  onUpdate: (seriesList: Series[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    onUpdate(INITIAL_SERIES);
    return () => {};
  }

  try {
    const seriesCol = collection(db, 'series');
    const unsubscribe = onSnapshot(
      seriesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Series[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              description: data.description || '',
              thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
              category: data.category || 'ধারাবাহিক নাটক',
              genre: data.genre || 'ভৌতিক ও অলৌকিক',
              author: data.author || 'জয় (Joy)',
              status: data.status || 'published',
              featured: Boolean(data.featured),
              sortOrder: Number(data.sortOrder) || 0,
              episodesCount: Number(data.episodesCount) || 0,
              createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
              updatedAt: data.updatedAt ? (typeof data.updatedAt === 'string' ? data.updatedAt : data.updatedAt.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          onUpdate(list);
        } else {
          // If empty, return initial series
          onUpdate(INITIAL_SERIES);
        }
      },
      (error) => {
        console.warn('Firestore series subscription error:', error);
        if (onError) onError(error);
        onUpdate(INITIAL_SERIES);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('subscribeSeriesFromFirestore error:', err);
    onUpdate(INITIAL_SERIES);
    return () => {};
  }
}

/**
 * Saves or updates a Series document in Firestore.
 */
export async function saveSeriesToFirestore(
  series: Series
): Promise<{ success: boolean; id: string; error?: string }> {
  await ensureAdminFirebaseAuth().catch(() => {});
  const validationErrors = validateSeriesData(series);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(' • '));
  }

  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  const seriesRef = doc(db, 'series', series.id);
  const payload = {
    id: series.id,
    title: series.title.trim(),
    description: series.description.trim(),
    thumbnail: series.thumbnail.trim(),
    category: series.category.trim(),
    genre: series.genre.trim(),
    author: series.author.trim(),
    status: series.status || 'published',
    featured: Boolean(series.featured),
    sortOrder: Number(series.sortOrder) || 0,
    episodesCount: Number(series.episodesCount) || 0,
    createdAt: series.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(seriesRef, payload, { merge: true });
    return { success: true, id: series.id };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'permission-denied') {
      throw new Error('সিরিজ সংরক্ষণে অনুমতি নেই। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট হিসেবে লগইন নিশ্চিত করুন।');
    }
    throw new Error(`সিরিজ সংরক্ষণে ত্রুটি: ${error?.message || err}`);
  }
}

/**
 * Deletes a Series document and all associated subcollection episodes.
 */
export async function deleteSeriesFromFirestore(
  seriesId: string
): Promise<{ success: boolean; error?: string }> {
  await ensureAdminFirebaseAuth().catch(() => {});
  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  const seriesRef = doc(db, 'series', seriesId);

  // Clean up episodes subcollection
  try {
    const epCol = collection(db, 'series', seriesId, 'episodes');
    const epSnap = await getDocs(epCol);
    for (const epDoc of epSnap.docs) {
      const data = epDoc.data();
      if (data.audioUrl) await deleteStorageFileByUrl(data.audioUrl).catch(() => {});
      if (data.storagePath) await deleteStorageFileByUrl(data.storagePath).catch(() => {});
      if (data.thumbnail) await deleteStorageFileByUrl(data.thumbnail).catch(() => {});
      await deleteDoc(epDoc.ref).catch(() => {});
    }
  } catch (err) {
    console.warn('Error clearing series episodes:', err);
  }

  try {
    await deleteDoc(seriesRef);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'permission-denied') {
      throw new Error('সিরিজ মুছতে অনুমতি নেই। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট হিসেবে লগইন নিশ্চিত করুন।');
    }
    throw new Error(`সিরিজ মুছতে ত্রুটি: ${error?.message || err}`);
  }
}

/**
 * Real-time subscription to episodes for a specific series.
 */
export function subscribeEpisodesForSeries(
  seriesId: string,
  onUpdate: (episodes: Episode[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getGoppoFirestore();
  const defaultList = INITIAL_SERIES_EPISODES[seriesId] || [];

  if (!db) {
    onUpdate(defaultList);
    return () => {};
  }

  try {
    const epCol = collection(db, 'series', seriesId, 'episodes');
    const q = query(epCol, orderBy('episodeNumber', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Episode[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              seriesId: data.seriesId || seriesId,
              episodeNumber: Number(data.episodeNumber) || 1,
              title: data.title || '',
              description: data.description || '',
              audioUrl: data.audioUrl || '',
              storagePath: data.storagePath || '',
              thumbnail: data.thumbnail || '',
              duration: Number(data.duration) || 0,
              accessType: data.accessType || 'free',
              price: data.price !== undefined ? Number(data.price) : (data.accessType === 'paid' ? 5 : 0),
              currency: data.currency || 'INR',
              status: data.status || 'published',
              publishedAt: data.publishedAt || '',
              scheduledAt: data.scheduledAt || '',
              notificationEnabled: data.notificationEnabled !== false,
              notificationSent: Boolean(data.notificationSent),
              createdAt: data.createdAt ? (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
              updatedAt: data.updatedAt ? (typeof data.updatedAt === 'string' ? data.updatedAt : data.updatedAt.toDate?.()?.toISOString() || new Date().toISOString()) : new Date().toISOString(),
              sortOrder: Number(data.sortOrder) || Number(data.episodeNumber) || 1,
            });
          });
          onUpdate(list);
        } else {
          onUpdate(defaultList);
        }
      },
      (error) => {
        console.warn(`Error subscribing to episodes for series ${seriesId}:`, error);
        if (onError) onError(error);
        onUpdate(defaultList);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('subscribeEpisodesForSeries error:', err);
    onUpdate(defaultList);
    return () => {};
  }
}

/**
 * Saves or updates an Episode in Firestore.
 * 
 * Enforces:
 * 1. Data validation (Rule 24).
 * 2. Updating parent series `episodesCount`.
 * 3. Notification dispatch when newly published (Rule 15, 16, 17):
 *    If status === 'published' and notificationSent is false and notificationEnabled is true:
 *    Triggers notifyNewEpisode and marks notificationSent = true.
 */
export async function saveEpisodeToFirestore(
  series: Series,
  episode: Episode,
  existingEpisodes: Episode[] = []
): Promise<{ success: boolean; id: string; error?: string }> {
  await ensureAdminFirebaseAuth().catch(() => {});

  const validationErrors = validateEpisodeData(episode, existingEpisodes);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(' • '));
  }

  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  const epDocRef = doc(db, 'series', series.id, 'episodes', episode.id);

  const shouldSendNotification =
    episode.status === 'published' &&
    !episode.notificationSent &&
    episode.notificationEnabled !== false;

  const payload: Record<string, any> = {
    id: episode.id,
    seriesId: series.id,
    episodeNumber: Number(episode.episodeNumber),
    title: episode.title.trim(),
    description: (episode.description || '').trim(),
    audioUrl: episode.accessType === 'paid' ? '' : (episode.audioUrl || '').trim(),
    storagePath: (episode.storagePath || '').trim(),
    thumbnail: (episode.thumbnail || series.thumbnail || '').trim(),
    duration: Math.round(Number(episode.duration) || 0),
    accessType: episode.accessType || 'free',
    price: episode.accessType === 'paid' ? Number(episode.price || 5) : 0,
    currency: episode.currency || 'INR',
    status: episode.status || 'draft',
    publishedAt: episode.status === 'published' ? (episode.publishedAt || new Date().toISOString()) : (episode.publishedAt || ''),
    scheduledAt: episode.scheduledAt || '',
    notificationEnabled: episode.notificationEnabled !== false,
    notificationSent: Boolean(episode.notificationSent),
    createdAt: episode.createdAt || new Date().toISOString(),
    updatedAt: serverTimestamp(),
    sortOrder: Number(episode.sortOrder) || Number(episode.episodeNumber),
  };

  try {
    await setDoc(epDocRef, payload, { merge: true });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'permission-denied') {
      throw new Error('পর্ব সংরক্ষণে অনুমতি নেই। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট হিসেবে লগইন নিশ্চিত করুন।');
    }
    throw new Error(`পর্ব সংরক্ষণে ত্রুটি: ${error?.message || err}`);
  }

  // Update Series episodesCount
  try {
    const seriesRef = doc(db, 'series', series.id);
    const updatedCount = Math.max(series.episodesCount || 0, existingEpisodes.length + (existingEpisodes.some(e => e.id === episode.id) ? 0 : 1));
    await setDoc(seriesRef, { episodesCount: updatedCount, updatedAt: serverTimestamp() }, { merge: true });
  } catch (countErr) {
    console.warn('Could not update series episodesCount:', countErr);
  }

  // Trigger Notification if newly published
  if (shouldSendNotification) {
    try {
      await notifyNewEpisode(series, { ...episode, notificationSent: false });
    } catch (notifErr) {
      console.warn('Notification dispatch error on saveEpisode:', notifErr);
    }
  }

  return { success: true, id: episode.id };
}

/**
 * Deletes an Episode document from Firestore and its media storage.
 */
export async function deleteEpisodeFromFirestore(
  seriesId: string,
  episodeId: string,
  audioUrl?: string,
  thumbnail?: string,
  storagePath?: string
): Promise<{ success: boolean; error?: string }> {
  await ensureAdminFirebaseAuth().catch(() => {});
  const db = getGoppoFirestore();
  if (!db) throw new Error('ফায়ারবেস ডেটাবেস সংযোগ পাওয়া যায়নি।');

  const epDocRef = doc(db, 'series', seriesId, 'episodes', episodeId);

  try {
    if (audioUrl) await deleteStorageFileByUrl(audioUrl).catch(() => {});
    if (storagePath) await deleteStorageFileByUrl(storagePath).catch(() => {});
    if (thumbnail) await deleteStorageFileByUrl(thumbnail).catch(() => {});
    await deleteDoc(epDocRef);
    return { success: true };
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'permission-denied') {
      throw new Error('পর্ব মুছতে অনুমতি নেই। অনুগ্রহ করে অ্যাডমিন অ্যাকাউন্ট হিসেবে লগইন নিশ্চিত করুন।');
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`এপিসোড মুছে ফেলতে ত্রুটি: ${msg}`);
  }
}
