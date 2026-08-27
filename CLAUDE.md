# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

ESL (English as Second Language) Exercises mobile application built with Expo React Native, TypeScript, and Firebase. The app helps non-native English speakers learn and practice English through categorized exercises, progress tracking, and administrative tools.

## Where we are (last updated 2026-08-27)

Live on Google Play. iOS is being brought up. **Nothing is merged** — master is
untouched and four branches sit on `origin`, each independently deployable:

| Branch | Contains | Status |
| --- | --- | --- |
| `master` | Play production | Untouched today |
| `ios-adjustment` | iOS build/submit config; downloads+paywall hidden on iOS until app version 2.1.0 | Pushed. **No iOS build has ever run** |
| `repo-hardening` | `firestore.rules`, `firebase.json`, `.firebaserc`; `production.json` untracked | Pushed and **deployed**, verified in the Rules Playground |
| `premium-server-enforcement` | `functions/` — `verifyPurchase`, `getFileDownloadUrl` | Pushed, compiles, **not deployed**, nothing calls it |

`ios-adjustment` and `repo-hardening` both edit CLAUDE.md in different sections
and merge cleanly. Merge `ios-adjustment` into master once the first iOS build
succeeds — nothing on it can affect Android (verified: the Android prebuild is
unchanged, and the iOS config is inert without an iOS build).

**Security fixed today:** the deployed rules let any signed-in user write
`isAdmin: true` to their own user document and become an admin. Closed. Client
SDK access is what rules govern — console access is irrelevant to them.

**Still open, not blocking either store:** `hasPremiumAccess` is still written by
the client, and `downloadableFiles.fileUrl` is still a tokenized Storage URL that
bypasses Storage rules. `functions/README.md` has the fix and the rollout order —
that order matters, locking the field before the client calls `verifyPurchase`
breaks every legitimate purchase.

## Next steps to reach the App Store

Nothing here needs a Mac. It also no longer needs an iPhone: iOS 1.0 ships with
the paywall hidden, so there is no in-app purchase to sandbox-test. Full detail
is in `iOS Release Checklist.md` **on the `ios-adjustment` branch**.

Blocking, in dependency order — the first two are Peter's alone and have
multi-day latency, so start them before any code work:

1. **Enrol in the Apple Developer Program** ($99/yr, Individual not
   Organization). 24–48h identity check. Record the Team ID.
2. **Create the App Store Connect app record** with bundle ID
   `com.petereasterbro1.eslexercises25`, then fill the three placeholders
   (`appleId`, `ascAppId`, `appleTeamId`) in `eas.json` on `ios-adjustment`.
3. **Firebase iOS app + iOS OAuth client.** Commit `GoogleService-Info.plist`
   to the repo root — `app.json` already points at it and the build fails
   without it. Google Sign-In on iOS reads `CLIENT_ID` from that plist.
   Independent of Apple; can be done while enrolment is pending.
4. **First iOS build**: `eas build --platform ios --profile development`
   (simulator). This is the unknown — Skia, Reanimated and two Nitro modules
   have never been compiled for iOS. Do it before promising a date.
5. **TestFlight**: `eas build --platform ios --profile production
   --auto-submit-with-profile internal`. Verify Google Sign-In on the real
   artifact, then submit for review from App Store Connect.

Deferred until iOS 2.1.0 turns the paywall on: the Paid Applications agreement
and banking/tax forms, the `premium_file_access` product in App Store Connect,
sandbox testing on a borrowed or bought iPhone, and iOS support in
`verifyPurchase` (needs an App Store Connect `.p8` key).

Also needed before submission: iPhone screenshots (6.9", simulator captures are
accepted), the App Privacy questionnaire, a public privacy policy URL, and
email/password demo credentials in the review notes — reviewers cannot use
Google Sign-In. Decide deliberately whether to add Sign in with Apple:
email/password should exempt us from guideline 4.8, but Google-login apps do get
flagged, and a rejection round costs more than the day it takes to add.

## Code Style

- **Do NOT add `@react-navigation` packages.** Expo Router v56 replaces them and they are incompatible with SDK 56.
- All components use named exports with types
- Styled with `StyleSheet.create()`
- Themed components use `useThemeColor` hook
- Single light theme (`Colors.dark` contains light appearance colors)
- Animations configured in navigation options
- **IMPORTANT:** Always use color schemes from `constants/theme.ts`:
  - `Colors` (uppercase) - Theme object with `dark`/`light` properties for text, background, tint, icons
  - `colors` (lowercase) - Semantic colors: `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`
  - `blues` - Blue palette scale (blue1-blue9)
  - `backgrounds` - Background variants: `primary`, `subtle`, `tinted`, `tintedStrong`
  - `borders` - Border colors: `subtle`, `light`, `medium`, `strong`
  - `elevation` - Shadow presets: `level1`, `level2`, `level3` with blue-tinted shadows
  - `Fonts` (uppercase) - Platform-specific font families: `sans`, `serif`, `rounded`, `mono`
  - ⚠️ **Note:** `Colors` vs `colors` - Use correct casing to avoid bugs!

## Theme Configuration

**Important:** App uses single light theme only. Do NOT add theme switching logic.
- `hooks/use-color-scheme.ts` - Always returns 'dark' to select light appearance
- `hooks/use-theme-color.ts` - Directly uses Colors.dark without scheme detection
- `app/_layout.tsx` - Always uses DarkTheme from React Navigation

## Data Structure (Firebase)

- **users** - User profiles with isAdmin flag
- **categories** - Exercise categories
- **exercises** - Exercise questions, answers, explanations
- **userProgress** - User completion status and scores
- **downloadableFiles** - PDF/DOC files metadata (linked to exercises/categories)
- **appSettings/config** - Global app configuration

## Authentication & Security

### Authentication Methods
- **Email/Password** - Firebase email authentication with password reset
- **Google Sign-In** - native Credential Manager via `react-native-nitro-google-signin`
  - **Do NOT reintroduce `expo-auth-session` for Google.** Google no longer supports
    browser/implicit sign-in for Android client types, so `responseType: 'id_token'`
    against an Android OAuth client always fails. That was the long-standing
    production login bug; `expo-auth-session` has been removed from the project.
  - `GoogleOneTapSignIn.configure()` takes the **Web** client ID, never the Android
    one. Google identifies the app by package name + signing SHA-1 instead.
  - Sign-in cascades `signIn()` → `createAccount()` → `presentExplicitSignIn()`,
    then exchanges the returned `idToken` via Firebase `signInWithCredential`.
  - Web falls back to Firebase `signInWithPopup` — the native module is Android/iOS only.
  - Requires a **development build**; will not work in Expo Go.
  - Automatically creates user documents in Firestore on first sign-in
  - A `DEVELOPER_ERROR` at runtime means package name + SHA-1 do not match an
    Android OAuth client in the Google project — check the fingerprints first.

### Security
- Firebase Auth required for all features
- **Admin privileges are enforced via Firestore Security Rules, NOT client-side.**
  The rules live in `firestore.rules` in this repo — that file is the source of
  truth. Edit and deploy it (`firebase deploy --only firestore:rules`); never edit
  rules in the console, or the two drift with no way to tell what is live.
- `isAdmin` is set from the Firebase console only. No client path may write it —
  the rules block the field even for admins, because a self-write to `isAdmin`
  is a straight privilege escalation into every admin-only collection.
- **Premium is not yet enforced server-side.** `hasPremiumAccess` is written by
  the client after purchase, and `downloadableFiles.fileUrl` is a tokenized
  Storage URL that bypasses Storage rules. See the header of `firestore.rules`.
- User can only access own progress/profile data
- All destructive operations require confirmation
- Auth persistence via AsyncStorage (React Native) and localStorage (Web)

For Security Rules detail, Google OAuth client setup, and the production release checklist, see the `firebase-release-setup` skill.

## Native-Only Modules

Some modules only work on native platforms (iOS/Android) and will break web builds if imported directly:

**react-native-iap:**
- Must use dynamic imports: `await import('react-native-iap')`
- Always check `Platform.OS === 'web'` before importing
- **Requires development build** - won't work in Expo Go
- See `services/premiumService.ts` for implementation pattern
- Web and Expo Go gracefully degrade (IAP silently unavailable)

**react-native-nitro-google-signin:**
- The package builds its Nitro hybrid object at **module scope**
  (`NitroModules.createHybridObject('NitroGoogleSignin')`), so merely importing it
  from anything the web bundle reaches throws
  `__fbBatchedBridgeConfig is not set, cannot invoke native modules` during
  `expo export --platform web` static rendering.
- Never import it directly from a shared file. All access goes through
  `services/googleSignIn.ts` (native) with `services/googleSignIn.web.ts` as the
  web stub; `services/googleSignIn.constants.ts` holds the platform-neutral bits.
  `AuthContext` imports only the wrapper and re-exports
  `GOOGLE_SIGN_IN_CANCELLED` / `describeGoogleSignInError` for screens.
- A `Platform.OS === 'web'` guard at the *call site* is not enough — the crash
  happens at import time, before any guard runs.

**Nitro module version lock (react-native-iap + Google Sign-In):**
Both `react-native-iap` and `react-native-nitro-google-signin` are Nitro modules and
must share one `react-native-nitro-modules` runtime. `react-native-iap@14.7.x` peers on
`^0.35.0`, so the tree is pinned to exact `react-native-nitro-modules@0.35.10` with
`react-native-nitro-google-signin@1.3.0` (the last release built against 0.35.x).
Do not bump either loosely — `nitro-google-signin@2.x` is built against 0.36.5 and
pulling it in breaks the IAP paywall's peer range. Moving to 2.x requires upgrading
`react-native-iap` to 16.x (peers `^0.36.5`) at the same time.

**Pattern for native-only code:**
```typescript
// WRONG - breaks web build
import * as RNIap from 'react-native-iap';

// CORRECT - dynamic import with availability check
const getRNIap = async () => {
  if (Platform.OS === 'web') return null;
  try {
    const module = await import('react-native-iap');
    if (!module.initConnection) return null; // Not available in Expo Go
    return module;
  } catch { return null; }
};
```

**Testing IAP:**
- Expo Go: IAP silently disabled, app works normally
- Development build: Run `npx eas build --profile development --platform android`

## Environment Variables

`.env` is gitignored, so its contents are not discoverable from the repo. So is
`production.json` — it held only `EXPO_PUBLIC_*` values, but it is an env dump in a
**public** repo and `.env` also carries a `GOOGLE_CLIENT_SECRET`. Required keys:
- Firebase config: API key, auth domain, project ID, storage bucket, messaging sender ID, app ID
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — the **Web** OAuth client ID. This is the only
  Google client ID the app reads. Do not add an Android client ID: native sign-in
  matches the app by package name + SHA-1, not by client ID.

`google-services.json` **is committed on purpose.** It holds no secret — only
project identifiers, OAuth client IDs, public certificate hashes, and an Android
API key that ships inside every APK anyway. It is also required at build time:
the `react-native-nitro-google-signin` config plugin throws without it, so
gitignoring it breaks builds on any fresh clone or CI runner. GitHub secret
scanning flags the API key; that is a known false positive for Firebase client
keys. API keys are secured by restricting them in Google Cloud Console, not by
hiding them.

⚠️ The `.env` Firebase API key is used by the **Firebase JS SDK**, so it must keep
Application restrictions set to **None** in Cloud Console. An "Android apps"
restriction requires `X-Android-Package`/`X-Android-Cert` headers that only the
*native* SDK sends — applying it would break Firestore, Auth and Storage for
every user. Restrict that key by **API** only.

## Releases and OTA Updates

`runtimeVersion` uses the **`fingerprint`** policy. It hashes everything affecting
the native layer, so an `eas update` can never reach a build lacking a native
module the new JS imports. Do not switch this back to `sdkVersion` or `appVersion`
— both leave that gap open, and this project has already been bitten by it.

Ship production builds to the **internal testing track first**
(`--auto-submit-with-profile internal`), then promote the same artifact in Play
Console. Never `--auto-submit` straight to production: Google re-signs every
distributed install with the App Signing key, so anything depending on that
certificate — Google Sign-In especially — cannot be tested by a local, dev, or
`preview` build. See `EAS Cheatsheet.md` for the full workflow.

## Platform Notes

- Supports iOS, Android, Web with a single light theme
- Expo File System uses the **legacy API** (SDK 54 compatibility) — do not migrate to the new API
- React Native Reanimated animations run on the UI thread (60fps)

## Feature Gotchas

### Multi-Language Instructions
Exercise instructions are available in English, Spanish, French, German, and Italian.

- Instructions are stored as a `{ en, es, fr, de, it }` object **or** as a legacy plain string. Both formats are live in the database — helper functions in `utils/languageHelpers.ts` must handle both, and there is deliberately **no migration**.
- English is required; the other four are optional.
- The canonical list lives in `constants/languages.ts` (`SUPPORTED_LANGUAGES`, `LANGUAGE_ORDER`) — check there rather than trusting this list if adding a language.
- User preference lives in the `preferredLanguage` field on the `User` type, and can be temporarily overridden per-exercise.

### Download Paywall
One-time €2.99 purchase unlocks all downloadable files via Google Play Billing.

- **Status:** Fully live. `premium_file_access` product created in Google Play Console at €2.99, license testing configured, purchase flow verified.
- The displayed price comes from Google Play at runtime; `DEFAULT_PRICE` in `services/premiumService.ts` is only the pre-load fallback. Update it if the Play Console price changes.
- Admins bypass the paywall entirely (free access).
- Premium status is stored on the Firestore user document; `AuthContext` exposes `hasPremiumAccess` and `refreshPremiumStatus`.
- Web shows a "not available" message — purchases are mobile-only.
