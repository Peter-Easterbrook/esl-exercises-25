import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';
import { Platform } from 'react-native';
import { GOOGLE_SIGN_IN_CANCELLED } from './googleSignIn.constants';

// react-native-nitro-google-signin builds its Nitro hybrid object at module
// scope, so importing it anywhere reachable from web/static rendering throws
// "__fbBatchedBridgeConfig is not set". Everything that touches the package
// lives behind this native-only module; googleSignIn.web.ts is the web stub.

export { GOOGLE_SIGN_IN_CANCELLED };

export const configureGoogleSignIn = (webClientId: string) => {
  GoogleOneTapSignIn.configure({ webClientId });
};

/**
 * Runs the native sign-in cascade and returns the Google ID token.
 * Throws GOOGLE_SIGN_IN_CANCELLED if the user dismisses the sheet.
 */
export const getGoogleIdToken = async (): Promise<string> => {
  // No-op on iOS: Play Services are an Android concept and the native module
  // resolves immediately there.
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

  return idToken;
};

export const signOutGoogle = async () => {
  await GoogleOneTapSignIn.signOut();
};

/**
 * Turns a Google sign-in failure into something worth showing the user.
 * DEVELOPER_ERROR is the one that matters most on Android: it means the app's
 * package name and signing certificate do not match an Android OAuth client in
 * the Google project, which is a build/console misconfiguration rather than a
 * user problem. iOS has no equivalent code — a missing iOS client ID surfaces
 * as IN_PROGRESS with a "not configured" message, which is handled below so it
 * does not masquerade as a concurrent sign-in attempt.
 */
export const describeGoogleSignInError = (error: unknown): string => {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'Google Play Services is unavailable or out of date on this device.';
      case statusCodes.DEVELOPER_ERROR:
        return 'Google Sign-In is not configured correctly for this build. Please report this to support.';
      case statusCodes.IN_PROGRESS:
        // iOS reuses this code for "configure() was never completed", which
        // means GoogleService-Info.plist is missing or has no CLIENT_ID.
        if (Platform.OS === 'ios' && /not configured/i.test(error.message)) {
          return 'Google Sign-In is not configured correctly for this build. Please report this to support.';
        }
        return 'A sign-in attempt is already in progress.';
    }
  }

  return error instanceof Error && error.message
    ? error.message
    : 'Failed to sign in with Google. Please try again.';
};
