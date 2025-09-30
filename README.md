# ESL Exercises 25 �

An interactive English as a Second Language (ESL) learning app built with Expo and React Native.

## Features

- 📝 **Multiple Exercise Types**: Multiple choice, fill-in-the-blanks, true/false, matching, and essay questions
- 📚 **Categorized Learning**: Exercises organized by grammar topics, vocabulary, reading comprehension, and more
- 👥 **User Authentication**: Secure Firebase authentication system
- 📊 **Progress Tracking**: Track your learning progress across different categories
- 🔧 **Admin Panel**: Admin users can create, manage, and organize exercises
- 🎯 **Difficulty Levels**: Beginner, intermediate, and advanced exercises
- 📱 **Cross-Platform**: Works on iOS, Android, and web

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project setup

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Peter-Easterbrook/esl-exercises-25.git
   cd esl-exercises-25
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure Firebase

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Update `config/firebase.ts` with your Firebase configuration

4. Start the development server
   ```bash
   npx expo start
   ```

## Project Structure

```
app/
├── (tabs)/          # Main tab navigation screens
├── admin/           # Admin panel screens
├── auth/            # Authentication screens
└── exercise/        # Exercise detail screens

components/          # Reusable UI components
contexts/           # React contexts (Auth, etc.)
services/           # Firebase and other services
types/              # TypeScript type definitions
```

## Contributing

This is an educational project. Feel free to submit issues and enhancement requests!

## Technology Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Backend**: Firebase (Auth + Firestore)
- **UI**: React Native with custom components

## License

This project is for educational purposes.
