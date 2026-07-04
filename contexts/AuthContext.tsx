import { auth, db } from '@/config/firebase';
import {
  deleteUserAccount,
  updateUserDisplayName,
  updateUserLanguagePreference,
} from '@/services/firebaseService';
import {
  checkPremiumAccess,
  endIAPConnection,
  initializeIAP,
} from '@/services/premiumService';
import { User as AppUser } from '@/types';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  hasPremiumAccess: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  updateDisplayName: (newDisplayName: string) => Promise<void>;
  updateLanguagePreference: (language: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const listenerSetupRef = useRef(false);

  const [_request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    responseType: 'id_token',
  });

  // Handle Google sign-in response
  useEffect(() => {
    if (response?.type === 'success') {
      console.log('📱 Google auth response:', response);

      const { id_token, idToken } = response.params;
      const tokenToUse = id_token || idToken;

      if (!tokenToUse) {
        console.error(
          '❌ No id_token found in response. Available params:',
          Object.keys(response.params),
        );
        return;
      }

      console.log('🔑 Using id_token to create credential');
      const credential = GoogleAuthProvider.credential(tokenToUse);

      signInWithCredential(auth, credential)
        .then(() => {
          console.log('✅ Google sign-in successful');
        })
        .catch((error) => {
          console.error('❌ Google sign-in error:', error);
        });
    } else if (response?.type === 'error') {
      console.error('❌ Google auth error:', response.error);
    }
  }, [response]);

  // Initialize IAP connection on mount
  useEffect(() => {
    initializeIAP();

    return () => {
      endIAPConnection();
    };
  }, []);

  // Sync premium status from appUser when it changes
  useEffect(() => {
    if (appUser) {
      setHasPremiumAccess(appUser.hasPremiumAccess || false);
    } else {
      setHasPremiumAccess(false);
    }
  }, [appUser]);

  useEffect(() => {
    if (listenerSetupRef.current) {
      console.log('⚠️ Auth listener already set up, skipping...');
      return;
    }

    listenerSetupRef.current = true;
    console.log('Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        '🔥 Auth state changed:',
        firebaseUser ? `User: ${firebaseUser.email}` : 'No user',
      );
      console.log('📦 Firebase user object:', firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null);
      setUser(firebaseUser);

      if (firebaseUser) {
        console.log('📄 Attempting to fetch/create user document for UID:', firebaseUser.uid);
        try {
          // Get user data from Firestore
          console.log('⏳ Fetching from Firestore...');
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('✅ Firestore fetch complete, exists:', userDoc.exists());
          if (userDoc.exists()) {
            console.log('✅ User document found in Firestore');
            setAppUser(userDoc.data() as AppUser);
          } else {
            console.log('📝 Creating new user document...');
            // Create new user document
            const newUser: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || undefined,
              isAdmin: false,
              createdAt: new Date(),
              progress: [],
            };

            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              console.log('✅ User document created successfully');
              setAppUser(newUser);
            } catch (firestoreError) {
              console.error('❌ Error creating user document:', firestoreError);
              // Still set the user data even if Firestore fails
              console.log('🔄 Using fallback user data');
              setAppUser(newUser);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          // Create a minimal user object if Firestore fails completely
          const fallbackUser: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            isAdmin: false,
            progress: [],
          };
          console.log('🔄 Using complete fallback user data');
          setAppUser(fallbackUser);
        }
      } else {
        console.log('🚪 User signed out');
        setAppUser(null);
        // Explicitly log that we're clearing the user
        console.log('🧹 Clearing user state...');
      }

      console.log('⚡ Setting loading to false');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Try to create user document in Firestore, but don't fail if it doesn't work
    const newUser: AppUser = {
      id: result.user.uid,
      email: result.user.email!,
      displayName,
      isAdmin: false,
      createdAt: new Date(),
      progress: [],
    };

    try {
      await setDoc(doc(db, 'users', result.user.uid), newUser);
    } catch (firestoreError) {
      console.error(
        'Error creating user document during signup:',
        firestoreError,
      );
      // Don't throw the error - the auth state change listener will handle creating the user document
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('❌ Error initiating Google sign-in:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🔓 Logout called, signing out...');
    try {
      await signOut(auth);
      console.log('✅ Sign out successful, waiting for auth state change...');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    // Ensuring the email link points to the correct domain avoids ambiguity
    const actionCodeSettings = {
      url: 'https://esl-exercises.firebaseapp.com',
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const updateUserPassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  };

  const updateDisplayName = async (newDisplayName: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Update in Firebase Auth
    await updateProfile(user, { displayName: newDisplayName });

    // Update in Firestore
    await updateUserDisplayName(user.uid, newDisplayName);

    // Refresh local user data
    await refreshUserData();
  };

  const updateLanguagePreference = async (language: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Update in Firestore
    await updateUserLanguagePreference(user.uid, language);

    // Refresh local user data
    await refreshUserData();
  };

  const deleteAccount = async (password: string) => {
    if (!user || !user.email) {
      throw new Error('No user logged in');
    }

    // Re-authenticate user before account deletion
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete all user data from Firestore
    await deleteUserAccount(user.uid);

    // Delete Firebase Auth account
    await deleteUser(user);
  };

  const refreshUserData = async () => {
    if (!user) {
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setAppUser(userDoc.data() as AppUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const refreshPremiumStatus = async () => {
    if (!user) return;

    try {
      const isPremium = await checkPremiumAccess(user.uid);
      setHasPremiumAccess(isPremium);
      await refreshUserData(); // Refresh full user data
    } catch (error) {
      console.error('Error refreshing premium status:', error);
    }
  };

  const value = {
    user,
    appUser,
    loading,
    hasPremiumAccess,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    sendPasswordReset,
    updateUserPassword,
    updateDisplayName,
    updateLanguagePreference,
    deleteAccount,
    refreshUserData,
    refreshPremiumStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
