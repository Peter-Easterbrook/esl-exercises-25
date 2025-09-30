import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const makeUserAdmin = async (userEmail: string): Promise<boolean> => {
  try {
    // Note: In a real app, you'd want to do this server-side for security
    // This is just for development/testing purposes

    console.log(`Setting up admin access for: ${userEmail}`);

    // You'll need to replace this with the actual user ID
    // You can get this from Firebase Auth console or from the user object
    const userId = 'USER_ID_FROM_FIREBASE_AUTH'; // Replace with actual UID

    const userRef = doc(db, 'users', userId);

    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }

    // Update to admin
    await updateDoc(userRef, {
      isAdmin: true
    });

    console.log('✅ User is now an admin');
    return true;

  } catch (error) {
    console.error('❌ Error making user admin:', error);
    return false;
  }
};

// Helper function to get current user's UID for admin setup
export const logCurrentUserInfo = (user: any) => {
  if (user) {
    console.log('=== ADMIN SETUP INFO ===');
    console.log('User UID:', user.uid);
    console.log('Email:', user.email);
    console.log('Copy this UID to Firebase Console to make admin');
    console.log('========================');
  }
};

// Check if user document exists and what it contains
export const checkUserDocument = async (userId: string) => {
  try {
    const { db } = await import('@/config/firebase');
    const { doc, getDoc } = await import('firebase/firestore');

    console.log('🔍 Checking user document for UID:', userId);

    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('📄 User document found:', data);
      console.log('🔑 isAdmin value:', data.isAdmin, '(type:', typeof data.isAdmin, ')');
      return data;
    } else {
      console.log('❌ User document does NOT exist in Firestore');
      console.log('💡 Make sure you created the document with the exact UID as the document ID');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking user document:', error);
    return null;
  }
};