import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCuPO7eHlPL30g6iuSPXPstbCAdoKj6Gjk',
  authDomain: 'esl-exercises.firebaseapp.com',
  projectId: 'esl-exercises',
  storageBucket: 'esl-exercises.firebasestorage.app',
  messagingSenderId: '950312531501',
  appId: '1:950312531501:web:20ee82c57dd26235012aa4',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
