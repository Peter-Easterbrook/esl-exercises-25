# ESL Exam Exercises 📚

A comprehensive English as a Second Language (ESL) learning platform built with Expo and React Native, featuring interactive exercises, progress tracking, and a complete admin management system.

## ✨ Features

### For Learners

- 📝 **Interactive Exercise Types**: Multiple choice, fill-in-the-blanks, true/false, matching, and essay questions
- 📚 **Categorized Learning**: Exercises organized by grammar, vocabulary, tenses, reading comprehension, and error detection
- 📊 **Progress Tracking**: Detailed progress statistics with scores, streaks, and completion rates
- 🎯 **Difficulty Levels**: Beginner, intermediate, and advanced exercises
- 🧪 **Level Test**: CEFR-aligned placement test (A1-B2) to assess English proficiency across 16 grammar topics
- 🎉 **Gamification**: Confetti celebrations for perfect scores and achievement tracking
- 📥 **Downloadable Resources**: Access PDFs and DOCs with premium file unlocking (€2.99 one-time purchase)
- 🌍 **Multi-Language Support**: Exercise instructions in English, Spanish, French, German, and Italian
- 🔄 **Exercise Review**: Review answers with explanations and correct solutions

### For Administrators

- 🔧 **Complete Admin Panel**: Create, edit, and manage exercises and categories
- 👥 **User Management**: View, search, and manage user accounts
- 📈 **Analytics Dashboard**: Comprehensive analytics with charts and user activity trends
- 📁 **File Management**: Upload and organize downloadable exercise materials
- 🧪 **Level Test Management**: Configure CEFR level bands and assessment sections
- ⚙️ **App Settings**: Configure exercise defaults, notifications, and user management settings
- 📊 **Real-time Statistics**: Monitor app usage, completion rates, and performance metrics

### Technical Features

- 🔐 **Secure Authentication**: Firebase Auth with Google OAuth, email/password, and account management
- ☁️ **Cloud Storage**: Firebase Firestore for data and Firebase Storage for files
- 📱 **Platforms**: Android (shipping target) and web
- 🎨 **Modern UI**: Custom themed components with consistent design system
- 💳 **In-App Purchases**: Secure Google Play Billing for premium features (mobile only — web shows a "not available" message)
- ♿ **Accessibility**: Proper accessibility labels and navigation
- 🔄 **Real-time Sync**: Live data synchronization across devices

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher — required by React Native 0.86)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Firebase project** with Authentication, Firestore, and Storage enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Peter-Easterbrook/esl-exercises-25.git
   cd esl-exercises-25
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable **Authentication** (Email/Password and Google Sign-In providers)
   - Enable **Firestore Database**
   - Enable **Firebase Storage**
   - Download your Firebase configuration
   - Add the values to a local `.env` file (gitignored) — `config/firebase.ts` reads them from
     the environment. **Never commit credentials to `config/firebase.ts`.**

4. **Set up Firestore Security Rules**

   The complete, current Firestore and Storage rules live in the `firebase-release-setup`
   skill (`.claude/skills/firebase-release-setup/SKILL.md`), which is the single source of
   truth — they are deliberately not duplicated here, to stop the two copies drifting apart.

   In summary: admin privileges are enforced **server-side by these rules, never
   client-side**. Users may read and write only their own profile and progress; categories,
   exercises, downloadable files, and app settings are readable by any signed-in user and
   writable only by admins.

5. **Initialize default data (optional)**
   - Run the app and sign up as an admin user
   - The app will automatically create sample categories and exercises

6. **Start the development server**
   ```bash
   npx expo start
   ```

### 📱 Running on Devices

- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app
- **Web Browser**: Press `w` in the terminal

> **Note:** In-app purchases are unavailable in Expo Go and on web — `react-native-iap`
> needs a development build. The app degrades gracefully in both cases.

## 📁 Project Structure

```
esl-exercises-25/
├── app/                              # Expo Router app directory
│   ├── (tabs)/                      # Main tab navigation
│   │   ├── _layout.tsx              # Tab navigation layout
│   │   ├── index.tsx                # Home screen with categories
│   │   ├── profile.tsx              # User profile and settings
│   │   └── progress.tsx             # Progress tracking dashboard
│   ├── admin/                       # Admin panel screens
│   │   ├── index.tsx                # Admin dashboard
│   │   ├── analytics.tsx            # Analytics and statistics
│   │   ├── add-exercise.tsx         # Create/edit exercises (multi-language)
│   │   ├── manage-exercises.tsx     # Exercise management
│   │   ├── manage-categories.tsx    # Category management
│   │   ├── manage-users.tsx         # User management
│   │   ├── upload-files.tsx         # Downloadable file upload
│   │   ├── level-test-editor.tsx    # Level test configuration
│   │   └── app-settings.tsx         # App configuration
│   ├── auth/                        # Authentication screens
│   │   └── index.tsx                # Login/signup with Google OAuth
│   ├── exercise/                    # Exercise screens
│   │   └── [id].tsx                 # Dynamic exercise detail with language support
│   ├── _layout.tsx                  # Root layout with Firebase auth provider
│   ├── modal.tsx                    # Modal presentation
│   ├── account-settings.tsx         # User account and language preferences
│   ├── about.tsx                    # About screen
│   ├── help-support.tsx             # Help and support
│   └── privacy-policy.tsx           # Privacy policy
│
├── components/                      # Reusable UI components
│   ├── ExerciseInterface.tsx        # Exercise interface with paywall check
│   ├── LevelTestInterface.tsx       # Level test interface
│   ├── CategoryCard.tsx             # Category display with file lock icon
│   ├── UserAvatar.tsx               # User profile avatar
│   ├── PremiumPurchaseModal.tsx     # Premium purchase modal
│   ├── MilestoneRatingModal.tsx     # Milestone celebration modal
│   ├── Spacer.tsx                   # Layout spacing component
│   ├── themed-text.tsx              # Themed text component
│   ├── themed-view.tsx              # Themed view container
│   ├── themed-loader.tsx            # Themed loading spinner
│   ├── parallax-scroll-view.tsx     # Parallax scroll effect
│   ├── external-link.tsx            # External link component
│   ├── haptic-tab.tsx               # Haptic feedback tab
│   ├── hello-wave.tsx               # Wave animation component
│   └── ui/                          # Base UI components
│       ├── icon-symbol.tsx          # Icon component (with iOS variant)
│       └── collapsible.tsx          # Collapsible container
│
├── contexts/                        # React contexts
│   └── AuthContext.tsx              # Authentication and premium status management
│
├── services/                        # Business logic and API calls
│   ├── firebaseService.ts           # Firestore CRUD operations
│   ├── fileService.ts               # File upload/download operations
│   ├── exportService.ts             # User data export utilities
│   ├── premiumService.ts            # In-app purchase operations
│   └── profilePhotoService.ts       # Profile photo management
│
├── types/                           # TypeScript type definitions
│   └── index.ts                     # All app interfaces and types
│
├── config/                          # Configuration files
│   └── firebase.ts                  # Firebase initialization
│
├── constants/                       # App constants
│   ├── theme.ts                     # Base theme colors and typography
│   ├── themes.ts                    # Theme variants
│   ├── languages.ts                 # Language definitions (EN, ES, FR, DE)
│   └── levelTest.ts                 # Level test bands and sections
│
├── hooks/                           # Custom React hooks
│   ├── use-color-scheme.ts          # Platform color scheme hook
│   ├── use-color-scheme.web.ts      # Web color scheme variant
│   └── use-theme-color.ts           # Theme color resolution
│
└── utils/                           # Utility functions
    ├── adminSetup.ts                # Admin user setup
    ├── debugFirestore.ts            # Development utilities
    └── languageHelpers.ts           # Multi-language helpers
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Expo SDK 57 (React Native 0.86) with Expo Router v56
- **Language**: TypeScript (strict mode)
- **UI Components**: Custom themed components with consistent design system
- **Navigation**: Expo Router (file-based routing with dynamic segments)
- **Animations**: React Native Reanimated v4
- **Charts**: React Native Chart Kit
- **Icons**: Expo Symbols
- **Theme Management**: Custom hooks for platform-specific theming

### Backend & Cloud Services

- **Authentication**: Firebase Auth (Email/Password, Google OAuth)
- **Database**: Firebase Firestore (NoSQL)
- **File Storage**: Firebase Storage (PDFs, DOCs)
- **Real-time**: Firestore real-time listeners
- **In-App Purchases**: Google Play Billing

### Development Tools

- **Linting**: ESLint with Expo configuration
- **Build System**: Expo Application Services (EAS)
- **Asset Management**: Expo Image, Expo Font
- **File System**: Expo File System, Expo Document Picker
- **Authorization**: expo-auth-session for Google OAuth

### Key Libraries

- **State Management**: React Context API
- **Form Handling**: Custom form components
- **File Operations**: Expo Sharing, Expo Document Picker
- **In-App Purchases**: react-native-iap (with dynamic imports for web compatibility)
- **Animations**: React Native Fast Confetti
- **Storage**: AsyncStorage for auth persistence
- **Gestures**: React Native Gesture Handler

## 📋 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run web            # Run in web browser

# Code Quality
npm run lint           # Run ESLint
npm run lint-secrets   # Scan staged changes for credentials

# Release
npm run bump-version         # patch: 2.0.4 → 2.0.5 (bug fixes)
npm run bump-version minor   # minor: 2.0.4 → 2.1.0 (new features)
npm run bump-version major   # major: 2.0.4 → 3.0.0 (breaking changes)

# Utilities
npm run reset-project  # Reset project to initial state
```

## 🎯 Key Features Deep Dive

### Exercise System

- **Multiple Question Types**: Support for various ESL exercise formats
- **Smart Scoring**: Automatic grading with detailed feedback
- **Progress Persistence**: Saves user progress across sessions
- **Retry Mechanism**: Allow users to retake exercises
- **Premium File Downloads**: Attach supplementary materials with paywall
- **Multi-Language Instructions**: Exercises available in 5 languages (EN, ES, FR, DE, IT)

### Level Test & Assessment

- **CEFR-Aligned**: Diagnostic test mapping to A1, A2, B1, B2 levels
- **16 Grammar Topics**: Comprehensive assessment covering pronouns, tenses, prepositions, and more
- **Immediate Feedback**: Real-time score-to-level mapping
- **Customizable Bands**: Admins can adjust level thresholds and descriptions
- **Progress Integration**: Level results tracked in user progress metrics

### Premium Features

- **File Paywall**: One-time €2.99 purchase to unlock all downloadable resources
- **Secure Billing**: Google Play Billing
- **Purchase Restoration**: Restore purchases on device reinstall
- **Admin Access**: Admins bypass paywall for free access

### Admin Capabilities

- **Content Management**: Full CRUD operations for exercises and categories with multi-language support
- **User Analytics**: Track user engagement, performance, and level test results
- **File Management**: Upload and organize downloadable resources
- **Level Test Configuration**: Customize CEFR bands and assessment sections
- **System Settings**: Configure app behavior, defaults, and user management
- **Data Export**: Export user data and analytics

### User Experience

- **Responsive Design**: Works seamlessly across different screen sizes
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized for smooth animations and fast loading
- **Consistent Theming**: Single light theme across Android and web (no theme switching)

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable the following services:
   - **Authentication** (Email/Password and Google Sign-In)
   - **Firestore Database**
   - **Firebase Storage**
3. Add your web app configuration to `config/firebase.ts`

### Google OAuth Setup

1. Create OAuth 2.0 Client IDs in Google Cloud Console
2. Configure Web Client ID for authentication (required)
3. Add an Android Client ID with the correct SHA-1 fingerprint (required for production)
4. Enable Google Sign-In in Firebase Authentication
5. Add Client IDs to `.env` file

See the `firebase-release-setup` skill for the full walkthrough.

### In-App Purchases Setup (Android)

1. Create a product in Google Play Console (`premium_file_access` at €2.99)
2. Configure license testing in Google Play Console (Setup → License testing) so test
   accounts get free test purchases
3. The app uses `react-native-iap` with dynamic imports for web compatibility — see
   `services/premiumService.ts` for the native-only import pattern

### Admin User Setup

1. Register a new user account
2. In Firebase Console, go to Firestore Database
3. Find your user document in the `users` collection
4. Set the `isAdmin` field to `true`

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the project
eas build:configure

# Build for production (Android App Bundle)
eas build -p android --profile production

# Submit to Google Play
eas submit -p android --profile internal    # internal testing track
eas submit -p android --profile production  # production track
```

`eas submit` uploads directly from EAS to Google Play using the service account key
referenced in `eas.json` — there is no need to download the AAB and upload it by hand.

See `EAS Cheatsheet.md` for the full release workflow, including when a change needs a new
build versus an OTA `eas update`.

### Environment Variables

Configuration is read from a local `.env` file, which is gitignored. Required keys:

- Firebase config: API key, auth domain, project ID, storage bucket, messaging sender ID, app ID
- Google OAuth Client IDs: Web (required), Android (required for production)

`.env` is never committed. For EAS builds, set the same values as EAS environment variables
or secrets.

## 🤝 Contributing

This is an educational project designed to demonstrate modern React Native development practices. Contributions are welcome!

### Development Guidelines

1. Follow TypeScript strict mode
2. Use consistent code formatting (ESLint)
3. Write descriptive commit messages
4. Test on Android and web
5. Ensure accessibility compliance
6. Do **not** add `@react-navigation` packages — Expo Router replaces them and they are
   incompatible with SDK 56+

### Reporting Issues

Please use the GitHub Issues tab to report bugs or request features. Include:

- Device/platform information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is for educational purposes. Feel free to use it as a learning resource or starting point for your own ESL applications.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- UI components from [React Native Paper](https://reactnativepaper.com)
- Icons from [Expo Symbols](https://docs.expo.dev/versions/latest/sdk/symbols/)
- Backend powered by [Firebase](https://firebase.google.com)

---

**Made with ❤️ for ESL learners and educators worldwide**
