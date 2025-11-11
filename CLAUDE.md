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

- Firebase Auth required for all features
- Admin privileges enforced via Firestore Security Rules (NOT client-side)
- User can only access own progress/profile data
- All destructive operations require confirmation

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

## Path Aliases

- `@/*` - Maps to root directory for clean imports

## Production Checklist

- [ ] Verify Firebase Security Rules are configured
- [ ] Test non-admin users cannot access admin features
- [ ] Test data deletion flows (progress, account deletion)
- [ ] Remove or secure admin test data
- [ ] Ensure no hardcoded test credentials
- [ ] Review Privacy Policy matches actual practices
