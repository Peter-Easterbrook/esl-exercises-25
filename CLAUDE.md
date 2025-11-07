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
- **User Management** - Admin interface for managing user accounts with search, view details, edit names, reset progress, and delete accounts
- **Analytics Dashboard** - Comprehensive analytics with real-time data visualization, category performance, difficulty distribution, user activity trends, top exercises, and recent activity tracking
- **App Settings Management** - Admin interface for configuring exercise settings, user management, notifications, and maintenance mode
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
    - `add-exercise.tsx` - Exercise creation and editing interface (supports both create and edit modes via route parameters)
    - `manage-exercises.tsx` - Exercise management and editing
    - `manage-users.tsx` - User management interface with search, view details, edit, reset progress, and delete capabilities
    - `upload-files.tsx` - File upload and management interface for linking documents to exercises
    - `analytics.tsx` - Comprehensive analytics dashboard with charts and data visualization
    - `app-settings.tsx` - App configuration interface for exercise, user, notification, and admin settings

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

  - `firebaseService.ts` - Firebase Firestore operations (CRUD for exercises, categories, progress, user management, analytics data aggregation, and app settings management)
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
- **react-native-chart-kit** for data visualization (line charts, bar charts, pie charts)

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
- Analytics dashboard (`/admin/analytics`) - `slide_from_right` for data viewing
- App Settings (`/admin/app-settings`) - `slide_from_right` for configuration
- User Management (`/admin/manage-users`) - `slide_from_right` for user administration
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
- **App Settings** - Global app configuration stored in `appSettings/config` document (exercise settings, user management, notifications, admin settings)

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

- **Dashboard** - Real-time usage statistics from Firebase with exercise counts, user metrics, and activity tracking
- **Create Exercises** - Add new exercises with multiple choice questions through intuitive form interface
- **Edit Exercises** - Full editing capability for existing exercises
  - Click pencil icon in manage-exercises screen
  - Pre-populated form with all exercise data (title, description, instructions, questions, answers, explanations)
  - Uses same interface as add-exercise.tsx with route parameter `?id={exerciseId}` to enable edit mode
  - Updates exercise in Firebase and redirects back to manage-exercises screen
- **Delete Exercises** - Remove exercises with confirmation dialog
  - Click trash icon in manage-exercises screen
  - Destructive confirmation alert prevents accidental deletion
  - Permanently removes exercise from Firebase
  - Automatic list refresh after deletion
- **Search & Filter** - Search exercises by title or description in manage-exercises screen
- **Upload Files** - Manage downloadable files (PDF, DOC, DOCX up to 10MB)
- **Link Files** - Connect files to specific exercises or make them available to entire categories
- **User Management** - Complete user account administration
  - View all users with search functionality (by email or display name)
  - View detailed user statistics (completed exercises, average score, streak, category breakdown, recent activity)
  - Edit user display names
  - Reset user progress with confirmation (deletes all exercise data while keeping account)
  - Delete user accounts with double confirmation (requires email verification)
  - User avatars with initials displayed in list view
  - Modal-based details and editing for seamless workflow
  - All destructive operations require explicit confirmation
- **Analytics & Reporting** - Comprehensive analytics dashboard with real-time data visualization (see Analytics Dashboard section below)
- **App Settings** - Centralized configuration interface for managing app-wide settings (see App Settings Management section below)

### Analytics Dashboard

The Analytics Dashboard (`/admin/analytics`) provides comprehensive real-time insights into app usage and performance with interactive data visualizations.

#### Features
- **Key Metrics Cards** - At-a-glance statistics:
  - Total Completions - All exercise completions across all users
  - Average Score - Mean score percentage across all attempts
  - Completion Rate - Percentage of exercises completed vs. available
- **Three-Tab Interface**:
  - **Overview** - General app performance and trends
  - **Users** - User-focused analytics and activity
  - **Exercises** - Exercise-specific performance data

#### Visualizations (using react-native-chart-kit)
- **Line Charts** - User activity trends over last 7 days (daily active users)
- **Bar Charts** - Category performance and top exercises by completion count
- **Pie Charts** - Difficulty distribution (Beginner/Intermediate/Advanced)
- **Recent Activity Feed** - Last 10 exercise completions with user info, scores, and relative time

#### Data Sources
- Real-time data from Firebase Firestore collections:
  - `exercises` - All exercise metadata
  - `users` - User accounts and profiles
  - `userProgress` - Exercise completion records with scores and timestamps
  - `categories` - Category names for proper labeling

#### Analytics Calculations
- **Total Completions** - Count of all completed exercises
- **Average Score** - Mean of all exercise scores (handles division by zero)
- **Completion Rate** - (Total completions / (exercises × users)) × 100
- **Category Performance** - Exercises grouped by category with completion counts and percentages
- **Difficulty Distribution** - Completions grouped by difficulty level
- **Top Exercises** - Top 5 most completed exercises ranked by completion count
- **User Activity Trend** - Unique active users per day for last 7 days
- **Recent Activity** - Last 10 completions with user names (display name or email prefix), exercise titles, scores, and human-readable timestamps ("2h ago", "3d ago")

#### Technical Implementation
- **Date Handling** - Defensive checks for Date objects using `instanceof Date` to prevent runtime errors
- **Firestore Timestamp Conversion** - Proper conversion using `toDate()` with fallbacks
- **Category Name Resolution** - Fetches category data to display names instead of IDs
- **Performance** - Single database query per collection, client-side aggregation
- **Error Handling** - Try-catch with user-friendly error alerts
- **Loading States** - Themed activity indicators during data fetch

#### UI/UX Design
- **Navigation** - Accessible from Admin dashboard with `slide_from_right` animation
- **Tab Layout** - Segmented control for switching between Overview/Users/Exercises
- **Chart Styling** - Consistent color scheme (green for categories, purple for users, blue for overview)
- **Responsive Charts** - Charts sized to screen width minus padding
- **Empty States** - Graceful handling when no data available
- **Professional Design** - White cards with shadows, proper spacing, themed text

### App Settings Management

The App Settings screen (`/admin/app-settings`) provides a centralized interface for administrators to configure app-wide settings stored in Firebase Firestore.

#### Settings Categories

**Exercise Settings**
- **Default Time Limit** - Default duration for timed exercises (in minutes)
- **Show Solutions Immediately** - Toggle to allow users to see answers right away
- **Enable Points System** - Toggle to award points for completed exercises

**User Management**
- **Allow New Registrations** - Enable/disable new user account creation
- **Require Email Verification** - Force email verification before app access

**Notifications**
- **Enable Push Notifications** - Global toggle for push notification system
- **Daily Reminder Time** - Time for daily practice reminders (HH:MM format)

**Admin Settings**
- **Maintenance Mode** - Disable app for non-admin users during updates
- **Announcement Banner** - Global message displayed to all users (multiline text)

#### Features
- **Real-time Configuration** - Changes take effect immediately across the app
- **Default Settings** - Automatic initialization with sensible defaults if no settings exist
- **Reset to Defaults** - One-click reset with confirmation dialog
- **Input Validation** - Proper keyboard types (numeric for numbers, text for strings)
- **Loading States** - Activity indicators during save operations
- **Success/Error Feedback** - User-friendly alerts for all operations

#### Data Storage
- Settings stored in Firestore collection `appSettings/config`
- Structured as single document with nested objects for each category
- Default settings created automatically on first access

#### Security
- **Admin-only Access** - Settings screen redirects non-admins to main tabs
- **Firestore Rules** - Only admin users can read/write `appSettings` collection
- **Server-side Validation** - Firestore security rules enforce admin privileges

#### UI/UX Design
- **Section-based Layout** - Clear visual grouping with colored icons
  - Green (doc.text) for Exercise Settings
  - Purple (person.2) for User Management
  - Orange (bell) for Notifications
  - Brown (gear) for Admin Settings
- **Card Design** - White cards with shadows for each setting group
- **Switch Components** - Native iOS/Android switches with colored tracks
- **Text Inputs** - Bordered inputs for numeric and text values
- **Action Buttons** - Large save button (green) and reset button (outlined red)
- **Responsive Layout** - Scrollable content with proper spacing

#### Technical Implementation
- **TypeScript Interface** - `AppSettings` type exported from firebaseService.ts
- **State Management** - Local state with immediate updates to inputs
- **Firestore Operations**:
  - `getAppSettings()` - Fetch current settings or create defaults
  - `updateAppSettings()` - Partial update of settings
  - `resetAppSettings()` - Overwrite with default values
- **Error Handling** - Try-catch blocks with user-friendly error alerts
- **Confirmation Dialogs** - Alert.alert for destructive operations (reset)

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

#### 🔒 Credential Management & Production Security

**CRITICAL: NEVER commit sensitive files to version control**

- **admin.txt** - Contains test/admin credentials
  - This file is in .gitignore and should NEVER be committed to git
  - Used ONLY for local development and testing
  - Delete or secure this file before production deployment
  - For production, manage admin users directly in Firebase Console

- **Firebase Configuration** (config/firebase.ts)
  - API keys in client-side code are NORMAL for Firebase
  - Firebase security is enforced through Firestore Security Rules, NOT API key secrecy
  - API keys are not secret and are embedded in mobile apps
  - Security comes from properly configured Firestore Rules (see below)
  - For production, consider using environment-specific configs

- **Environment Variables**
  - Any .env files are automatically ignored by .gitignore
  - Never commit .env, .env.local, or .env.production files
  - Use Expo Secrets or EAS environment variables for production

**Production Deployment Checklist:**
- [ ] Remove or secure admin.txt file
- [ ] Verify Firebase Security Rules are properly configured
- [ ] Test that non-admin users cannot access admin features
- [ ] Verify all Firestore collections have proper read/write rules
- [ ] Test data deletion flows (progress deletion, account deletion)
- [ ] Review Privacy Policy matches actual data practices
- [ ] Ensure no test credentials or API keys are hardcoded in code
- [ ] Configure Firebase App Check for additional security (optional)

#### Firebase Firestore Security Rules

The app uses comprehensive Firestore security rules to protect user data and restrict admin operations. These rules must be configured in the Firebase Console (Firestore Database > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users collection - users can read/write their own data, admins can read all
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // User progress - users can read/write their own progress
    match /userProgress/{progressId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Categories - everyone can read, only admins can write
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Exercises - everyone can read, only admins can write
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Downloadable files - everyone can read, only admins can write
    match /downloadableFiles/{fileId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // App Settings - only admins can read/write
    match /appSettings/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

**Key Security Policies:**
- **Authentication Required** - All database access requires Firebase authentication
- **User Data Isolation** - Users can only access their own progress and profile data
- **Admin Verification** - Admin operations verified through Firestore lookup, not client claims
- **Content Protection** - Exercises, categories, and files are read-only for regular users
- **Settings Protection** - App settings are completely restricted to admin users only

#### Firebase Storage Security Rules

For downloadable files (PDFs, DOCs), configure Firebase Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Documents folder - all authenticated users can read, only admins can write
    match /documents/{categoryId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
      // Max file size: 10MB
      allow write: if request.resource.size < 10 * 1024 * 1024;
      // Only allow PDF, DOC, DOCX files
      allow write: if request.resource.contentType.matches('application/pdf') ||
                     request.resource.contentType.matches('application/msword') ||
                     request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }
}
```

**Storage Security Features:**
- Authenticated users can download files
- Only admins can upload files
- File size limited to 10MB
- File type restricted to PDF, DOC, DOCX
- Files organized by category ID

#### Testing Security Rules

**Before deploying to production, test your security rules:**

1. **Use Firebase Emulator Suite** (recommended for local testing):
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start --only firestore,storage
```

2. **Test with Firebase Console Rules Playground**:
   - Go to Firestore Database > Rules tab
   - Click "Rules Playground"
   - Test read/write operations with different user contexts

3. **Manual Testing Checklist**:
   - [ ] Regular user CANNOT access another user's progress
   - [ ] Regular user CANNOT modify exercises or categories
   - [ ] Regular user CANNOT access appSettings
   - [ ] Admin CAN access all collections
   - [ ] Unauthenticated users CANNOT access any data
   - [ ] Users CAN delete their own progress
   - [ ] Users CAN update their own profile (display name)
   - [ ] Users CANNOT update other users' profiles
   - [ ] Files can be downloaded by authenticated users
   - [ ] Files can only be uploaded by admins

4. **Production Verification**:
   - Deploy rules: Firebase Console > Firestore/Storage > Rules > Publish
   - Test with production data using test accounts
   - Monitor Firebase Console > Usage for suspicious activity

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
