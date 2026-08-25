import { GOOGLE_SIGN_IN_CANCELLED } from './googleSignIn.constants';

// Web counterpart of services/googleSignIn.ts. The native Nitro package is
// Android/iOS only and blows up the web bundle if imported, so web never loads
// it: AuthContext uses Firebase signInWithPopup instead of these helpers.

export { GOOGLE_SIGN_IN_CANCELLED };

export const configureGoogleSignIn = (_webClientId: string) => {
  // No native session to configure on web.
};

export const getGoogleIdToken = async (): Promise<string> => {
  throw new Error('Native Google Sign-In is not available on web.');
};

export const signOutGoogle = async () => {
  // No native session to clear on web.
};

export const describeGoogleSignInError = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : 'Failed to sign in with Google. Please try again.';
