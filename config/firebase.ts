import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCuPO7eHlPL30g6iuSPXPstbCAdoKj6Gjk',
  authDomain: 'esl-exercises.firebaseapp.com',
  projectId: 'esl-exercises',
  storageBucket: 'esl-exercises.firebasestorage.app',
  messagingSenderId: '950312531501',
  appId: '1:950312531501:web:20ee82c57dd26235012aa4',
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web'
    ? browserLocalPersistence
    : getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);
