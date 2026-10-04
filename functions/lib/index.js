"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNewEpisode = exports.notifyNewStory = void 0;

const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Cloud Function triggered on new standalone story publication.
 * Sends push notification via FCM to subscribed users.
 */
exports.notifyNewStory = functions.firestore
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
exports.notifyNewEpisode = functions.firestore
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
                seriesTitle = seriesDoc.data().title || seriesTitle;
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
