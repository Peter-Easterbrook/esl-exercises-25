# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

ESL (English as Second Language) Exercises mobile application built with Expo React Native, TypeScript, and Firebase. The app helps non-native English speakers learn and practice English through categorized exercises, progress tracking, and administrative tools.

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
- **Google Sign-In** - OAuth 2.0 via expo-auth-session and Firebase
  - Uses `expo-auth-session/providers/google` for OAuth flow
  - Configured with `responseType: 'id_token'` and `scopes: ['openid', 'profile', 'email']`
  - Automatically creates user documents in Firestore on first sign-in
  - Requires platform-specific OAuth Client IDs for native apps

### Security
- Firebase Auth required for all features
- **Admin privileges are enforced via Firestore Security Rules, NOT client-side.**
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

`.env` is gitignored, so its contents are not discoverable from the repo. Required keys:
- Firebase config: API key, auth domain, project ID, storage bucket, messaging sender ID, app ID
- Google OAuth Client IDs: Web (required), Android/iOS (optional for testing, required for production)

## Platform Notes

- Supports iOS, Android, Web with a single light theme
- Expo File System uses the **legacy API** (SDK 54 compatibility) — do not migrate to the new API
- React Native Reanimated animations run on the UI thread (60fps)

## Feature Gotchas

### Multi-Language Instructions
Exercise instructions are available in English, Spanish, French, and German.

- Instructions are stored as a `{ en, es, fr, de }` object **or** as a legacy plain string. Both formats are live in the database — helper functions in `utils/languageHelpers.ts` must handle both, and there is deliberately **no migration**.
- English is required; the other three are optional.
- User preference lives in the `preferredLanguage` field on the `User` type, and can be temporarily overridden per-exercise.

### Download Paywall
One-time €1.99 purchase unlocks all downloadable files via Google Play Billing.

- **Status:** Fully live. `premium_file_access` product created in Google Play Console at €1.99, license testing configured, purchase flow verified.
- Admins bypass the paywall entirely (free access).
- Premium status is stored on the Firestore user document; `AuthContext` exposes `hasPremiumAccess` and `refreshPremiumStatus`.
- Web shows a "not available" message — purchases are mobile-only.
