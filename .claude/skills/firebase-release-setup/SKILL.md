---
name: firebase-release-setup
description: Firebase Security Rules summary, Google OAuth client setup, and the pre-production release checklist for this ESL Exercises app. Use when configuring or auditing Firestore/Storage rules, setting up Google Sign-In OAuth clients for Android/iOS, or preparing a production release.
---

# Firebase & Release Setup

## Firebase Security Rules

The `.rules` files are not checked into this repo — they live in the Firebase console. Current intent:

**Firestore:** Enforce authentication on all collections. Admin-only write access for `categories`, `exercises`, `downloadableFiles`, `appSettings`. Users can read/write own data in `users` and `userProgress` collections.

**Storage:** Authenticated read access. Admin-only write with 10MB limit for PDF/DOC files in `documents/{categoryId}/{fileName}` path.

Admin privileges are enforced **via Firestore Security Rules, not client-side**. The `isAdmin` flag on a user document is a convenience for UI gating only — never treat it as the security boundary.

## Google OAuth Setup

**Quick setup:**
1. Create a Web OAuth Client at Google Cloud Console
2. Enable Google sign-in in Firebase Authentication
3. Set the resulting client IDs in `.env`

**Production:** Generate platform-specific OAuth Clients for Android (requires the release SHA-1 fingerprint) and iOS (bundle ID: `com.petereasterbro1.eslexercises25`).

The Web client ID is required in all environments. Android/iOS client IDs are optional for local testing but required for production builds.

## Production Checklist

- [ ] Firebase Security Rules configured and tested
- [ ] Admin access enforcement verified
- [ ] Google OAuth consent screen configured
- [ ] Platform-specific OAuth Clients created for Android/iOS
- [ ] Test Google Sign-In on all platforms
- [ ] Privacy Policy reviewed
