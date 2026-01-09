import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

// Product IDs - must match Google Play Console configuration
const ANDROID_PRODUCT_ID = 'premium_file_access';
const IOS_PRODUCT_ID = 'premium_file_access'; // Same ID for consistency

// Default price to display before products load
export const DEFAULT_PRICE = '€1.99';

// Dynamically import react-native-iap only on native platforms
// Returns null if not available (web, Expo Go, or native module not linked)
const getRNIap = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const module = await import('react-native-iap');
    // Verify the module is actually available (not just imported)
    if (!module.initConnection || typeof module.initConnection !== 'function') {
      console.log('react-native-iap not available (likely running in Expo Go)');
      return null;
    }
    return module;
  } catch (error) {
    console.log('react-native-iap not available:', error);
    return null;
  }
};

// Initialize IAP connection
export const initializeIAP = async (): Promise<boolean> => {
  // Only initialize on native platforms
  if (Platform.OS === 'web') {
    console.log('IAP not available on web');
    return false;
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) {
      // Silent fail - IAP not available (Expo Go or native module not linked)
      return false;
    }

    const connection = await RNIap.initConnection();
    console.log('IAP connection initialized:', connection);
    return true;
  } catch (error) {
    // Only log as warning since this is expected in Expo Go
    console.warn('IAP initialization skipped (requires development build):', error);
    return false;
  }
};

// Get available products
export const getProducts = async () => {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) return [];

    const productIds = Platform.select({
      android: [ANDROID_PRODUCT_ID],
      ios: [IOS_PRODUCT_ID],
      default: [],
    });

    if (!productIds || productIds.length === 0) {
      return [];
    }

    const products = await RNIap.fetchProducts({ skus: productIds });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Purchase product
export const purchasePremium = async () => {
  if (Platform.OS === 'web') {
    throw new Error('Purchases not available on web');
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) throw new Error('IAP not available');

    const productId = Platform.select({
      android: ANDROID_PRODUCT_ID,
      ios: IOS_PRODUCT_ID,
    });

    if (!productId) {
      throw new Error('Platform not supported');
    }

    // Request purchase using the new API
    const purchase = await RNIap.requestPurchase({
      type: 'in-app',
      request: {
        google: { skus: [productId] },
        apple: { sku: productId },
      },
    });

    return purchase;
  } catch (error: any) {
    // Handle user cancellation gracefully
    // ErrorCode.UserCancelled = 'user-cancelled'
    if (error.code === 'user-cancelled') {
      console.log('User cancelled purchase');
      return null;
    }
    console.error('Error purchasing premium:', error);
    throw error;
  }
};

// Verify and save purchase to Firestore
export const verifyAndSavePurchase = async (
  userId: string,
  purchase: any // Using any to avoid importing types on web
) => {
  if (Platform.OS === 'web') {
    throw new Error('Purchase verification not available on web');
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) throw new Error('IAP not available');

    // Extract relevant purchase data
    const purchaseData = {
      hasPremiumAccess: true,
      premiumPurchaseDate: new Date(purchase.transactionDate || Date.now()),
      premiumPurchaseToken: purchase.purchaseToken || '',
      premiumPurchaseOrderId: purchase.transactionId || '',
      premiumPurchaseReceipt: JSON.stringify(purchase),
      premiumPlatform: Platform.OS as 'android' | 'ios',
    };

    // Save to Firestore
    await updateDoc(doc(db, 'users', userId), purchaseData);

    // Acknowledge/finish purchase with Google/Apple
    await RNIap.finishTransaction({
      purchase,
      isConsumable: false, // One-time purchase, not consumable
    });

    console.log('Purchase verified and saved');
    return true;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    throw error;
  }
};

// Restore purchases (for reinstalls or device changes)
export const restorePurchases = async (userId: string) => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) return false;

    const purchases = await RNIap.getAvailablePurchases();

    if (purchases.length === 0) {
      return false; // No purchases to restore
    }

    // Find premium access purchase
    const premiumPurchase = purchases.find(
      (p: any) => p.productId === ANDROID_PRODUCT_ID || p.productId === IOS_PRODUCT_ID
    );

    if (premiumPurchase) {
      // Save restored purchase to Firestore
      await verifyAndSavePurchase(userId, premiumPurchase);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

// Check if user has premium access (from Firestore)
export const checkPremiumAccess = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.hasPremiumAccess || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
};

// End IAP connection (cleanup)
export const endIAPConnection = async () => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) return;

    await RNIap.endConnection();
  } catch (error) {
    console.error('Error ending IAP connection:', error);
  }
};

// Setup purchase listeners (native only)
export const setupPurchaseListeners = async (
  onPurchaseUpdate: (purchase: any) => void,
  onPurchaseError: (error: any) => void
) => {
  if (Platform.OS === 'web') {
    return () => {}; // No-op cleanup for web
  }

  try {
    const RNIap = await getRNIap();
    if (!RNIap) return () => {};

    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(onPurchaseUpdate);
    const purchaseErrorSubscription = RNIap.purchaseErrorListener(onPurchaseError);

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  } catch (error) {
    console.error('Error setting up purchase listeners:', error);
    return () => {};
  }
};
