import { getGoppoFirestore } from './firestoreUser';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface PushNotificationRegistrationResult {
  success: boolean;
  token?: string;
  error?: string;
  platform: 'web' | 'android' | 'ios' | 'unknown';
}

/**
 * Initializes and registers push notifications across Web and Android (Capacitor).
 * Web-safe and gracefully handles environments where PushNotifications plugin is not present.
 */
export async function initializePushNotifications(userId?: string): Promise<PushNotificationRegistrationResult> {
  if (typeof window === 'undefined') {
    return { success: false, platform: 'unknown', error: 'Window not defined' };
  }

  // 1. Detect if running inside native Capacitor (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Request native notification permission
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        // Register Android Notification Channel with high importance
        try {
          await PushNotifications.createChannel({
            id: 'goppo_kahini_channel',
            name: 'গপ্পো কাহিনী অডিও গল্প ও সিরিজ',
            description: 'নতুন গল্প, ধারাবাহিক নাটক এবং বিশেষ অডিও আপডেটের নোটিফিকেশন',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
            lightColor: '#e11d48',
          });
        } catch (channelErr) {
          console.warn('Android notification channel setup notice:', channelErr);
        }

        // Register with FCM
        await PushNotifications.register();

        return new Promise((resolve) => {
          PushNotifications.addListener('registration', async (token) => {
            console.log('[FCM] Native Registration Token:', token.value);
            if (userId) {
              await saveFcmTokenToFirestore(userId, token.value, 'android');
            }
            resolve({ success: true, token: token.value, platform: 'android' });
          });

          PushNotifications.addListener('registrationError', (error) => {
            console.warn('[FCM] Native Registration error:', error);
            resolve({ success: false, error: JSON.stringify(error), platform: 'android' });
          });

          // Handle incoming notifications while app is in foreground
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('[FCM] Push received in foreground:', notification);
          });

          // Handle user clicking on a notification
          PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            const data = action.notification.data;
            if (data?.url && typeof window !== 'undefined') {
              window.location.href = data.url;
            }
          });
        });
      } else {
        return { success: false, platform: 'android', error: 'Notification permission denied' };
      }
    } catch (nativeErr) {
      console.warn('Capacitor native push notifications notice:', nativeErr);
      return { success: false, platform: 'android', error: String(nativeErr) };
    }
  }

  // 2. Web / PWA Notification flow
  if ('Notification' in window) {
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        console.log('[Push] Web Notification permission granted.');
        return { success: true, platform: 'web' };
      } else {
        return { success: false, platform: 'web', error: 'Permission not granted' };
      }
    } catch (webErr) {
      console.warn('Web notification request error:', webErr);
      return { success: false, platform: 'web', error: String(webErr) };
    }
  }

  return { success: true, platform: 'unknown', error: 'Fallback in-app notification active' };
}

/**
 * Saves FCM Token to Firestore under user document.
 */
export async function saveFcmTokenToFirestore(
  userId: string,
  token: string,
  platform: 'web' | 'android' | 'ios'
): Promise<void> {
  const db = getGoppoFirestore();
  if (!db || !userId || !token) return;

  try {
    const tokenDocRef = doc(db, 'users', userId, 'fcm_tokens', token.slice(0, 32));
    await setDoc(tokenDocRef, {
      token,
      platform,
      userId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving FCM token to Firestore:', err);
  }
}
