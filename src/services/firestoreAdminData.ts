import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getGoppoFirestore } from './firestoreUser';
import {
  PaymentTransaction,
  SubscriberLead,
  NarratorApplication,
  LifeStorySubmission,
  LifeStoryEpisode,
  UpiConfig,
  AdminActivityLog,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, op: OperationType, path: string) {
  const errObj = error as { code?: string; message?: string };
  console.warn(`Firestore [${op}] failed on [${path}]:`, errObj?.message || error);
}

// ==========================================
// 1. PAYMENT TRANSACTIONS (transactions)
// ==========================================

export function subscribeTransactionsFromFirestore(
  onUpdate: (transactions: PaymentTransaction[]) => void,
  onError?: (error: unknown) => void,
  userId?: string
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'transactions');
    const q = userId ? query(colRef, where('userId', '==', userId)) : query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PaymentTransaction[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              userId: data.userId || '',
              userName: data.userName || '',
              userEmail: data.userEmail || '',
              userPhone: data.userPhone || '',
              userWhatsapp: data.userWhatsapp || '',
              planId: data.planId || 'little_monthly',
              planName: data.planName || 'Little Pass',
              amount: Number(data.amount) || 0,
              currency: data.currency || 'INR',
              country: data.country || 'India',
              paymentMethod: data.paymentMethod || 'UPI',
              paymentDate: data.paymentDate || '',
              paymentTime: data.paymentTime || '',
              utrTransactionId: data.utrTransactionId || '',
              screenshotUrl: data.screenshotUrl,
              screenshotName: data.screenshotName,
              status: data.status || 'pending',
              subscriptionStartDate: data.subscriptionStartDate,
              subscriptionExpiryDate: data.subscriptionExpiryDate,
              targetStoryId: data.targetStoryId,
              rejectionReason: data.rejectionReason,
              refundReason: data.refundReason,
              refundRequestedDate: data.refundRequestedDate,
              refundAmount: data.refundAmount ? Number(data.refundAmount) : undefined,
              refundDate: data.refundDate,
              refundUtr: data.refundUtr,
              refundNote: data.refundNote,
              cancellationDate: data.cancellationDate,
              cancellationReason: data.cancellationReason,
              approvedBy: data.approvedBy,
              approvedDate: data.approvedDate,
              rejectedBy: data.rejectedBy,
              rejectedDate: data.rejectedDate,
            });
          });

          // Sort by paymentDate descending
          list.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'transactions');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'transactions');
    return () => {};
  }
}

export async function saveTransactionToFirestore(transaction: PaymentTransaction): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !transaction.id) return false;

  try {
    const docRef = doc(db, 'transactions', transaction.id);
    const cleanData: Record<string, any> = { ...transaction };
    // Remove undefined values to ensure Firestore compliance
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `transactions/${transaction.id}`);
    return false;
  }
}

export async function deleteTransactionFromFirestore(transactionId: string): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !transactionId) return false;

  try {
    const docRef = doc(db, 'transactions', transactionId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `transactions/${transactionId}`);
    return false;
  }
}

// ==========================================
// 2. SUBSCRIBERS / CRM LEADS (subscribers)
// ==========================================

export function subscribeSubscribersFromFirestore(
  onUpdate: (subscribers: SubscriberLead[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'subscribers');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SubscriberLead[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              whatsapp: data.whatsapp || '',
              country: data.country || 'India',
              tier: data.tier || '',
              amount: Number(data.amount) || 0,
              currency: data.currency || 'INR',
              method: data.method || '',
              transactionId: data.transactionId,
              paymentProofName: data.paymentProofName,
              verificationStatus: data.verificationStatus || 'pending_verification',
              date: data.date || '',
              optInMarketing: Boolean(data.optInMarketing),
              notes: data.notes,
            });
          });

          // Sort by date descending
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'subscribers');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'subscribers');
    return () => {};
  }
}

export async function saveSubscriberToFirestore(subscriber: SubscriberLead): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !subscriber.id) return false;

  try {
    const docRef = doc(db, 'subscribers', subscriber.id);
    const cleanData: Record<string, any> = { ...subscriber };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subscribers/${subscriber.id}`);
    return false;
  }
}

export async function deleteSubscriberFromFirestore(subscriberId: string): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !subscriberId) return false;

  try {
    const docRef = doc(db, 'subscribers', subscriberId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `subscribers/${subscriberId}`);
    return false;
  }
}

// ==========================================
// 3. NARRATOR APPLICATIONS (narrator_applications)
// ==========================================

export function subscribeNarratorAppsFromFirestore(
  onUpdate: (apps: NarratorApplication[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'narrator_applications');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: NarratorApplication[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              city: data.city || '',
              preferredGenres: Array.isArray(data.preferredGenres) ? data.preferredGenres : [],
              sampleAudioNameOrUrl: data.sampleAudioNameOrUrl || '',
              sampleAudioUrl: data.sampleAudioUrl,
              recordingEquipment: data.recordingEquipment || '',
              experienceBio: data.experienceBio || '',
              status: data.status || 'pending',
              appliedDate: data.appliedDate || '',
              approvalCode: data.approvalCode,
              approvedDate: data.approvedDate,
              approvedBy: data.approvedBy,
            });
          });

          // Sort by appliedDate descending
          list.sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''));
          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'narrator_applications');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'narrator_applications');
    return () => {};
  }
}

export async function saveNarratorAppToFirestore(app: NarratorApplication): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !app.id) return false;

  try {
    const docRef = doc(db, 'narrator_applications', app.id);
    const cleanData: Record<string, any> = { ...app };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `narrator_applications/${app.id}`);
    return false;
  }
}

export async function deleteNarratorAppFromFirestore(appId: string): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !appId) return false;

  try {
    const docRef = doc(db, 'narrator_applications', appId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `narrator_applications/${appId}`);
    return false;
  }
}

// ==========================================
// 4. LIFE STORIES SUBMISSIONS (life_stories)
// ==========================================

export function subscribeLifeStoriesFromFirestore(
  onUpdate: (stories: LifeStorySubmission[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'life_stories');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LifeStorySubmission[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              fullName: data.fullName || '',
              age: data.age || '',
              profession: data.profession || '',
              location: data.location || '',
              phone: data.phone || '',
              whatsapp: data.whatsapp || '',
              email: data.email,
              storyTitle: data.storyTitle || '',
              storySummary: data.storySummary || '',
              preferredRecordingMode: data.preferredRecordingMode || 'online_call',
              submittedDate: data.submittedDate || '',
              status: data.status || 'new',
              notes: data.notes,
            });
          });

          // Sort by submittedDate descending
          list.sort((a, b) => (b.submittedDate || '').localeCompare(a.submittedDate || ''));
          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'life_stories');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'life_stories');
    return () => {};
  }
}

export async function saveLifeStoryToFirestore(story: LifeStorySubmission): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !story.id) return false;

  try {
    const docRef = doc(db, 'life_stories', story.id);
    const cleanData: Record<string, any> = { ...story };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `life_stories/${story.id}`);
    return false;
  }
}

export async function deleteLifeStoryFromFirestore(storyId: string): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !storyId) return false;

  try {
    const docRef = doc(db, 'life_stories', storyId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `life_stories/${storyId}`);
    return false;
  }
}

// ==========================================
// 5. PODCAST EPISODES (podcast_episodes)
// ==========================================

export function subscribePodcastEpisodesFromFirestore(
  onUpdate: (episodes: LifeStoryEpisode[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'podcast_episodes');
    const q = query(colRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LifeStoryEpisode[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              speakerName: data.speakerName || '',
              speakerAge: Number(data.speakerAge) || 0,
              speakerLocation: data.speakerLocation || '',
              speakerProfession: data.speakerProfession || '',
              duration: Number(data.duration) || 0,
              releaseDate: data.releaseDate || '',
              summary: data.summary || '',
              keyQuote: data.keyQuote || '',
              coverImage: data.coverImage || '',
              audioUrl: data.audioUrl,
              tags: Array.isArray(data.tags) ? data.tags : [],
              listenCount: Number(data.listenCount) || 0,
              featured: Boolean(data.featured),
            });
          });

          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'podcast_episodes');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'podcast_episodes');
    return () => {};
  }
}

export async function savePodcastEpisodeToFirestore(episode: LifeStoryEpisode): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !episode.id) return false;

  try {
    const docRef = doc(db, 'podcast_episodes', episode.id);
    const cleanData: Record<string, any> = { ...episode };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `podcast_episodes/${episode.id}`);
    return false;
  }
}

export async function deletePodcastEpisodeFromFirestore(episodeId: string): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !episodeId) return false;

  try {
    const docRef = doc(db, 'podcast_episodes', episodeId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `podcast_episodes/${episodeId}`);
    return false;
  }
}

// ==========================================
// 6. SYSTEM & UPI CONFIG (system_settings/upi_config)
// ==========================================

export function subscribeUpiConfigFromFirestore(
  onUpdate: (config: UpiConfig) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const docRef = doc(db, 'system_settings', 'upi_config');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate({
            upiId: data.upiId || '',
            payeeName: data.payeeName || '',
            qrImageUrl: data.qrImageUrl,
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode,
            paymentInstructions: data.paymentInstructions,
            gatewayMode: data.gatewayMode || 'manual_upi',
            razorpayKeyId: data.razorpayKeyId,
            cashfreeAppId: data.cashfreeAppId,
            isGatewayActive: Boolean(data.isGatewayActive),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'system_settings/upi_config');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'system_settings/upi_config');
    return () => {};
  }
}

export async function saveUpiConfigToFirestore(config: UpiConfig): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db) return false;

  try {
    const docRef = doc(db, 'system_settings', 'upi_config');
    const cleanData: Record<string, any> = { ...config };
    // Strictly ensure no server-side secrets are ever stored in client Firestore documents
    delete cleanData.razorpayKeySecret;
    delete cleanData.cashfreeSecretKey;
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system_settings/upi_config');
    return false;
  }
}

// ==========================================
// 7. ADMIN ACTIVITY LOGS (admin_activity_logs)
// ==========================================

export function subscribeAdminLogsFromFirestore(
  onUpdate: (logs: AdminActivityLog[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const db = getGoppoFirestore();
  if (!db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'admin_activity_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AdminActivityLog[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              adminName: data.adminName || 'Admin',
              action: data.action || 'submit_payment',
              details: data.details || '',
              targetId: data.targetId || '',
              timestamp: data.timestamp || new Date().toISOString(),
            });
          });
          onUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'admin_activity_logs');
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'admin_activity_logs');
    return () => {};
  }
}

export async function saveAdminLogToFirestore(log: AdminActivityLog): Promise<boolean> {
  const db = getGoppoFirestore();
  if (!db || !log.id) return false;

  try {
    const docRef = doc(db, 'admin_activity_logs', log.id);
    await setDoc(docRef, log, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admin_activity_logs/${log.id}`);
    return false;
  }
}
