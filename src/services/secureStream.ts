import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseAppInstance } from './firebaseConfig';

export interface StreamUrlResponse {
  streamUrl: string;
  expiresAt: number | null;
  accessType: string;
  storagePath?: string;
}

// In-memory cache for temporary signed stream URLs to avoid redundant Cloud Function calls during continuous listening
const streamUrlCache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Fetches a secure, time-limited playback stream URL from the trusted Firebase Cloud Function.
 * The backend verifies:
 * 1. User authentication
 * 2. Active ₹20 Main Access Pass
 * 3. Individual episode purchase
 * 
 * Free / Trailer episodes or Super Admin calls are resolved without restrictions.
 */
export async function getSecureEpisodeStreamUrl(seriesId: string, episodeId: string): Promise<string> {
  const cacheKey = `ep_${seriesId}_${episodeId}`;
  const cached = streamUrlCache.get(cacheKey);
  const now = Date.now();

  // If cached and at least 60 seconds before expiration, reuse it
  if (cached && cached.expiresAt > now + 60000) {
    return cached.url;
  }

  const app = getFirebaseAppInstance();
  const functions = getFunctions(app);
  const fetchStreamUrl = httpsCallable<{ seriesId: string; episodeId: string }, StreamUrlResponse>(
    functions,
    'getEpisodeStreamUrl'
  );

  try {
    const result = await fetchStreamUrl({ seriesId, episodeId });
    const data = result.data;
    if (!data || !data.streamUrl) {
      throw new Error('অডিও স্ট্রিম লিঙ্ক সংগ্রহ করা সম্ভব হয়নি।');
    }

    if (data.expiresAt) {
      streamUrlCache.set(cacheKey, { url: data.streamUrl, expiresAt: data.expiresAt });
    }

    return data.streamUrl;
  } catch (err: any) {
    console.error('getSecureEpisodeStreamUrl error:', err);
    const message = err?.message || 'অডিও স্ট্রিম লোড করতে সমস্যা হয়েছে।';
    throw new Error(message);
  }
}

/**
 * Fetches a secure stream URL for a standalone story if needed.
 */
export async function getSecureStoryStreamUrl(storyId: string): Promise<string> {
  const cacheKey = `story_${storyId}`;
  const cached = streamUrlCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now + 60000) {
    return cached.url;
  }

  const app = getFirebaseAppInstance();
  const functions = getFunctions(app);
  const fetchStreamUrl = httpsCallable<{ storyId: string }, StreamUrlResponse>(
    functions,
    'getEpisodeStreamUrl'
  );

  try {
    const result = await fetchStreamUrl({ storyId });
    const data = result.data;
    if (!data || !data.streamUrl) {
      throw new Error('অডিও স্ট্রিম লিঙ্ক সংগ্রহ করা সম্ভব হয়নি।');
    }

    if (data.expiresAt) {
      streamUrlCache.set(cacheKey, { url: data.streamUrl, expiresAt: data.expiresAt });
    }

    return data.streamUrl;
  } catch (err: any) {
    console.error('getSecureStoryStreamUrl error:', err);
    const message = err?.message || 'অডিও স্ট্রিম লোড করতে সমস্যা হয়েছে।';
    throw new Error(message);
  }
}
