import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { google } from 'googleapis';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

const ANDROID_PACKAGE_NAME = 'com.petereasterbro1.eslexercises25';
const PREMIUM_PRODUCT_ID = 'premium_file_access';

/** How long a download link stays valid. Long enough to finish a download on a
 *  slow connection, short enough that a shared link is worthless. */
const SIGNED_URL_TTL_MS = 15 * 60 * 1000;

type PremiumPlatform = 'android' | 'ios';

/**
 * Grants premium on the user document. This is the ONLY place premium is
 * granted — the client can no longer write the field once the accompanying
 * rules change is deployed (see README).
 */
const grantPremium = async (
  uid: string,
  platform: PremiumPlatform,
  purchaseToken: string,
  orderId: string | null,
) => {
  const purchaseRef = db.collection('purchases').doc(purchaseToken);
  const userRef = db.collection('users').doc(uid);

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(purchaseRef);

    // One purchase token grants premium to exactly one account. Without this,
    // a single receipt could be replayed from any number of signed-in devices.
    if (existing.exists && existing.data()?.uid !== uid) {
      throw new HttpsError(
        'already-exists',
        'This purchase is already linked to a different account.',
      );
    }

    tx.set(purchaseRef, {
      uid,
      platform,
      productId: PREMIUM_PRODUCT_ID,
      orderId,
      verifiedAt: FieldValue.serverTimestamp(),
    });

    tx.set(
      userRef,
      {
        hasPremiumAccess: true,
        premiumPlatform: platform,
        premiumPurchaseToken: purchaseToken,
        premiumPurchaseOrderId: orderId,
        premiumPurchaseDate: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
};

/**
 * Validates a Google Play purchase against the Play Developer API and, if it
 * is genuine and paid for, grants premium and acknowledges the purchase.
 *
 * Acknowledging matters: Google auto-refunds any purchase left unacknowledged
 * for three days. The client used to do this; doing it here means it only ever
 * happens after the purchase has actually been verified.
 */
const verifyAndroidPurchase = async (uid: string, purchaseToken: string) => {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  const { data } = await androidpublisher.purchases.products.get({
    packageName: ANDROID_PACKAGE_NAME,
    productId: PREMIUM_PRODUCT_ID,
    token: purchaseToken,
  });

  // 0 = purchased, 1 = cancelled, 2 = pending
  if (data.purchaseState !== 0) {
    throw new HttpsError(
      'failed-precondition',
      'This purchase is not complete.',
    );
  }

  await grantPremium(uid, 'android', purchaseToken, data.orderId ?? null);

  if (data.acknowledgementState === 0) {
    await androidpublisher.purchases.products.acknowledge({
      packageName: ANDROID_PACKAGE_NAME,
      productId: PREMIUM_PRODUCT_ID,
      token: purchaseToken,
      requestBody: {},
    });
  }
};

/**
 * Verifies a purchase and grants premium access.
 *
 * Called both after a fresh purchase and on "Restore Purchase" — a restore is
 * just a token from getAvailablePurchases() being verified again, and the
 * transaction above makes re-verifying the same token idempotent.
 */
export const verifyPurchase = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Sign in before purchasing.');
  }

  const platform = request.data?.platform as PremiumPlatform | undefined;
  const purchaseToken = request.data?.purchaseToken as string | undefined;

  if (!purchaseToken || (platform !== 'android' && platform !== 'ios')) {
    throw new HttpsError(
      'invalid-argument',
      'platform and purchaseToken are required.',
    );
  }

  if (platform === 'ios') {
    // iOS 1.0 ships with the paywall hidden (utils/downloadsAvailability.ts),
    // so nothing calls this yet. Implementing it needs an App Store Connect
    // API key (.p8) to call the App Store Server API and verify the signed
    // JWS transaction — do that in the same change that flips the version gate.
    throw new HttpsError(
      'unimplemented',
      'iOS purchase verification is not enabled yet.',
    );
  }

  try {
    await verifyAndroidPurchase(uid, purchaseToken);
    return { hasPremiumAccess: true };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    logger.error('Play verification failed', { uid, error });
    throw new HttpsError('internal', 'Could not verify this purchase.');
  }
});

/**
 * Turns a legacy tokenized download URL into a storage object path.
 *
 * Existing downloadableFiles documents only carry fileUrl, so this avoids a
 * migration. New uploads should write a storagePath field, which is preferred
 * when present.
 */
const storagePathFromDownloadUrl = (fileUrl: string): string | null => {
  const match = fileUrl.match(/\/o\/([^?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Returns a short-lived signed URL for a downloadable file, but only to users
 * who have actually paid (or to admins).
 *
 * This is the half that Firestore rules cannot do. The tokenized URLs produced
 * by getDownloadURL() carry their own access token, bypass Storage rules, and
 * never expire — so anyone able to read the metadata document could fetch the
 * file regardless of premium status. The client should stop reading fileUrl
 * and call this instead.
 */
export const getFileDownloadUrl = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Sign in to download files.');
  }

  const fileId = request.data?.fileId as string | undefined;
  if (!fileId) {
    throw new HttpsError('invalid-argument', 'fileId is required.');
  }

  const userSnap = await db.collection('users').doc(uid).get();
  const user = userSnap.data();
  const entitled = user?.hasPremiumAccess === true || user?.isAdmin === true;

  if (!entitled) {
    throw new HttpsError(
      'permission-denied',
      'This file requires premium access.',
    );
  }

  const fileSnap = await db.collection('downloadableFiles').doc(fileId).get();
  if (!fileSnap.exists) {
    throw new HttpsError('not-found', 'That file no longer exists.');
  }

  const file = fileSnap.data() ?? {};
  const path: string | null =
    (file.storagePath as string | undefined) ??
    (typeof file.fileUrl === 'string'
      ? storagePathFromDownloadUrl(file.fileUrl)
      : null);

  if (!path) {
    logger.error('File document has no resolvable storage path', { fileId });
    throw new HttpsError('failed-precondition', 'That file is unavailable.');
  }

  const [url] = await getStorage()
    .bucket()
    .file(path)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });

  return { url, expiresInMs: SIGNED_URL_TTL_MS, name: file.name ?? null };
});
