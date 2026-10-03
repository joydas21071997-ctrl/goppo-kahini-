import { Story, Series, Episode } from '../types';
import { getGoppoFirestore } from './firestoreUser';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface AppNotification {
  id?: string;
  type: 'story' | 'episode';
  title: string;
  body: string;
  targetId: string;
  seriesId?: string;
  episodeId?: string;
  url: string;
  createdAt: string;
  isRead?: boolean;
}

/**
 * Sends a notification for a newly published standalone audio story.
 * (PRESERVED: Maintains existing notifyNewStory contract)
 */
export async function notifyNewStory(story: Story): Promise<{ success: boolean; id?: string }> {
  const title = '🔔 নতুন গল্প প্রকাশিত!';
  const body = `${story.title} — ${story.author}\nএখনই শুনুন গপ্পো কাহিনীতে।`;
  const url = `/?story=${story.id}`;

  try {
    // 1. Dispatch Web Notification if permitted in the browser
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: story.coverImage || '/logo.png',
          data: { url },
        });
      } catch (e) {
        console.warn('Web notification dispatch failed:', e);
      }
    }

    // 2. Persist in Firestore notifications log
    const db = getGoppoFirestore();
    if (db) {
      const notifRef = collection(db, 'system_notifications');
      await addDoc(notifRef, {
        type: 'story',
        title,
        body,
        targetId: story.id,
        url,
        createdAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error dispatching notifyNewStory:', err);
    return { success: false };
  }
}

/**
 * Sends a notification when a NEW Series Episode is PUBLISHED.
 * 
 * Rules enforced:
 * 1. Every new Episode sends its own distinct notification with Series Title, Episode Number, and Episode Title.
 * 2. Duplicate notification protection: Checks notificationSent flag.
 * 3. Formats body dynamically according to Free vs Paid access.
 * 4. Deep link points to /series/{seriesId}/episode/{episodeId}.
 */
export async function notifyNewEpisode(
  series: Series,
  episode: Episode
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  // 1. Duplicate Notification Protection
  // If notification has already been sent, or if episode is draft/archived, do NOT send.
  if (episode.notificationSent) {
    console.log(`[Notification] Skipped: Notification already sent for Episode ${episode.id}`);
    return { success: true, skipped: true };
  }

  if (episode.status !== 'published') {
    console.log(`[Notification] Skipped: Episode ${episode.id} status is ${episode.status} (not published)`);
    return { success: true, skipped: true };
  }

  const title = '🔔 নতুন এপিসোড প্রকাশিত!';
  
  // Format body dynamically according to Free vs Paid tier
  let body = '';
  if (episode.accessType === 'paid') {
    body = `${series.title} — Episode ${episode.episodeNumber}\n"${episode.title}"\nএই পর্বটি শুনতে ₹${episode.price || 5} দিয়ে Unlock করুন।`;
  } else if (episode.accessType === 'trailer') {
    body = `${series.title} — Episode ${episode.episodeNumber}\n"${episode.title}"\nনতুন ট্রেলার পর্ব এখন শুনুন।`;
  } else {
    body = `${series.title} — Episode ${episode.episodeNumber}\n"${episode.title}"\nনতুন পর্ব এখন শুনুন।`;
  }

  const deepLink = `/series/${series.id}/episode/${episode.id}`;

  try {
    // 2. Trigger Browser/PWA native push notification if active
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: episode.thumbnail || series.thumbnail || '/logo.png',
          badge: '/favicon-32x32.png',
          tag: `episode-${episode.id}`,
          data: { url: deepLink },
        });

        notif.onclick = () => {
          window.focus();
          if (typeof window !== 'undefined') {
            window.location.href = deepLink;
          }
        };
      } catch (err) {
        console.warn('Native notification prompt error:', err);
      }
    }

    // 3. Persist notification in Firestore `system_notifications`
    const db = getGoppoFirestore();
    if (db) {
      try {
        const notifCol = collection(db, 'system_notifications');
        await addDoc(notifCol, {
          type: 'episode',
          seriesId: series.id,
          seriesTitle: series.title,
          episodeId: episode.id,
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.title,
          title,
          body,
          url: deepLink,
          accessType: episode.accessType,
          price: episode.price || 0,
          createdAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('Could not record notification in Firestore:', dbErr);
      }

      // 4. Mark Episode notificationSent = true in Firestore
      try {
        const epDocRef = doc(db, 'series', series.id, 'episodes', episode.id);
        await updateDoc(epDocRef, {
          notificationSent: true,
          updatedAt: serverTimestamp(),
        });
      } catch (epUpdateErr) {
        // Fallback for top-level collection if used
        try {
          const topEpRef = doc(db, 'episodes', episode.id);
          await updateDoc(topEpRef, {
            notificationSent: true,
            updatedAt: serverTimestamp(),
          });
        } catch {}
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error sending episode notification:', errorMsg);
    return { success: false, error: errorMsg };
  }
}
