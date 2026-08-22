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
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';

// Raised when the user backs out of the Google account sheet. Callers swallow it
// so that dismissing the picker is not reported as a failure.
export const GOOGLE_SIGN_IN_CANCELLED = 'google-sign-in/cancelled';

/**
 * Turns a Google sign-in failure into something worth showing the user.
 * DEVELOPER_ERROR is the one that matters most: it means the app's package name
 * and signing certificate do not match an Android OAuth client in the Google
 * project, which is a build/console misconfiguration rather than a user problem.
 */
export const describeGoogleSignInError = (error: unknown): string => {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is unavailable or out of date on this device.';
      case statusCodes.DEVELOPER_ERROR:
        return 'Google Sign-In is not configured correctly for this build. Please report this to support.';
      case statusCodes.IN_PROGRESS:
        return 'A sign-in attempt is already in progress.';
    }
  }

  return error instanceof Error && error.message
    ? error.message
    : 'Failed to sign in with Google. Please try again.';
};

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

  // Google Sign-In must be configured once before any other call. The Web client
  // ID is correct here on every platform — the Android client ID is never passed
  // to configure(); Google matches the app by package name + SHA-1 instead.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    GoogleOneTapSignIn.configure({
      webClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? 'autoDetect',
    });
  }, []);

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
      return;
    }

    listenerSetupRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        '🔥 Auth state changed:',
        firebaseUser ? `User: ${firebaseUser.email}` : 'No user',
      );
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setAppUser(userDoc.data() as AppUser);
          } else {
            // Create new user document
            const newUser: AppUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              isAdmin: false,
              createdAt: new Date(),
              progress: [],
              ...(firebaseUser.displayName && { displayName: firebaseUser.displayName }),
            };

            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setAppUser(newUser);
            } catch (firestoreError) {
              console.error('Error creating user document:', firestoreError);
              setAppUser(newUser);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          const fallbackUser: AppUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            isAdmin: false,
            progress: [],
            ...(firebaseUser.displayName && { displayName: firebaseUser.displayName }),
          };
          setAppUser(fallbackUser);
        }
      } else {
        setAppUser(null);
      }

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
      isAdmin: false,
      createdAt: new Date(),
      progress: [],
      ...(displayName && { displayName }),
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
    if (Platform.OS === 'web') {
      await signInWithPopup(auth, new GoogleAuthProvider());
      return;
    }

    await GoogleOneTapSignIn.checkPlayServices();

    // Try the low-friction path first, then fall back to the full account
    // picker when the device has no previously authorized account.
    let response = await GoogleOneTapSignIn.signIn();

    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }

    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (isCancelledResponse(response)) {
      throw new Error(GOOGLE_SIGN_IN_CANCELLED);
    }

    if (!isSuccessResponse(response)) {
      throw new Error('Google sign-in did not return an account.');
    }

    const { idToken } = response.data;

    if (!idToken) {
      throw new Error('Google sign-in returned no ID token.');
    }

    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  };

  const logout = async () => {
    // Clear the native Google session too, otherwise the next sign-in silently
    // reuses the previous account instead of offering the picker.
    if (Platform.OS !== 'web') {
      try {
        await GoogleOneTapSignIn.signOut();
      } catch (error) {
        console.warn('Could not clear Google session on logout:', error);
      }
    }

    await signOut(auth);
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
