# Goppo Kahini — Verified Recovery & Final Integration Manifest

- **Merge Reference:** `6f70451`
- **Application ID:** `in.goppokahini.app`
- **Firebase Project:** `argon-yarrow-wpthm`
- **Custom Domain:** `goppokahini.in`
- **Firestore Database ID:** `ai-studio-8thsep5goppokahi-54c61b69-958f-49b7-97b1-8d4a3b90b263`
- **GCS Builds Bucket:** `gs://goppo-kahini-android-builds/`
- **Cloud Build Trigger:** `goppo-kahini-production`

## Core Verified Systems
1. **Consolidated 4-Policy Legal Suite:**
   - Privacy Policy (`/privacy-policy`)
   - Terms & Conditions (`/terms`)
   - Refund Policy (`/refund-policy`)
   - Account & Data Deletion (`/data-deletion` & `/delete-account`)
   - Complete legacy alias redirects mapping 13 historic routes.

2. **Add-Only Series & Episode Publishing System:**
   - Real-time Firestore sync for `series` and `series/{seriesId}/episodes`.
   - Access entitlement engine: Free/Trailer open, Paid requires Active ₹20 Pass + individual purchase.
   - Non-credit based; expired pass preserves purchase record until renewed.
   - Continuous next-episode auto-play and deep linking (`/series/{seriesId}/episode/{episodeId}`).
   - Dynamic FCM notification dispatch for published episodes.

3. **Android & Capacitor Configuration:**
   - Verified Android package `in.goppokahini.app`.
   - Full drawable splash assets (portrait & landscape across mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi).
   - Adaptive launcher icons and background/foreground drawables.
   - `POST_NOTIFICATIONS` permission configured in `AndroidManifest.xml`.
   - Google Services integration (`google-services.json`).

4. **Branding & Assets:**
   - Final 1254x1254 logo (`src/goppo-kahini-logo.png`).
   - Web PWA manifest & icons (`public/site.webmanifest`, `public/logo.png`, `public/favicon.ico`).

5. **Cloud Functions & Push Notifications:**
   - `functions/lib/index.js` containing `notifyNewStory` and `notifyNewEpisode`.
   - Web & Capacitor push notification service (`src/services/pushNotifications.ts`).
