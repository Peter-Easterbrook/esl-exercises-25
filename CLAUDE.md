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
- **Downloadable Exercise Files** - Users can download PDF/DOC files linked to exercises
- **File Upload Management** - Admins can upload and link files to specific exercises or categories
- **Results Export** - Export exercise results and progress reports
- **Admin Panel** - Full content management for administrators
- **About Page** - Company information from Easterbrook Language Services with contact details
- **Privacy Policy** - Comprehensive privacy policy accessible from Profile screen, compliant with GDPR, CCPA, and other data protection regulations
- **Responsive UI** - Support for light/dark themes, haptic feedback, and smooth animations
- **Confetti Celebrations** - Visual feedback for perfect scores using react-native-fast-confetti
- **Branding** - Easterbrook logo (LL2020.png) integrated throughout the app

### File Structure

- `app/` - Main application screens using Expo Router file-based routing

  - `_layout.tsx` - Root layout with Firebase auth and navigation stack with transition animations
  - `auth/` - Authentication screens (login/register)
  - `(tabs)/` - Tab-based navigation group for authenticated users
    - `index.tsx` - Categories screen with expandable exercise lists
    - `progress.tsx` - User progress tracking and statistics
    - `profile.tsx` - User profile and settings
  - `exercise/[id].tsx` - Exercise detail and completion interface with animated transitions
  - `about.tsx` - About page with company information, services, and contact details
  - `privacy-policy.tsx` - Privacy policy screen with comprehensive legal information and data practices
  - `admin/` - Administrative panel for content management
    - `index.tsx` - Admin dashboard with statistics
    - `add-exercise.tsx` - Exercise creation interface
    - `manage-exercises.tsx` - Exercise management and editing
    - `upload-files.tsx` - File upload and management interface for linking documents to exercises

- `components/` - Reusable UI components

  - `CategoryCard.tsx` - Expandable category cards with exercise lists and smooth expansion animations
  - `ExerciseInterface.tsx` - Interactive quiz interface with scoring, confetti celebrations, and file download functionality
  - `Spacer.tsx` - Simple spacing component for consistent vertical/horizontal spacing
  - `themed-loader.tsx` - Theme-aware loading indicator component
  - `themed-view.tsx` - Theme-aware View component with light/dark mode support
  - `themed-text.tsx` - Theme-aware Text component with predefined text styles
  - `ui/` - Core UI components (icons, collapsibles)
  - Themed components for consistent styling across light/dark modes

- `contexts/` - React Context providers

  - `AuthContext.tsx` - Firebase authentication state management

- `services/` - Business logic and API calls

  - `firebaseService.ts` - Firebase Firestore operations (CRUD for exercises, categories, progress)
  - `fileService.ts` - File upload/download operations for exercise documents via Firebase Storage
  - `exportService.ts` - File export functionality for results and progress

- `types/` - TypeScript type definitions

  - `index.ts` - Exercise, Category, User, Progress, and DownloadableFile type definitions

- `config/` - Configuration files
  - `firebase.ts` - Firebase project configuration

### Key Technologies

- **Expo SDK 54** with Expo Router for navigation and native stack animations
- **React Native 0.81** with React 19
- **TypeScript** with strict mode enabled
- **Firebase** - Authentication, Firestore database, and file storage
- **React Navigation** v7 for tab navigation with transition animations
- **Expo Vector Icons** and SF Symbols for iconography
- **React Native Reanimated** v4 for smooth, performant animations
- **React Native Gesture Handler** for touch interactions
- **Expo File System & Sharing** for export functionality
- **react-native-fast-confetti** for celebration animations on perfect scores

### Navigation Animations (Expo SDK 54)

The app leverages Expo SDK 54's enhanced navigation animations from `@react-navigation/native-stack`. Each screen transition is carefully chosen to provide intuitive user feedback.

#### Available Animation Types

- `slide_from_right` - iOS-style slide (default forward navigation)
- `slide_from_left` - Reverse slide (back navigation)
- `slide_from_bottom` - Modal-style presentation
- `fade` - Crossfade transition
- `fade_from_bottom` - Fade with slight upward movement
- `flip` - 3D flip animation
- `simple_push` - Android-style push
- `none` - Instant navigation (no animation)

#### Animation Strategy by Screen

**Authentication Flow**

- Auth screen (`/auth`) - `fade` animation for welcoming entry to app
- Provides smooth, non-intrusive transition when users first open the app

**Main Navigation**

- Tab switches - `none` animation for instant, responsive navigation
- Users expect immediate feedback when switching between main sections

**Exercise Flow**

- Categories → Exercise (`/exercise/[id]`) - `slide_from_right` for natural forward progression
- Instructions → Exercise interface - `SlideInRight` with React Native Reanimated
- Exercise completion - `FadeIn` for emphasis on results
- Back navigation uses gesture-enabled `slide_from_left`

**Informational Screens**

- About page (`/about`) - `slide_from_right` for natural forward flow
- Accessible from Profile menu, displays company information and contact details
- Privacy Policy (`/privacy-policy`) - `slide_from_right` for natural forward flow
- Accessible from Profile menu, displays comprehensive privacy and data protection information

**Admin Features**

- Admin panel (`/admin`) - `slide_from_bottom` modal-style for special access
- Add/Manage exercises - `slide_from_right` for sequential workflow
- Emphasizes admin panel as separate, privileged area

**Component-Level Animations**

- Category cards - `FadeIn/FadeOut` with 300ms duration for smooth expansion
- Confetti - 4-second auto-stop celebration for 100% scores
- Progress indicators - Animated transitions using React Native Reanimated

#### Implementation Pattern

```tsx
// In app/_layout.tsx
<Stack.Screen
  name='exercise/[id]'
  options={{
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }}
/>

// In components with React Native Reanimated
<Animated.View
  entering={FadeIn.duration(300)}
  exiting={FadeOut.duration(200)}
>
  {content}
</Animated.View>
```

#### Animation Principles Applied

1. **Hierarchy** - Modal-like screens use `slide_from_bottom`
2. **Flow** - Sequential actions use `slide_from_right`
3. **Speed** - Frequent actions use `none` or short durations
4. **Emphasis** - Important moments use `fade` or special effects (confetti)
5. **Consistency** - Similar actions have similar animations

### Data Structure

- **Users** - Authentication and profile data with admin flags
- **Categories** - Exercise categories with metadata and icons
- **Exercises** - Complete exercise data with questions, answers, and explanations
- **User Progress** - Completion status and scores per user per exercise
- **Downloadable Files** - Uploaded documents (PDF/DOC/DOCX) linked to categories or specific exercises

### Firebase Setup Required

Before running the app, you must:

1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication with email/password
3. Create a Firestore database
4. Enable Firebase Storage for file uploads
5. Update `config/firebase.ts` with your project credentials
6. Configure Firestore Security Rules (see Security Considerations)
7. Configure Storage Security Rules (see Security Considerations)
8. The app will automatically initialize default categories and sample exercises

### Authentication Flow

- Unauthenticated users are redirected to `/auth`
- Users can register or login with email/password
- Authenticated users access the main tab navigation
- Admin users have access to the admin panel via profile screen

### About Page

The About page provides comprehensive information about Easterbrook Language Services:

- **Company Information** - Overview of Easterbrook Language Services and its mission
- **History** - Background and growth from local tutoring to comprehensive platform
- **Services Offered** - English instruction, professional translation, corporate training, and educational technology
- **App Features** - Portfolio highlighting structured learning, interactive practice, progress tracking, and flexible learning
- **Contact Information** - Clickable links to website (easterbrook.at) and email (sdl@easterbrook.at)
- **Branding** - Prominent display of the Easterbrook logo (black lion rampant on gold background)
- **Navigation** - Accessible from Profile menu with `slide_from_right` animation
- **Design** - Professional scrollable layout with themed sections and cards

### Privacy Policy Page

The Privacy Policy page provides comprehensive legal information about data practices:

- **Legal Compliance** - GDPR, CCPA, and other data protection regulations covered
- **Data Collection** - Details on what personal information is collected (email, username, password, exercise progress)
- **Data Usage** - Explanation of how user data is processed and stored
- **User Rights** - Information on accessing, modifying, and deleting personal data
- **Contact Information** - Support contact at admin@onestepweb.dev
- **Company Details** - OneStepWeb postal address (Hornbostelgasse 5, Wien 1060, Austria)
- **Navigation** - Accessible from Profile menu with `slide_from_right` animation
- **Design** - Scrollable legal document with themed text components and proper formatting
- **Last Updated** - October 27, 2025
- **No External APIs** - Privacy policy reflects that the app does not use external APIs (no Google Books API, etc.)

### Admin Features

- Dashboard with real-time usage statistics from Firebase
- Create new exercises with multiple choice questions
- Manage existing exercises (view, edit, delete)
- Upload and manage downloadable files (PDF, DOC, DOCX up to 10MB)
- Link files to specific exercises or make them available to entire categories
- User management (future feature)
- Analytics and reporting (future feature)

### Downloadable Files Feature

- Admins upload documents via the Upload Files screen (`/admin/upload-files`)
- Files can be linked to specific exercises or left category-wide
- Users see downloadable files in category cards after expansion
- Files are stored in Firebase Storage under `documents/{categoryId}/{filename}`
- Metadata stored in `downloadableFiles` Firestore collection
- File downloads use native sharing dialog for cross-platform compatibility
- Maximum file size: 10MB
- Supported formats: PDF, DOC, DOCX

## Development Notes

### Code Style

- Uses Expo's ESLint configuration
- VSCode configured for auto-fix on save, import organization, and member sorting
- TypeScript strict mode enabled
- Firebase operations include error handling and fallback to mock data
- Themed components use `useThemeColor` hook for consistent light/dark mode support
- All components follow pattern: named export with TypeScript types, StyleSheet.create for styles
- Animations use declarative configuration in navigation options where possible
- Component animations use React Native Reanimated for performance

### Performance Considerations

- React Native Reanimated runs animations on the UI thread for 60fps performance
- Confetti automatically stops after 4 seconds to prevent memory issues
- Category expansion uses `withTiming` for smooth, optimized transitions
- Navigation gestures are hardware-accelerated
- Large lists should use `FlatList` or `ScrollView` with proper optimization

### Security Considerations

- User authentication required for all main features
- Admin privileges checked server-side via Firestore rules
- Exercise data validated before saving
- File exports use secure temporary files
- Privacy policy documents all data collection and usage practices
- Firebase Security Rules enforce:
  - Users can only read/write their own data
  - Admins can read all users for statistics
  - Only admins can create/edit/delete exercises and categories
  - File uploads restricted to admins with size/type validation
  - Users can download files but not delete them

### Platform Support

- iOS, Android, and Web platforms supported
- Platform-specific implementations for color scheme detection
- SF Symbols used for iOS-native iconography
- File sharing available on all platforms
- Animations optimized for both iOS and Android
- Status bar set to 'dark' style for white/light app background

### User Experience Features

- **Pull-to-refresh** on progress screen for latest statistics
- **Haptic feedback** on important actions (future implementation)
- **Confetti celebration** when achieving 100% score
- **Smooth transitions** between all screens
- **Gesture-enabled navigation** for natural back gestures
- **Loading states** with themed spinners
- **Error handling** with user-friendly alerts
- **Empty states** with helpful messages
- **Branding** - Easterbrook logo (LL2020.png) appears in authentication, profile, admin panel, and about screens
- **Contact accessibility** - Direct links to email and website from About page
- **Privacy transparency** - Full privacy policy accessible from Profile menu with GDPR/CCPA compliance

### Path Aliases

- `@/*` - Maps to root directory for clean imports

### Known Issues & Limitations

- Expo File System new API has compatibility issues in SDK 54, using legacy API for downloads
- Confetti animation requires manual timeout (no built-in duration prop)
- Some animations may perform differently on low-end devices
- Web platform has limited animation support compared to native

### Future Enhancements

- User management interface for admins
- Detailed analytics dashboard
- Category management interface
- Offline mode with local caching
- Push notifications for new exercises
- Social features (leaderboards, sharing)
- More animation variations for different interaction types
- Haptic feedback integration
