import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');

    const docSnap = await getDoc(doc(db, 'appSettings', 'config'));
    if (docSnap.exists()) {
      console.log('✅ Firestore read test passed:', docSnap.data());
    } else {
      console.log('❌ Firestore read test failed: Document not found');
    }

    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    return false;
  }
};

export const logFirebaseConfig = () => {
  console.log('Firebase Configuration:');
  console.log(
    '- Project ID:',
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'
  );
  console.log(
    '- Auth Domain:',
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'
  );
  console.log(
    '- API Key:',
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'
  );
};
