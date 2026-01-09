# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

ESL (English as Second Language) Exercises mobile application built with Expo React Native, TypeScript, and Firebase. The app helps non-native English speakers learn and practice English through categorized exercises, progress tracking, and administrative tools.

## File Structure

- `app/` - Expo Router screens (file-based routing)
  - `_layout.tsx` - Root layout with Firebase auth and navigation
  - `auth/` - Authentication screens
  - `(tabs)/` - Tab navigation (categories, progress, profile)
  - `exercise/[id].tsx` - Exercise interface
  - `admin/` - Admin screens (dashboard, exercises, users, analytics, settings, files)
  - Other info screens: `about.tsx`, `privacy-policy.tsx`, `account-settings.tsx`, `help-support.tsx`

- `components/` - Reusable UI components
  - `themed-*` - Themed components for consistent styling
  - `CategoryCard.tsx`, `ExerciseInterface.tsx`, `UserAvatar.tsx`, `Spacer.tsx`
  - `ui/` - Core UI components

- `contexts/` - React Context
  - `AuthContext.tsx` - Firebase authentication state

- `services/` - Business logic
  - `firebaseService.ts` - Firestore CRUD operations
  - `fileService.ts` - Firebase Storage operations
  - `exportService.ts` - User data export functionality
  - `premiumService.ts` - In-app purchase operations (native-only, uses dynamic imports)

- `types/` - TypeScript definitions
- `config/` - Firebase configuration
- `constants/` - Theme colors and constants
- `hooks/` - Custom React hooks

## Key Technologies

- Expo SDK 54, React Native 0.81, React 19
- TypeScript (strict mode)
- Firebase (Authentication, Firestore, Storage)
- React Navigation v7, Expo Router
- React Native Reanimated v4 (animations)
- react-native-chart-kit (analytics visualizations)
- expo-auth-session (Google OAuth integration)
- @react-native-async-storage/async-storage (Firebase auth persistence)
- react-native-iap (In-app purchases - native only, see Native-Only Modules section)

## Code Style

- Expo ESLint configuration
- TypeScript strict mode enabled
- All components use named exports with types
- Styled with `StyleSheet.create()`
- Themed components use `useThemeColor` hook
- Single light theme (Colors.dark contains light appearance colors)
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
  - Works on web, iOS, and Android (requires platform-specific OAuth Client IDs for native apps)

### Security
- Firebase Auth required for all features
- Admin privileges enforced via Firestore Security Rules (NOT client-side)
- User can only access own progress/profile data
- All destructive operations require confirmation
- Auth persistence via AsyncStorage (React Native) and localStorage (Web)

## Firebase Security Rules

**Firestore:** Enforce authentication on all collections. Admin-only write access for categories, exercises, downloadableFiles, appSettings. Users can read/write own data in users and userProgress collections.

**Storage:** Authenticated read access. Admin-only write with 10MB limit for PDF/DOC files in `documents/{categoryId}/{fileName}` path.

## Performance & Platform

- React Native Reanimated animations run on UI thread (60fps). Use FlatList for large lists.
- Supports iOS, Android, Web with single light theme
- Expo File System uses legacy API (SDK 54 compatibility)
- Animations may vary on low-end devices and web

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

Required `.env` file:
- Firebase config: API key, auth domain, project ID, storage bucket, messaging sender ID, app ID
- Google OAuth Client IDs: Web (required), Android/iOS (optional for testing, required for production)

## Google OAuth Setup

**Quick Setup:**
1. Create Web OAuth Client at Google Cloud Console
2. Enable Google sign-in in Firebase Authentication
3. Set environment variables in `.env`

**Production:** Generate platform-specific OAuth Clients for Android (with SHA-1) and iOS (with bundle ID: `com.petereasterbro1.eslexercises25`)

## Production Checklist

- [ ] Firebase Security Rules configured and tested
- [ ] Admin access enforcement verified
- [ ] Google OAuth consent screen configured
- [ ] Platform-specific OAuth Clients created for Android/iOS
- [ ] Test Google Sign-In on all platforms
- [ ] Privacy Policy reviewed

## Recent Features

### Multi-Language Support ✅
Exercise instructions now available in 4 languages: English 🇬🇧, Spanish 🇪🇸, French 🇫🇷, German 🇩🇪

**User Features:**
- Set preferred language in account settings (applies to all exercises by default)
- Temporarily override language when viewing individual exercises
- Flag-based language selector with visual feedback

**Admin Features:**
- 4 separate input fields when creating/editing exercises
- English required, other languages optional
- Automatic conversion of legacy string-format instructions

**Technical:**
- Fully backwards compatible (no database migration needed)
- Instructions stored as `{ en, es, fr, de }` object or legacy string
- Helper functions handle both formats seamlessly
- User preference: `preferredLanguage` field in User type

**Files:**
- `constants/languages.ts` - Language definitions
- `utils/languageHelpers.ts` - Format detection and conversion
- `app/admin/add-exercise.tsx` - Multi-language input UI
- `app/account-settings.tsx` - Language preference selector
- `app/exercise/[id].tsx` - Per-exercise language switcher

### Download Paywall ✅
**See `PAYWALL.md` for complete documentation**

One-time €1.99 purchase to unlock all downloadable files via Google Play Billing
- Status: Implemented, ready for Google Play Console product setup
- Platform: Android (Google Play Billing), iOS (App Store) supported
- Admins bypass paywall for free access

**User Features:**
- Lock icon shown on files for non-premium users
- Premium purchase modal with feature list
- Restore purchases for device reinstalls
- Web shows "not available" message (purchases mobile-only)

**Technical:**
- Uses `react-native-iap` with dynamic imports (web-safe)
- Premium status stored in Firestore user document
- AuthContext provides `hasPremiumAccess` and `refreshPremiumStatus`

**Files:**
- `services/premiumService.ts` - IAP operations (initialize, purchase, verify, restore)
- `components/PremiumPurchaseModal.tsx` - Purchase UI modal
- `components/CategoryCard.tsx` - Paywall check on download
- `components/ExerciseInterface.tsx` - Paywall check on download

**Next Steps:**
1. Create `premium_file_access` product in Google Play Console at €1.99
2. Add test accounts in License Testing
3. Build with `eas build` and test purchase flow
