# ESL Exercises 25 📚

A comprehensive English as a Second Language (ESL) learning platform built with Expo and React Native, featuring interactive exercises, progress tracking, and a complete admin management system.

## ✨ Features

### For Learners

- 📝 **Interactive Exercise Types**: Multiple choice, fill-in-the-blanks, true/false, matching, and essay questions
- 📚 **Categorized Learning**: Exercises organized by grammar, vocabulary, tenses, reading comprehension, and error detection
- � **Progress Tracking**: Detailed progress statistics with scores, streaks, and completion rates
- 🎯 **Difficulty Levels**: Beginner, intermediate, and advanced exercises
- 🎉 **Gamification**: Confetti celebrations for perfect scores and achievement tracking
- � **Downloadable Resources**: Access PDFs, DOCs, and supplementary materials
- 🔄 **Exercise Review**: Review answers with explanations and correct solutions

### For Administrators

- 🔧 **Complete Admin Panel**: Create, edit, and manage exercises and categories
- � **User Management**: View, search, and manage user accounts
- 📈 **Analytics Dashboard**: Comprehensive analytics with charts and user activity trends
- 📁 **File Management**: Upload and organize downloadable exercise materials
- ⚙️ **App Settings**: Configure exercise defaults, notifications, and user management settings
- 📊 **Real-time Statistics**: Monitor app usage, completion rates, and performance metrics

### Technical Features

- 🔐 **Secure Authentication**: Firebase Auth with account management and password updates
- ☁️ **Cloud Storage**: Firebase Firestore for data and Firebase Storage for files
- 📱 **Cross-Platform**: Native iOS, Android, and web support
- 🎨 **Modern UI**: React Native Paper components with custom theming
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
   // Example security rules for Firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // Categories and exercises are public for reading
       match /categories/{document=**} {
         allow read: if true;
         allow write: if request.auth != null && resource.data.isAdmin == true;
       }

       match /exercises/{document=**} {
         allow read: if true;
         allow write: if request.auth != null && resource.data.isAdmin == true;
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
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home screen with categories
│   │   ├── profile.tsx    # User profile and settings
│   │   └── progress.tsx   # Progress tracking dashboard
│   ├── admin/             # Admin panel screens
│   │   ├── index.tsx      # Admin dashboard
│   │   ├── analytics.tsx  # Analytics and statistics
│   │   ├── manage-exercises.tsx
│   │   ├── manage-users.tsx
│   │   └── app-settings.tsx
│   ├── auth/              # Authentication screens
│   │   └── index.tsx      # Login/signup
│   ├── exercise/          # Exercise screens
│   │   └── [id].tsx       # Dynamic exercise detail
│   └── _layout.tsx        # Root layout with auth provider
│
├── components/            # Reusable UI components
│   ├── ExerciseInterface.tsx  # Main exercise component
│   ├── CategoryCard.tsx       # Category display card
│   ├── UserAvatar.tsx         # User profile avatar
│   ├── themed-*.tsx           # Themed UI components
│   └── ui/                    # Base UI components
│
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
│
├── services/              # Business logic and API calls
│   ├── firebaseService.ts     # Firestore operations
│   ├── fileService.ts         # File upload/download
│   └── exportService.ts       # Data export utilities
│
├── types/                 # TypeScript type definitions
│   └── index.ts          # All app interfaces and types
│
├── config/               # Configuration files
│   └── firebase.ts       # Firebase initialization
│
├── constants/            # App constants
│   └── theme.ts          # Color and styling themes
│
└── utils/                # Utility functions
    ├── adminSetup.ts     # Admin user setup
    └── debugFirestore.ts # Development utilities
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Expo SDK 54 with Expo Router
- **Language**: TypeScript
- **UI Components**: React Native Paper, custom themed components
- **Navigation**: Expo Router (file-based routing)
- **Animations**: React Native Reanimated, React Native Skia
- **Charts**: React Native Chart Kit
- **Icons**: Expo Symbols, React Native Vector Icons

### Backend & Cloud Services

- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (NoSQL)
- **File Storage**: Firebase Storage
- **Real-time**: Firestore real-time listeners

### Development Tools

- **Linting**: ESLint with Expo configuration
- **Build System**: Expo Application Services (EAS)
- **Asset Management**: Expo Image, Expo Font
- **File System**: Expo File System, Expo Document Picker

### Key Libraries

- **State Management**: React Context API
- **Form Handling**: Custom form components
- **File Operations**: Expo Sharing, Expo Document Picker
- **Animations**: React Native Fast Confetti
- **Storage**: AsyncStorage for local data
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
- **File Downloads**: Attach supplementary materials to exercises

### Admin Capabilities

- **Content Management**: Full CRUD operations for exercises and categories
- **User Analytics**: Track user engagement and performance
- **File Management**: Upload and organize downloadable resources
- **System Settings**: Configure app behavior and notifications
- **Data Export**: Export user data and analytics

### User Experience

- **Responsive Design**: Works seamlessly across different screen sizes
- **Offline Capability**: Some features work without internet connection
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized for smooth animations and fast loading

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project
2. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Firebase Storage**
3. Add your web app configuration to `config/firebase.ts`

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
