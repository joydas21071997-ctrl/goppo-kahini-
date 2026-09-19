import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebaseConfig';
import { UserContactMessage } from '../types';

export const INBOX_STORAGE_KEY = 'goppo_contact_messages';
export const DELETED_MSGS_STORAGE_KEY = 'goppo_deleted_contact_message_ids';

/**
 * Returns set of IDs that have been explicitly deleted by admin
 */
export function getDeletedMessageIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MSGS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {}
  return new Set();
}

/**
 * Records an ID as permanently deleted
 */
export function recordMessageAsDeleted(id: string): void {
  try {
    const set = getDeletedMessageIds();
    set.add(id);
    localStorage.setItem(DELETED_MSGS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Error recording deleted message ID:', err);
  }
}

/**
 * Normalizes any contact message object so it has both
 * senderName/userName, senderEmail/userEmail, and safe date/read status fields.
 */
export function normalizeContactMessage(raw: any): UserContactMessage {
  const senderName = raw.senderName || raw.userName || 'নামহীন শ্রোতা';
  const senderEmail = raw.senderEmail || raw.userEmail || 'ইমেইল নেই';
  const senderPhone = raw.senderPhone || raw.userPhone || '';
  const message = raw.message || raw.body || '';
  const category = raw.category || 'general_feedback';
  const id = raw.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const status = raw.status === 'read' || raw.status === 'replied' ? raw.status : (raw.isRead ? 'read' : 'unread');
  const isRead = status === 'read' || status === 'replied' || raw.isRead === true;
  
  // Format readable timestamp
  let timestamp = raw.timestamp;
  if (!timestamp) {
    if (raw.createdAt) {
      try {
        const d = new Date(raw.createdAt);
        if (!isNaN(d.getTime())) {
          timestamp = `${d.toLocaleDateString('bn-BD')} ${d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
        }
      } catch {}
    }
  }
  if (!timestamp) {
    timestamp = `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return {
    id,
    senderName,
    senderEmail,
    senderPhone: senderPhone || undefined,
    userName: senderName,
    userEmail: senderEmail,
    userPhone: senderPhone || undefined,
    category,
    subject: raw.subject || '',
    message,
    timestamp,
    createdAt: raw.createdAt || new Date().toISOString(),
    status,
    isRead,
  };
}

/**
 * Retrieves cached messages from local storage safely, omitting deleted IDs
 */
export function getLocalCachedMessages(): UserContactMessage[] {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const deletedIds = getDeletedMessageIds();
      return parsed
        .filter((m) => m && m.id && !deletedIds.has(m.id))
        .map(normalizeContactMessage);
    }
    return [];
  } catch (err) {
    console.error('Error reading local contact messages:', err);
    return [];
  }
}

/**
 * Saves messages to local storage and broadcasts update event
 */
export function setLocalCachedMessages(messages: UserContactMessage[]): void {
  try {
    const deletedIds = getDeletedMessageIds();
    const filtered = messages.filter((m) => m && m.id && !deletedIds.has(m.id));
    const normalized = filtered.map(normalizeContactMessage);
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('goppo_contact_messages_updated'));
  } catch (err) {
    console.error('Error saving local contact messages:', err);
  }
}

/**
 * Submits a new contact message from listeners (both Firestore and LocalStorage)
 */
export async function submitContactMessage(messageInput: Partial<UserContactMessage>): Promise<{ success: boolean; message: UserContactMessage }> {
  const normalized = normalizeContactMessage({
    ...messageInput,
    id: messageInput.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    status: 'unread',
    isRead: false,
  });

  // 1. Immediately save to LocalStorage so UI reacts instantly
  try {
    const current = getLocalCachedMessages();
    const updated = [normalized, ...current.filter((m) => m.id !== normalized.id)];
    setLocalCachedMessages(updated);
  } catch (err) {
    console.warn('LocalStorage save warning:', err);
  }

  // 2. Sync to Firestore Cloud Collection 'contact_messages'
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'contact_messages', normalized.id);
    await setDoc(docRef, {
      id: normalized.id,
      senderName: normalized.senderName,
      senderEmail: normalized.senderEmail,
      senderPhone: normalized.senderPhone || '',
      category: normalized.category,
      subject: normalized.subject || '',
      message: normalized.message,
      timestamp: normalized.timestamp,
      createdAt: normalized.createdAt,
      serverTime: serverTimestamp(),
      status: 'unread',
      isRead: false,
    });
  } catch (firestoreErr) {
    console.warn('Firestore message upload (fallback to local only):', firestoreErr);
  }

  return { success: true, message: normalized };
}

/**
 * Subscribes to contact messages in real-time for Admin Panel
 */
export function subscribeToContactMessages(
  onUpdate: (messages: UserContactMessage[]) => void
): () => void {
  let isUnsubscribed = false;
  
  // Deliver initial local cache immediately
  const initialLocal = getLocalCachedMessages();
  onUpdate(initialLocal);

  // Listen to window events for local updates
  const handleLocalUpdate = () => {
    if (!isUnsubscribed) {
      onUpdate(getLocalCachedMessages());
    }
  };
  window.addEventListener('goppo_contact_messages_updated', handleLocalUpdate);

  // Connect to Firestore
  try {
    const db = getFirestoreInstance();
    const messagesCol = collection(db, 'contact_messages');
    const q = query(messagesCol, orderBy('createdAt', 'desc'));

    const unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (isUnsubscribed) return;
        const deletedIds = getDeletedMessageIds();
        const firestoreList: UserContactMessage[] = [];
        
        snapshot.forEach((docSnap) => {
          const docId = docSnap.id;
          if (!deletedIds.has(docId)) {
            firestoreList.push(normalizeContactMessage({ ...docSnap.data(), id: docId }));
          }
        });

        // Merge with local messages that might not be in firestore yet
        const localList = getLocalCachedMessages();
        const mergedMap = new Map<string, UserContactMessage>();

        firestoreList.forEach((m) => mergedMap.set(m.id, m));
        localList.forEach((m) => {
          if (!mergedMap.has(m.id) && !deletedIds.has(m.id)) {
            mergedMap.set(m.id, m);
          }
        });

        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          const tA = new Date(a.createdAt || 0).getTime();
          const tB = new Date(b.createdAt || 0).getTime();
          return tB - tA;
        });

        setLocalCachedMessages(merged);
        onUpdate(merged);
      },
      (err) => {
        console.warn('Firestore contact_messages listener warning (using local):', err.message);
        onUpdate(getLocalCachedMessages());
      }
    );

    return () => {
      isUnsubscribed = true;
      window.removeEventListener('goppo_contact_messages_updated', handleLocalUpdate);
      unsubscribeFirestore();
    };
  } catch (err) {
    console.warn('Could not initialize firestore messages listener:', err);
    return () => {
      isUnsubscribed = true;
      window.removeEventListener('goppo_contact_messages_updated', handleLocalUpdate);
    };
  }
}

/**
 * Marks a message as read or replied in Firestore and LocalStorage
 */
export async function markContactMessageStatus(
  id: string,
  status: 'unread' | 'read' | 'replied'
): Promise<void> {
  const isRead = status === 'read' || status === 'replied';

  // Update local
  const current = getLocalCachedMessages();
  const updated = current.map((m) => (m.id === id ? { ...m, status, isRead } : m));
  setLocalCachedMessages(updated);

  // Update firestore
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'contact_messages', id);
    await updateDoc(docRef, { status, isRead });
  } catch (err) {
    console.warn('Could not update message in firestore:', err);
  }
}

/**
 * Deletes a contact message permanently from LocalStorage and Firestore
 */
export async function deleteContactMessage(id: string): Promise<boolean> {
  // 1. Record ID in permanent tombstone set so it can never reappear
  recordMessageAsDeleted(id);

  // 2. Immediately remove from local cached list
  try {
    const current = getLocalCachedMessages();
    const updated = current.filter((m) => m.id !== id);
    localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('goppo_contact_messages_updated'));
  } catch (err) {
    console.error('Error removing message from localStorage:', err);
  }

  // 3. Delete from Firestore cloud doc
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, 'contact_messages', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete warning (local deletion preserved):', err);
  }

  return true;
}
