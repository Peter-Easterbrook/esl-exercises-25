# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a complete **ESL (English as Second Language) Exercises** mobile application built with Expo React Native, TypeScript, and Firebase. The app helps non-native English speakers learn and practice English through categorized exercises with interactive quizzes, progress tracking, and administrative tools.

## Key Commands

### Development
- `npx expo start` - Start the development server
- `npm run start` - Alternative way to start development server
- `npm run android` - Start with Android emulator
- `npm run ios` - Start with iOS simulator
- `npm run web` - Start web development server

### Code Quality
- `npm run lint` - Run ESLint using Expo's configuration
- `expo lint` - Alternative lint command

### Project Management
- `npm run reset-project` - Move starter code to app-example/ and create blank app/ directory

## Architecture

### Application Features
- **User Authentication** - Firebase Auth with email/password
- **Category-based Learning** - Organized exercise categories (Tenses, Grammar, Vocabulary, etc.)
- **Interactive Exercises** - Multiple choice questions with explanations
- **Progress Tracking** - User progress saved to Firebase with scoring
- **Results Export** - Export exercise results and progress reports
- **Admin Panel** - Full content management for administrators
- **Responsive UI** - Support for light/dark themes and haptic feedback

### File Structure
- `app/` - Main application screens using Expo Router file-based routing
  - `_layout.tsx` - Root layout with Firebase auth and navigation stack
  - `auth/` - Authentication screens (login/register)
  - `(tabs)/` - Tab-based navigation group for authenticated users
    - `index.tsx` - Categories screen with expandable exercise lists
    - `progress.tsx` - User progress tracking and statistics
    - `profile.tsx` - User profile and settings
  - `exercise/[id].tsx` - Exercise detail and completion interface
  - `admin/` - Administrative panel for content management
    - `index.tsx` - Admin dashboard with statistics
    - `add-exercise.tsx` - Exercise creation interface
    - `manage-exercises.tsx` - Exercise management and editing

- `components/` - Reusable UI components
  - `CategoryCard.tsx` - Expandable category cards with exercise lists
  - `ExerciseInterface.tsx` - Interactive quiz interface with scoring
  - `themed-loader.tsx` - Theme-aware loading indicator component
  - `themed-view.tsx` - Theme-aware View component with light/dark mode support
  - `themed-text.tsx` - Theme-aware Text component with predefined text styles
  - `ui/` - Core UI components (icons, collapsibles)
  - Themed components for consistent styling across light/dark modes

- `contexts/` - React Context providers
  - `AuthContext.tsx` - Firebase authentication state management

- `services/` - Business logic and API calls
  - `firebaseService.ts` - Firebase Firestore operations (CRUD for exercises, categories, progress)
  - `exportService.ts` - File export functionality for results and progress

- `types/` - TypeScript type definitions
  - `index.ts` - Exercise, Category, User, and Progress type definitions

- `config/` - Configuration files
  - `firebase.ts` - Firebase project configuration

### Key Technologies
- **Expo SDK 54** with Expo Router for navigation
- **React Native 0.81** with React 19
- **TypeScript** with strict mode enabled
- **Firebase** - Authentication, Firestore database, and file storage
- **React Navigation** v7 for tab navigation
- **Expo Vector Icons** and SF Symbols for iconography
- **React Native Reanimated** v4 for animations
- **React Native Gesture Handler** for touch interactions
- **Expo File System & Sharing** for export functionality

### Data Structure
- **Users** - Authentication and profile data with admin flags
- **Categories** - Exercise categories with metadata and icons
- **Exercises** - Complete exercise data with questions, answers, and explanations
- **User Progress** - Completion status and scores per user per exercise

### Firebase Setup Required
Before running the app, you must:
1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication with email/password
3. Create a Firestore database
4. Update `config/firebase.ts` with your project credentials
5. The app will automatically initialize default categories and sample exercises

### Authentication Flow
- Unauthenticated users are redirected to `/auth`
- Users can register or login with email/password
- Authenticated users access the main tab navigation
- Admin users have access to the admin panel via profile screen

### Admin Features
- Dashboard with usage statistics
- Create new exercises with multiple choice questions
- Manage existing exercises (view, edit, delete)
- User management (future feature)
- Analytics and reporting (future feature)

## Development Notes

### Code Style
- Uses Expo's ESLint configuration
- VSCode configured for auto-fix on save, import organization, and member sorting
- TypeScript strict mode enabled
- Firebase operations include error handling and fallback to mock data
- Themed components use `useThemeColor` hook for consistent light/dark mode support
- All components follow pattern: named export with TypeScript types, StyleSheet.create for styles

### Security Considerations
- User authentication required for all main features
- Admin privileges checked server-side
- Exercise data validated before saving
- File exports use secure temporary files

### Platform Support
- iOS, Android, and Web platforms supported
- Platform-specific implementations for color scheme detection
- SF Symbols used for iOS-native iconography
- File sharing available on all platforms

### Path Aliases
- `@/*` - Maps to root directory for clean imports