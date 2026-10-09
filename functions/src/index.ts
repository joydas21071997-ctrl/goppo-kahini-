import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Cloud Function triggered on new standalone story publication.
 * Sends push notification via FCM to subscribed users.
 */
export const notifyNewStory = functions.firestore
    .document("stories/{storyId}")
    .onCreate(async (snap, context) => {
        const story = snap.data();
        if (!story) return null;

        const title = "🔔 নতুন গল্প প্রকাশিত!";
        const body = `${story.title} — ${story.author || "গপ্পো কাহিনী"}\nএখনই শুনুন গপ্পো কাহিনীতে।`;
        const url = `/?story=${context.params.storyId}`;

        const payload = {
            notification: {
                title,
                body,
                imageUrl: story.coverImage || "",
            },
            data: {
                storyId: context.params.storyId,
                url,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
            topic: "all_stories",
        };

        try {
            const response = await admin.messaging().send(payload);
            console.log("Successfully sent new story notification:", response);
            return response;
        } catch (error) {
            console.error("Error sending new story notification:", error);
            return null;
        }
    });

/**
 * Cloud Function triggered on new episode publication under series.
 * Sends push notification with episode details and deep link.
 */
export const notifyNewEpisode = functions.firestore
    .document("series/{seriesId}/episodes/{episodeId}")
    .onWrite(async (change, context) => {
        const episode = change.after.exists ? change.after.data() : null;
        const previous = change.before.exists ? change.before.data() : null;

        if (!episode) return null;
        if (episode.status !== "published") return null;
        if (episode.notificationSent && previous && previous.notificationSent) return null;

        const seriesId = context.params.seriesId;
        const episodeId = context.params.episodeId;

        // Fetch parent series info
        let seriesTitle = "ধারাবাহিক সিরিজ";
        try {
            const seriesDoc = await admin.firestore().collection("series").doc(seriesId).get();
            if (seriesDoc.exists) {
                seriesTitle = seriesDoc.data()?.title || seriesTitle;
            }
        } catch (err) {
            console.warn("Could not fetch series title:", err);
        }

        const title = "🔔 নতুন এপিসোড প্রকাশিত!";
        let body = `${seriesTitle} — Episode ${episode.episodeNumber}\n"${episode.title}"`;
        if (episode.accessType === "paid") {
            body += `\nএই পর্বটি শুনতে ₹${episode.price || 5} দিয়ে Unlock করুন।`;
        } else {
            body += `\nনতুন পর্ব এখন শুনুন।`;
        }

        const url = `/series/${seriesId}/episode/${episodeId}`;

        const payload = {
            notification: {
                title,
                body,
                imageUrl: episode.thumbnail || "",
            },
            data: {
                seriesId,
                episodeId,
                url,
            },
            topic: "all_episodes",
        };

        try {
            await admin.messaging().send(payload);
            await change.after.ref.update({
                notificationSent: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`Episode notification sent for series ${seriesId} episode ${episodeId}`);
            return true;
        } catch (error) {
            console.error("Error sending episode notification:", error);
            return null;
        }
    });

/**
 * Cloud Function: getEpisodeStreamUrl
 * Securely authorizes paid episode and story audio playback.
 * 
 * Enforces Zero-Trust Backend Verification:
 * 1. User must be authenticated (context.auth.uid).
 * 2. Active ₹20 Main Access Pass verified server-side.
 * 3. Individual episode purchase verified server-side.
 * 4. Generates a short-lived V4 signed URL (15 minutes).
 * 
 * Free / Trailer episodes or Super Admin bypass checks.
 */
export const getEpisodeStreamUrl = functions.https.onCall(async (data, context) => {
    // 1. Authentication check
    if (!context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "গল্প শুনতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।"
        );
    }

    const uid = context.auth.uid;
    const userEmail = (context.auth.token.email || "").toLowerCase().trim();

    // Check if Super Admin Joy is accessing (full bypass for management/preview)
    const isSuperAdmin =
        uid === "XENByyR5dOY1i0NqI0ridlEmVc23" ||
        (userEmail === "joydas.21071997@gmail.com" && context.auth.token.email_verified === true) ||
        context.auth.token.role === "admin" ||
        context.auth.token.role === "super_admin";

    const { seriesId, episodeId, storyId } = data || {};

    if (!episodeId && !storyId) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "অনুগ্রহ করে সঠিক পর্ব বা গল্প আইডি প্রদান করুন।"
        );
    }

    const db = admin.firestore();
    let accessType = "free";
    let storagePath = "";
    let publicAudioUrl = "";

    // --- CASE A: Series Episode ---
    if (seriesId && episodeId) {
        const epDoc = await db.collection("series").doc(seriesId).collection("episodes").doc(episodeId).get();
        if (!epDoc.exists) {
            throw new functions.https.HttpsError("not-found", "এপিসোডটি পাওয়া যায়নি।");
        }
        const epData = epDoc.data() || {};
        accessType = epData.accessType || "free";
        storagePath = (epData.storagePath || "").trim();
        publicAudioUrl = (epData.audioUrl || "").trim();

        // If storagePath is empty but audioUrl exists (pre-migration compatibility):
        if (!storagePath && publicAudioUrl) {
            // Extract storage path between /o/ and ?
            const match = publicAudioUrl.match(/\/o\/([^?]+)/);
            if (match && match[1]) {
                storagePath = decodeURIComponent(match[1]);
            } else if (publicAudioUrl.startsWith("gs://")) {
                storagePath = publicAudioUrl.replace(/^gs:\/\/[^/]+\//, "");
            }
        }
    } 
    // --- CASE B: Standalone Story ---
    else if (storyId) {
        const storyDoc = await db.collection("stories").doc(storyId).get();
        if (!storyDoc.exists) {
            throw new functions.https.HttpsError("not-found", "গল্পটি পাওয়া যায়নি।");
        }
        const storyData = storyDoc.data() || {};
        const isPaid = storyData.isLittlePassOnly || storyData.pricingType === "single_pay" || (storyData.singlePurchasePrice && storyData.singlePurchasePrice > 0);
        accessType = isPaid ? "paid" : "free";
        storagePath = (storyData.storageAudioPath || "").trim();
        publicAudioUrl = (storyData.audioUrl || "").trim();

        if (!storagePath && publicAudioUrl) {
            const match = publicAudioUrl.match(/\/o\/([^?]+)/);
            if (match && match[1]) {
                storagePath = decodeURIComponent(match[1]);
            }
        }
    }

    // Free or Trailer episodes can be streamed directly
    if (accessType === "free" || accessType === "trailer") {
        if (publicAudioUrl && !storagePath) {
            return { streamUrl: publicAudioUrl, accessType, expiresAt: null };
        }
    }

    // --- SERVER-SIDE VERIFICATION FOR PAID CONTENT ---
    if (accessType === "paid" && !isSuperAdmin) {
        // Fetch user document from Firestore
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.exists ? (userDoc.data() || {}) : {};

        // 1. Verify Active ₹20 Main Access Pass
        let isPassActive = false;

        // Check user profile fields
        if (userData.hasTwentyTakaPass === true && userData.subscriptionStatus === "active") {
            if (userData.subscriptionExpiry) {
                const expiryDate = userData.subscriptionExpiry.toDate
                    ? userData.subscriptionExpiry.toDate()
                    : new Date(userData.subscriptionExpiry);
                if (expiryDate > new Date()) {
                    isPassActive = true;
                }
            } else {
                isPassActive = true;
            }
        }

        // Secondary check: verify in transactions collection if active ₹20 pass exists
        if (!isPassActive) {
            const activeTxSnap = await db.collection("transactions")
                .where("userId", "==", uid)
                .where("status", "in", ["approved", "paid"])
                .get();

            const now = new Date();
            for (const docSnap of activeTxSnap.docs) {
                const tx = docSnap.data();
                if (tx.planId === "little_monthly" || tx.planId === "little_annual" || tx.amount === 20) {
                    if (tx.subscriptionExpiryDate) {
                        const exp = new Date(tx.subscriptionExpiryDate);
                        if (!isNaN(exp.getTime()) && exp > now) {
                            isPassActive = true;
                            break;
                        }
                    } else {
                        isPassActive = true;
                        break;
                    }
                }
            }
        }

        if (!isPassActive) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "এই প্রিমিয়াম পর্বটি শুনতে সক্রিয় ২০ টাকার মাসিক পাস প্রয়োজন।"
            );
        }

        // 2. Verify Individual Episode Purchase
        const targetId = episodeId || storyId;
        const unlockedEpisodes: string[] = Array.isArray(userData.unlockedEpisodeIds) ? userData.unlockedEpisodeIds : [];
        const unlockedStories: string[] = Array.isArray(userData.unlockedStoryIds) ? userData.unlockedStoryIds : [];

        let isPurchased = unlockedEpisodes.includes(targetId) || unlockedStories.includes(targetId);

        if (!isPurchased) {
            // Check transactions collection for verified purchase
            const txQuery = await db.collection("transactions")
                .where("userId", "==", uid)
                .where("status", "in", ["approved", "paid"])
                .get();

            for (const docSnap of txQuery.docs) {
                const tx = docSnap.data();
                if (tx.targetEpisodeId === targetId || tx.targetStoryId === targetId) {
                    isPurchased = true;
                    break;
                }
            }
        }

        if (!isPurchased) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "এই পর্বটির একক টিকিট ক্রয় করা নেই। অনুগ্রহ করে পর্বটি আনলক করুন।"
            );
        }
    }

    // --- GENERATE TIME-LIMITED V4 SIGNED URL (15 MINUTES) ---
    if (!storagePath) {
        if (publicAudioUrl) {
            return { streamUrl: publicAudioUrl, accessType, expiresAt: null };
        }
        throw new functions.https.HttpsError("not-found", "অডিও ফাইল ক্লাউড স্টোরেজে পাওয়া যায়নি।");
    }

    try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(storagePath);
        
        // Expiration: 15 minutes from now
        const expiresAt = Date.now() + 15 * 60 * 1000;
        const [signedUrl] = await file.getSignedUrl({
            action: "read",
            expires: expiresAt,
            version: "v4",
        });

        return {
            streamUrl: signedUrl,
            expiresAt,
            accessType,
            storagePath,
        };
    } catch (err: any) {
        console.error("Error generating signed storage URL:", err);
        // Fallback to public audio URL if available during migration period
        if (publicAudioUrl) {
            return { streamUrl: publicAudioUrl, accessType, expiresAt: null };
        }
        throw new functions.https.HttpsError(
            "internal",
            "অডিও স্ট্রিম লিঙ্ক তৈরি করতে সমস্যা হয়েছে: " + (err.message || "")
        );
    }
});
