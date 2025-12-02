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

## Code Style

- Expo ESLint configuration
- TypeScript strict mode enabled
- All components use named exports with types
- Styled with `StyleSheet.create()`
- Themed components use `useThemeColor` hook
- Single light theme (Colors.dark contains light appearance colors)
- Animations configured in navigation options

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

## Firebase Firestore Security Rules

Required rules configuration (set in Firebase Console):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /userProgress/{progressId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /downloadableFiles/{fileId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /appSettings/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

## Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /documents/{categoryId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      allow write: if request.resource.size < 10 * 1024 * 1024;
      allow write: if request.resource.contentType.matches('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }
}
```

## Performance Notes

- React Native Reanimated runs animations on UI thread (60fps)
- Confetti auto-stops after 4 seconds
- Use FlatList for large lists
- Category expansion uses `withTiming`

## Platform Support

- iOS, Android, Web
- SF Symbols for iOS iconography
- Platform-specific color scheme detection removed (single light theme only)
- Status bar set to 'dark' style

## Known Issues & Limitations

- Expo File System new API has compatibility issues in SDK 54 (using legacy API)
- Confetti requires manual timeout
- Some animations may differ on low-end devices
- Web platform has limited animation support

## Environment Variables

Required environment variables in `.env` file:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=<your_api_key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_project>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<your_project_id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<your_project>.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
EXPO_PUBLIC_FIREBASE_APP_ID=<app_id>

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web_client_id>.apps.googleusercontent.com
# Optional: For native Android/iOS apps
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios_client_id>.apps.googleusercontent.com
```

**Note:** The app will fallback to using Web Client ID for Android/iOS if platform-specific IDs are not provided. This works for Expo Go testing but requires platform-specific IDs for production builds.

## Google OAuth Configuration

### Google Cloud Console Setup:
1. Create OAuth 2.0 Client ID at https://console.cloud.google.com/apis/credentials
2. Application type: **Web application**
3. Add authorized redirect URIs:
   - `https://auth.expo.io/@<your_expo_username>/<your_app_slug>`
   - `http://localhost:8081`
   - `http://localhost:19006`
4. Add authorized JavaScript origins:
   - `http://localhost:8081`
   - `http://localhost:19006`

### Firebase Console Setup:
1. Enable Google sign-in provider in Authentication > Sign-in method
2. Configure Web SDK with the Web Client ID from Google Cloud Console
3. Add Web Client Secret if required

### For Android Production:
1. Generate SHA-1 fingerprint: `cd android && ./gradlew signingReport`
2. Create Android OAuth Client in Google Cloud Console
3. Add SHA-1 to Firebase Console (Project Settings > Your apps > Android)
4. Add package name: `com.petereasterbro1.eslexercises25`

### For iOS Production:
1. Create iOS OAuth Client in Google Cloud Console
2. Configure with bundle identifier: `com.petereasterbro1.eslexercises25`

## Path Aliases

- `@/*` - Maps to root directory for clean imports

## Production Checklist

### Firebase & Security
- [ ] Verify Firebase Security Rules are configured
- [ ] Test non-admin users cannot access admin features
- [ ] Test data deletion flows (progress, account deletion)
- [ ] Remove or secure admin test data
- [ ] Ensure no hardcoded test credentials
- [ ] Review Privacy Policy matches actual practices

### Google OAuth
- [ ] Configure Google OAuth consent screen (External, with app details)
- [ ] Add test users to OAuth consent screen if app is in Testing mode
- [ ] Verify Web OAuth Client has correct redirect URIs configured
- [ ] For Android: Generate and add SHA-1 fingerprint to Firebase
- [ ] For Android: Create Android OAuth Client with correct package name
- [ ] For iOS: Create iOS OAuth Client with correct bundle identifier
- [ ] Test Google Sign-In on all target platforms (web, Android, iOS)
- [ ] Verify user documents are created correctly in Firestore after Google sign-in
