import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
// On web, Firebase automatically uses localStorage when persistence option is omitted
// On React Native, use AsyncStorage for persistence
export const auth =
  Platform.OS === 'web'
    ? initializeAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// Web: IndexedDB-backed persistent cache (survives page refreshes)
// Native: in-session memory cache (reduces re-fetches within a session)
export const db =
  Platform.OS === 'web'
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager(),
        }),
      })
    : initializeFirestore(app, {
        localCache: memoryLocalCache(),
      });

export const storage = getStorage(app);
