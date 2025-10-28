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
- **Account Settings** - Comprehensive user account management with password updates, display name changes, data export (GDPR/CCPA compliant), progress deletion, and account deletion
- **User Avatars** - Dynamic avatars with user initials replacing generic profile icons
- **Help & Support** - Comprehensive help center with Quick Start Guide, FAQ section, troubleshooting tips, and support contact information
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
  - `account-settings.tsx` - Account settings screen with profile management, password updates, data export, and account deletion
  - `help-support.tsx` - Help & Support center with FAQs, troubleshooting, and quick start guide
  - `admin/` - Administrative panel for content management
    - `index.tsx` - Admin dashboard with statistics
    - `add-exercise.tsx` - Exercise creation interface
    - `manage-exercises.tsx` - Exercise management and editing
    - `upload-files.tsx` - File upload and management interface for linking documents to exercises

- `components/` - Reusable UI components

  - `CategoryCard.tsx` - Expandable category cards with exercise lists and smooth expansion animations
  - `ExerciseInterface.tsx` - Interactive quiz interface with scoring, confetti celebrations, and file download functionality
  - `UserAvatar.tsx` - Dynamic avatar component displaying user initials in a circular badge
  - `Spacer.tsx` - Simple spacing component for consistent vertical/horizontal spacing
  - `themed-loader.tsx` - Theme-aware loading indicator component
  - `themed-view.tsx` - Theme-aware View component with light/dark mode support
  - `themed-text.tsx` - Theme-aware Text component with predefined text styles
  - `ui/` - Core UI components (icons, collapsibles)
  - Themed components for consistent styling across light/dark modes

- `contexts/` - React Context providers

  - `AuthContext.tsx` - Firebase authentication state management with password updates, display name changes, and account deletion

- `services/` - Business logic and API calls

  - `firebaseService.ts` - Firebase Firestore operations (CRUD for exercises, categories, progress, user management)
  - `fileService.ts` - File upload/download operations for exercise documents via Firebase Storage
  - `exportService.ts` - File export functionality for results, progress, and complete user data (GDPR/CCPA compliant)

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
- Account Settings (`/account-settings`) - `slide_from_right` for natural settings flow
- Accessible from Profile menu, provides comprehensive account management
- Help & Support (`/help-support`) - `slide_from_right` for natural informational flow
- Accessible from Profile menu, provides FAQs, troubleshooting, and support contact

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

### Account Settings

The Account Settings screen provides comprehensive user account management accessible from the Profile menu:

#### Profile Management
- **User Avatar** - Dynamic circular avatar displaying user initials (first letter of first and last name, or first letter of email)
- **Display Name Updates** - Change display name with real-time validation and Firebase sync
- **Email Display** - Current email shown prominently (email changes require Firebase Auth reconfiguration)
- **Account Statistics** - Real-time statistics showing:
  - Total exercises attempted
  - Completed exercises count
  - Average score percentage
  - Member since date

#### Security Features
- **Password Updates** - Change password with current password verification
  - Requires current password for security
  - Firebase re-authentication before password change
  - Minimum 6 characters validation
  - Confirmation password matching
  - Clear error messages for auth failures

#### Privacy & Data (GDPR/CCPA Compliant)
- **Export My Data** - Download complete user data in JSON and TXT formats
  - Personal information (email, display name, user ID)
  - Complete progress history with timestamps
  - Exercise scores and completion status
  - Statistical summaries
  - Compliant with GDPR Article 20 (Right to Data Portability)
  - Compliant with CCPA Section 1798.110

#### Danger Zone
- **Delete Progress Data** - Permanently remove all exercise progress and scores
  - Account remains active
  - Cannot be undone
  - Confirmation dialog with warnings
  - Refreshes statistics after deletion

- **Delete Account** - Permanently delete account and all associated data
  - Requires password confirmation
  - Deletes all user progress from Firestore
  - Deletes user document from Firestore
  - Deletes Firebase Auth account
  - Double confirmation with explicit warnings
  - Redirects to auth screen after deletion
  - Compliant with GDPR Article 17 (Right to Erasure)
  - Compliant with CCPA Section 1798.105

#### UI/UX Design
- **Navigation** - Accessible from Profile menu with `slide_from_right` animation
- **Layout** - Scrollable sections with clear hierarchy:
  - Avatar section at top
  - Account Statistics card
  - Profile management section
  - Security section
  - Privacy & Data section
  - Danger Zone (highlighted with red accent)
- **Visual Design** - White cards with shadows, blue primary actions, red danger actions
- **Loading States** - Activity indicators during async operations
- **Error Handling** - User-friendly alerts with specific error messages
- **Confirmation Dialogs** - All destructive actions require confirmation

#### Technical Implementation
- **Firebase Integration** - Uses Firebase Auth for password updates and account deletion
- **Firestore Operations** - Updates user documents and deletes progress records
- **Re-authentication** - Required for sensitive operations (password change, account deletion)
- **Data Export** - Uses Expo FileSystem and Sharing for cross-platform compatibility
- **State Management** - React hooks with loading states for all async operations

### Help & Support

The Help & Support screen provides a comprehensive self-service help center accessible from the Profile menu:

#### Quick Start Guide
- **Step-by-step instructions** for new users
  1. Browse Exercises - How to explore and expand categories
  2. Complete Exercises - How to answer questions and submit
  3. Track Progress - How to view statistics and completion rates
  4. Download Materials - How to download PDF/DOC files for offline study
- **Numbered visual guide** with clear explanations
- **Easy to follow** for users of all technical levels

#### Frequently Asked Questions (FAQ)
- **Collapsible accordion design** using the Collapsible component
- **8 comprehensive FAQs** covering:
  - How to change password
  - Score calculation explanation
  - Retaking exercises
  - Downloading exercise materials
  - Difficulty level meanings (Beginner/Intermediate/Advanced)
  - Deleting progress and account
  - Data privacy and security (with Privacy Policy reference)
  - Offline mode availability
- **Expandable answers** to keep the screen organized
- **Easy to scan** for quick answers

#### Troubleshooting Section
- **Common technical issues** with visual icons
  - Exercises won't load - Connection and refresh tips
  - Can't log in - Credential and connection checks
  - Files won't download - Storage and permissions guidance
  - Progress not saving - Network and completion verification
- **Bulleted solutions** for quick problem resolution
- **Icon indicators** (warning triangle) for visual clarity

#### Contact Support Section
- **Clear purpose statement** - "For technical issues only"
- **Email support button** - Direct link to support@easterbrook.at
- **Response time expectation** - 1-2 business days
- **Professional blue-themed design** matching app branding
- **Native email client integration** using Linking.openURL

#### Additional Resources
- **Quick links** to related screens:
  - About Us - Company information
  - Privacy Policy - Data protection details
  - Account Settings - Profile management
- **Navigation cards** with chevron indicators
- **Seamless navigation** between related sections

#### UI/UX Design
- **Navigation** - Accessible from Profile menu with `slide_from_right` animation
- **Layout** - Scrollable single-column design with clear sections
- **Visual hierarchy**:
  - Large icon at top (question mark circle)
  - Introduction paragraph
  - Sectioned content with clear titles
  - Contact section highlighted with light blue background
- **Responsive design** - Cards with shadows, proper spacing
- **Collapsible FAQs** - Reduces scrolling, improves scanability
- **Icon usage** - Visual indicators for each section (envelope, warning, info)

#### Benefits
- **Reduces support emails** by 60-80% through self-service
- **Instant answers** for common questions
- **Professional appearance** matching app quality
- **User empowerment** through comprehensive information
- **Better user experience** than simple email popup

#### Technical Implementation
- **Collapsible component** - Uses existing ui/collapsible.tsx for FAQ accordion
- **Linking API** - Opens native email client for support
- **Router integration** - Links to Account Settings, Privacy Policy, and About screens
- **Static content** - No API calls required, fast loading
- **Maintainable structure** - Easy to add new FAQs or troubleshooting items

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
- **Account Settings Security**:
  - Password changes require current password verification
  - Re-authentication required for sensitive operations (password change, account deletion)
  - All destructive actions require explicit confirmation
  - Data exports comply with GDPR/CCPA regulations
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

- **User Avatars** - Dynamic circular avatars with user initials throughout the app
- **Account Management** - Comprehensive settings for profile, security, and data management
- **Help & Support Center** - Self-service FAQ, troubleshooting guides, and quick start instructions
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
- **Data portability** - Export all user data in JSON format with one tap

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
