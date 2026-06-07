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
- 📥 **Downloadable Resources**: Access PDFs and DOCs with premium file unlocking (€1.99 one-time purchase)
- 🌍 **Multi-Language Support**: Exercise instructions in English, Spanish, French, and German
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
- 📱 **Cross-Platform**: Native iOS, Android, and web support
- 🎨 **Modern UI**: Custom themed components with consistent design system
- 💳 **In-App Purchases**: Secure Google Play Billing and App Store integration for premium features
- ♿ **Accessibility**: Proper accessibility labels and navigation
- 🔄 **Real-time Sync**: Live data synchronization across devices

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
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
   - Enable **Authentication** (Email/Password provider)
   - Enable **Firestore Database**
   - Enable **Firebase Storage**
   - Download your Firebase configuration
   - Update `config/firebase.ts` with your Firebase configuration

4. **Set up Firestore Security Rules**

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Verify admin status
       function isAdmin() {
         return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
       }

       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // User progress is private to the user
       match /userProgress/{document=**} {
         allow read, write: if request.auth != null &&
           get(/databases/$(database)/documents/userProgress/$(document)).data.userId == request.auth.uid;
       }

       // Categories and exercises readable by all, writable by admins
       match /categories/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && isAdmin();
       }

       match /exercises/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && isAdmin();
       }

       // Downloadable files readable by all, writable by admins
       match /downloadableFiles/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && isAdmin();
       }

       // App settings readable by all, writable by admins
       match /appSettings/{document=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && isAdmin();
       }
     }
   }
   ```

5. **Initialize default data (optional)**
   - Run the app and sign up as an admin user
   - The app will automatically create sample categories and exercises

6. **Start the development server**
   ```bash
   npx expo start
   ```

### 📱 Running on Devices

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app
- **Web Browser**: Press `w` in the terminal

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

- **Framework**: Expo SDK 55 with Expo Router
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
- **In-App Purchases**: Google Play Billing, App Store IAP

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
npm run ios           # Run on iOS device/simulator
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint

# Utilities
npm run reset-project # Reset project to initial state
```

## 🎯 Key Features Deep Dive

### Exercise System

- **Multiple Question Types**: Support for various ESL exercise formats
- **Smart Scoring**: Automatic grading with detailed feedback
- **Progress Persistence**: Saves user progress across sessions
- **Retry Mechanism**: Allow users to retake exercises
- **Premium File Downloads**: Attach supplementary materials with paywall
- **Multi-Language Instructions**: Exercises available in 4 languages (EN, ES, FR, DE)

### Level Test & Assessment

- **CEFR-Aligned**: Diagnostic test mapping to A1, A2, B1, B2 levels
- **16 Grammar Topics**: Comprehensive assessment covering pronouns, tenses, prepositions, and more
- **Immediate Feedback**: Real-time score-to-level mapping
- **Customizable Bands**: Admins can adjust level thresholds and descriptions
- **Progress Integration**: Level results tracked in user progress metrics

### Premium Features

- **File Paywall**: One-time €3.99 purchase to unlock all downloadable resources
- **Secure Billing**: Google Play Billing and App Store integration
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
- **Cross-Platform**: Single light theme across iOS, Android, and web

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
2. Configure Web Client ID for authentication
3. Add platform-specific Client IDs for Android (with SHA-1) and iOS
4. Enable Google Sign-In in Firebase Authentication
5. Add Client IDs to `.env` file

### In-App Purchases Setup (Mobile)

1. Create a product in Google Play Console (`premium_file_access` at €1.99)
2. Configure license testing in Google Play Console
3. Create an In-App Purchase product in App Store Connect (iOS)
4. The app uses `react-native-iap` with dynamic imports for web compatibility

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

# Build for production
eas build --platform all
```

### Environment Variables

Create an `app.config.js` file for environment-specific configuration:

```javascript
export default {
  expo: {
    // ... your expo config
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      // ... other environment variables
    },
  },
};
```

## 🤝 Contributing

This is an educational project designed to demonstrate modern React Native development practices. Contributions are welcome!

### Development Guidelines

1. Follow TypeScript strict mode
2. Use consistent code formatting (ESLint)
3. Write descriptive commit messages
4. Test on both iOS and Android
5. Ensure accessibility compliance

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
