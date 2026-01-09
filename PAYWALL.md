# Download Paywall Implementation Plan

## Overview

This document outlines the complete implementation plan for adding a paywall to downloadable files using Google Play Billing. The app will remain free on Google Play, but users must pay €1.99 (one-time purchase) to access all downloadable exercise files.

---

## System Design

### Payment Model
- **Type:** One-time purchase (not subscription)
- **Price:** €1.99
- **Unlocks:** ALL downloadable files permanently
- **Platform:** Google Play Billing (Android initially, iOS future)
- **UX:** Show download buttons to all users, prompt payment on tap

### Technology Stack
- **Library:** `react-native-iap` (NOT `expo-in-app-purchases`)
- **Rationale:**
  - Better maintained with 3.5k+ stars
  - Full Google Play Billing v5+ support
  - Better TypeScript support
  - Comprehensive documentation
  - Works with Expo via dev client

---

## Implementation Steps

### Phase 1: Dependencies & Configuration

#### Step 1.1: Install Dependencies

```bash
npx expo install expo-dev-client
npx expo install react-native-iap
npx expo prebuild --clean
```

**Note:** `react-native-iap` requires native modules, so Expo dev client is required.

#### Step 1.2: Configure app.json

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21,
            "compileSdkVersion": 34,
            "targetSdkVersion": 34
          }
        }
      ]
    ],
    "android": {
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

#### Step 1.3: Prebuild for Native Modules

```bash
npx expo prebuild --clean
npx expo run:android --variant debug
```

---

### Phase 2: Google Play Console Setup

#### Product Configuration

1. **Navigate to Google Play Console**
   - Go to "Monetize" → "Products" → "In-app products"

2. **Create In-App Product**
   - **Product ID:** `premium_file_access`
   - **Type:** One-time purchase (NOT subscription)
   - **Name:** "Premium File Access"
   - **Description:** "Unlock all downloadable exercise files permanently"
   - **Price:** €1.99 (set for all countries)
   - **Status:** Active

3. **Testing Setup**
   - Add test accounts in "License Testing" section
   - Use test Gmail accounts (not production accounts)
   - Test purchases won't be charged

#### Important Notes
- Product visible only after first APK/AAB upload
- Test purchases require Internal Testing track minimum
- Keep product ID consistent (no dev/prod split)

---

### Phase 3: Data Model Changes

#### Update User Interface

**File:** `types/index.ts` (line ~58)

```typescript
export interface User {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  progress: UserProgress[];
  preferredLanguage?: string;

  // Premium access fields
  hasPremiumAccess?: boolean;
  premiumPurchaseDate?: Date;
  premiumPurchaseToken?: string;
  premiumPurchaseOrderId?: string;
  premiumPurchaseReceipt?: string;
  premiumPlatform?: 'android' | 'ios' | 'web';
}
```

#### Firestore Document Structure

```
users/{userId}
  - hasPremiumAccess: boolean
  - premiumPurchaseDate: timestamp
  - premiumPurchaseToken: string
  - premiumPurchaseOrderId: string
  - premiumPurchaseReceipt: string (JSON)
  - premiumPlatform: string
```

---

### Phase 4: Premium Service Layer

#### Create Premium Service

**New file:** `services/premiumService.ts`

```typescript
import * as RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Product IDs
const ANDROID_PRODUCT_ID = 'premium_file_access';
const IOS_PRODUCT_ID = 'premium_file_access'; // Same ID for consistency

// Initialize IAP connection
export const initializeIAP = async (): Promise<boolean> => {
  try {
    const connection = await RNIap.initConnection();
    console.log('IAP connection initialized:', connection);
    return true;
  } catch (error) {
    console.error('Error initializing IAP:', error);
    return false;
  }
};

// Get available products
export const getProducts = async () => {
  try {
    const productIds = Platform.select({
      android: [ANDROID_PRODUCT_ID],
      ios: [IOS_PRODUCT_ID],
      default: [],
    });

    const products = await RNIap.getProducts({ skus: productIds });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Purchase product
export const purchasePremium = async () => {
  try {
    const productId = Platform.select({
      android: ANDROID_PRODUCT_ID,
      ios: IOS_PRODUCT_ID,
    });

    if (!productId) {
      throw new Error('Platform not supported');
    }

    const purchase = await RNIap.requestPurchase({
      sku: productId,
      andDangerouslyFinishTransactionAutomatically: false // Manual acknowledgment
    });

    return purchase;
  } catch (error) {
    // Handle user cancellation gracefully
    if (error.code === 'E_USER_CANCELLED') {
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
  purchase: RNIap.Purchase
) => {
  try {
    // Extract relevant purchase data
    const purchaseData = {
      hasPremiumAccess: true,
      premiumPurchaseDate: new Date(purchase.transactionDate),
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
      isConsumable: false // One-time purchase, not consumable
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
  try {
    const purchases = await RNIap.getAvailablePurchases();

    if (purchases.length === 0) {
      return false; // No purchases to restore
    }

    // Find premium access purchase
    const premiumPurchase = purchases.find(p =>
      p.productId === ANDROID_PRODUCT_ID || p.productId === IOS_PRODUCT_ID
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
  try {
    await RNIap.endConnection();
  } catch (error) {
    console.error('Error ending IAP connection:', error);
  }
};
```

#### Update Firebase Service

**File:** `services/firebaseService.ts` (add after line 630)

```typescript
// Update user premium status
export const updateUserPremiumStatus = async (
  userId: string,
  premiumData: {
    hasPremiumAccess: boolean;
    premiumPurchaseDate: Date;
    premiumPurchaseToken: string;
    premiumPurchaseOrderId: string;
    premiumPurchaseReceipt: string;
    premiumPlatform: 'android' | 'ios' | 'web';
  }
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), premiumData);
  } catch (error) {
    console.error('Error updating user premium status:', error);
    throw error;
  }
};
```

---

### Phase 5: Update AuthContext

**File:** `contexts/AuthContext.tsx`

#### Add to AuthContextType Interface (line ~25)

```typescript
interface AuthContextType {
  // ... existing fields
  hasPremiumAccess: boolean;
  refreshPremiumStatus: () => Promise<void>;
}
```

#### Add State (line ~49)

```typescript
const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
```

#### Initialize IAP on Mount

```typescript
useEffect(() => {
  initializeIAP();

  return () => {
    endIAPConnection();
  };
}, []);
```

#### Load Premium Status When User Data Loads

```typescript
useEffect(() => {
  if (appUser) {
    setHasPremiumAccess(appUser.hasPremiumAccess || false);
  } else {
    setHasPremiumAccess(false);
  }
}, [appUser]);
```

#### Implement refreshPremiumStatus Function

```typescript
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
```

#### Add to Context Value (line ~271)

```typescript
const value = {
  // ... existing values
  hasPremiumAccess,
  refreshPremiumStatus,
};
```

---

### Phase 6: Premium Purchase Modal Component

**New file:** `components/PremiumPurchaseModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProducts,
  purchasePremium,
  verifyAndSavePurchase,
  restorePurchases,
} from '@/services/premiumService';
import * as RNIap from 'react-native-iap';

interface PremiumPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export const PremiumPurchaseModal: React.FC<PremiumPurchaseModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
}) => {
  const { user, refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [productPrice, setProductPrice] = useState<string>('€1.00');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadProducts();
      setupPurchaseListener();
    }
  }, [visible]);

  const loadProducts = async () => {
    try {
      const products = await getProducts();
      if (products.length > 0) {
        setProductPrice(products[0].localizedPrice);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Purchase update listener
  const setupPurchaseListener = () => {
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase: RNIap.Purchase) => {
        const receipt = purchase.transactionReceipt || purchase.purchaseToken;

        if (receipt && user) {
          try {
            // Verify and save purchase
            await verifyAndSavePurchase(user.uid, purchase);
            await refreshPremiumStatus();

            Alert.alert(
              'Success!',
              'You now have premium access to all downloadable files!',
              [{ text: 'OK', onPress: () => {
                onPurchaseSuccess();
                onClose();
              }}]
            );
          } catch (error) {
            console.error('Error processing purchase:', error);
            Alert.alert('Error', 'Failed to verify purchase. Please contact support.');
          } finally {
            setPurchasing(false);
          }
        }
      }
    );

    const purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: RNIap.PurchaseError) => {
        if (error.code !== 'E_USER_CANCELLED') {
          console.error('Purchase error:', error);
          Alert.alert('Purchase Error', error.message);
        }
        setPurchasing(false);
      }
    );

    return () => {
      purchaseUpdateSubscription.remove();
      purchaseErrorSubscription.remove();
    };
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to make a purchase');
      return;
    }

    setPurchasing(true);

    try {
      const purchase = await purchasePremium();

      if (!purchase) {
        // User cancelled
        setPurchasing(false);
      }
      // Purchase listener will handle success
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to initiate purchase. Please try again.');
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to restore purchases');
      return;
    }

    setLoading(true);

    try {
      const restored = await restorePurchases(user.uid);

      if (restored) {
        await refreshPremiumStatus();
        Alert.alert(
          'Success',
          'Your purchase has been restored!',
          [{ text: 'OK', onPress: () => {
            onPurchaseSuccess();
            onClose();
          }}]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.'
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name="xmark" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.header}>
            <IconSymbol name="lock.shield" size={60} color="#6996b3" />
            <ThemedText type="title" style={styles.title}>
              Premium File Access
            </ThemedText>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.description}>
              Unlock all downloadable exercise files permanently for just {productPrice}
            </ThemedText>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#07b524" />
                <ThemedText style={styles.featureText}>
                  Access to all PDF and DOC files
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#07b524" />
                <ThemedText style={styles.featureText}>
                  One-time payment, lifetime access
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#07b524" />
                <ThemedText style={styles.featureText}>
                  Download files from all categories
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={24} color="#07b524" />
                <ThemedText style={styles.featureText}>
                  Works across all your devices
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.purchaseButton, purchasing && styles.disabledButton]}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.purchaseButtonText}>
                  Purchase for {productPrice}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#6996b3" />
              ) : (
                <ThemedText style={styles.restoreButtonText}>
                  Restore Purchase
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  footer: {
    gap: 12,
  },
  purchaseButton: {
    backgroundColor: '#6996b3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#6996b3',
    fontSize: 16,
  },
});
```

---

### Phase 7: Add Paywall to Download Locations

#### Update CategoryCard Component

**File:** `components/CategoryCard.tsx` (modify handleDownloadFile, line ~98-104)

**Add imports:**
```typescript
import { PremiumPurchaseModal } from '@/components/PremiumPurchaseModal';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
```

**Add state:**
```typescript
const [showPremiumModal, setShowPremiumModal] = useState(false);
```

**Update handleDownloadFile:**
```typescript
const handleDownloadFile = async (file: DownloadableFile) => {
  const { hasPremiumAccess } = useAuth();

  // Check platform
  if (Platform.OS === 'web') {
    Alert.alert('Not Available', 'Downloads only available on mobile');
    return;
  }

  // Check premium access
  if (!hasPremiumAccess) {
    setShowPremiumModal(true);
    return;
  }

  // Proceed with download
  try {
    await downloadFile(file);
  } catch (error) {
    Alert.alert('Error', 'Failed to download file');
  }
};
```

**Add modal JSX before closing component:**
```typescript
<PremiumPurchaseModal
  visible={showPremiumModal}
  onClose={() => setShowPremiumModal(false)}
  onPurchaseSuccess={() => {
    Alert.alert('Success', 'You can now download files!');
  }}
/>
```

#### Update ExerciseInterface Component

**File:** `components/ExerciseInterface.tsx` (modify handleDownloadFile, line ~162-209)

Apply same changes as CategoryCard.tsx:
- Import modal and auth
- Add showPremiumModal state
- Update handleDownloadFile with paywall check
- Add modal JSX

#### Optional: Add Lock Icon for Non-Premium Users

**In CategoryCard.tsx file item rendering:**
```typescript
<TouchableOpacity
  key={file.id}
  style={styles.fileItem}
  onPress={() => handleDownloadFile(file)}
>
  <IconSymbol name='doc.text' size={16} color='#6996b3' />
  <ThemedText style={styles.fileItemText}>
    {file.name}
  </ThemedText>
  {!hasPremiumAccess && (
    <IconSymbol name='lock.fill' size={14} color='#FF9800' />
  )}
  <IconSymbol
    name='arrow.down.circle'
    size={16}
    color='#464655'
  />
</TouchableOpacity>
```

---

### Phase 8: Update Firestore Security Rules

Add to users collection rule:

```javascript
match /users/{userId} {
  allow read: if request.auth != null &&
                 (request.auth.uid == userId || isAdmin());
  allow write: if request.auth != null && request.auth.uid == userId;

  // Allow premium status updates from IAP
  allow update: if request.auth != null &&
                   request.auth.uid == userId &&
                   request.resource.data.diff(resource.data).affectedKeys()
                     .hasOnly(['hasPremiumAccess', 'premiumPurchaseDate',
                              'premiumPurchaseToken', 'premiumPurchaseOrderId',
                              'premiumPurchaseReceipt', 'premiumPlatform']);
}
```

---

## Testing Strategy

### Phase 1: Development Testing

```bash
npx expo run:android --variant debug
```

- Test UI/UX flows with mock data
- IAP won't work until uploaded to Google Play

### Phase 2: Internal Testing Track

1. **Build:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Upload to Google Play Internal Testing**

3. **Install from Internal Testing**

4. **Test with Test Accounts:**
   - Purchase flow end-to-end
   - "Already Owned" error handling
   - Purchase restoration
   - Cancellation
   - Multiple devices with same account

### Testing Checklist

- [ ] Non-premium user sees download button (not hidden)
- [ ] Tapping download shows paywall modal
- [ ] Modal displays correct price from Google Play
- [ ] Purchase flow completes successfully
- [ ] Premium status updates in Firestore immediately
- [ ] Files download after purchase without re-prompting
- [ ] "Restore Purchase" works on same device
- [ ] Restoration works on different device with same Google account
- [ ] User cancellation closes modal without error
- [ ] Network errors show appropriate message
- [ ] "Already purchased" error handled gracefully
- [ ] Web platform shows appropriate message
- [ ] App handles IAP errors without crashing

---

## Error Handling

### Common Scenarios

1. **User Cancels:** Error code `E_USER_CANCELLED` - close modal silently
2. **Already Owned:** Show "Restore Purchase" option
3. **Network Lost:** IAP library auto-retries when connection restored
4. **Verification Fails:** Log error, can retry on next app launch
5. **Web Platform:** Show message directing to mobile apps

---

## Security Considerations

### Client-Side Verification (Recommended for €1.99 Product)

**Current Approach:**
- Purchase verification in app via react-native-iap
- Purchase token stored in Firestore for audit trail
- Firestore rules limit who can update premium status
- Low risk for €1.99 product

### Optional: Server-Side Verification

For higher security, implement Firebase Cloud Functions to verify purchases with Google Play Developer API. However, for a €1.99 product, client-side verification is acceptable.

---

## Platform Support

### Current Implementation: Android Only

- Google Play Billing for Android devices
- Web: Show message "Downloads only available on mobile apps"
- iOS: Future phase (requires App Store Connect setup)

**Platform Check:**
```typescript
if (Platform.OS !== 'android') {
  Alert.alert('Not Available', 'Premium downloads currently Android-only');
  return;
}
```

### Future: iOS Support

Same code works for iOS with minimal changes:
- Create product in App Store Connect
- Add iOS product ID
- Update Platform.select() to include 'ios'

---

## Revenue Considerations

### Google Play Fees

- **Service Fee:** 15% for first $1M revenue/year, 30% after
- **For €1.99 purchase:**
  - User pays: €1.99
  - Google takes: ~€0.30 (15%)
  - You receive: ~€1.69

### Tax

- Google handles VAT collection for EU
- Price shown includes VAT
- Net revenue calculated after VAT and fees

---

## Production Deployment Checklist

### Pre-Launch

- [ ] Install react-native-iap and configure
- [ ] Create product in Google Play Console (Active)
- [ ] Implement premiumService.ts
- [ ] Update User data model in types
- [ ] Create PremiumPurchaseModal component
- [ ] Update download locations with paywall checks
- [ ] Update Firestore security rules
- [ ] Test on Internal Testing track
- [ ] Verify end-to-end purchase flow
- [ ] Test restoration across devices

### Launch

- [ ] Upload to Production track
- [ ] Verify product status is Active
- [ ] Monitor initial purchases in Order Management
- [ ] Watch for crash reports related to IAP

### Post-Launch

- [ ] Monitor conversion rates (paywall shown vs purchases)
- [ ] Track revenue in Google Play Console
- [ ] Gather user feedback on pricing/UX
- [ ] Consider iOS implementation if successful

---

## Critical Files Summary

### New Files to Create
- `services/premiumService.ts` - Core IAP logic
- `components/PremiumPurchaseModal.tsx` - Payment UI

### Files to Modify
- `types/index.ts` (line ~58) - Add premium fields to User
- `contexts/AuthContext.tsx` (lines 25-37, add state ~49, add effects, add function, update value ~271)
- `services/firebaseService.ts` (add function after line 630)
- `components/CategoryCard.tsx` (modify handleDownloadFile ~line 98-104, add modal)
- `components/ExerciseInterface.tsx` (modify handleDownloadFile ~line 162-209, add modal)
- `app.json` or `app.config.js` - Add expo-build-properties plugin

---

## Success Metrics

**Target Metrics:**
- Purchase conversion rate > 5% (paywall shown → purchase)
- Purchase completion rate > 95% (purchase initiated → completed)
- Zero IAP-related crashes
- Positive user feedback on pricing/value

---

## Notes & Reminders

- Start with client-side verification, add server-side later if needed
- Test extensively on Internal Testing track before production
- Keep product ID consistent across environments
- Admins can bypass paywall (optional feature to add)
- Consider adding analytics to track conversion funnel

---

## Prerequisites: Add BILLING Permission (REQUIRED FIRST)

Before you can create in-app products in Google Play Console, you must add the BILLING permission and upload a new build.

### Step 1: Add BILLING Permission to app.json

The permission has already been added to `app.json`:

```json
"android": {
  "package": "com.petereasterbro1.eslexercises25",
  "permissions": [
    "com.android.vending.BILLING"
  ],
  ...
}
```

### Step 2: Build and Upload New Version

1. **Increment version** (already done: v1.1.0)

2. **Build production APK/AAB:**
   ```bash
   npx eas build --profile production --platform android
   ```

3. **Wait for build to complete:**
   - Check EAS dashboard or wait for email notification
   - Download the `.aab` (Android App Bundle) file

### Step 3: Upload to Play Console

1. Go to Play Console → Your app → **Production** (or **Closed testing**)
2. Click **"Create new release"**
3. Upload the new `.aab` file
4. Complete release notes
5. Save as draft or publish

**Alternative for faster testing:**
- Upload to **Closed testing** track instead of Production
- Faster processing and immediate testing capability
- BILLING permission will still be recognized

### Step 4: Wait for Processing

- Google Play processes the APK/AAB: **10-30 minutes**
- Once processed, the BILLING permission is detected
- You'll be able to create in-app products

### Step 5: Verify BILLING Permission

1. Go to **Monetize with Play** → **Products** → **One-time products**
2. If successful, you'll see **"Create one-time product"** button
3. If you still see "add BILLING permission" message, wait longer for processing

**Troubleshooting:**
- If button doesn't appear after 30 minutes, check APK was successfully uploaded
- Verify the BILLING permission is in the AndroidManifest.xml (auto-generated by Expo)
- Check "Release" section to ensure the build was rolled out

---

**Last Updated:** January 9, 2026
**Status:** Implemented - Ready for Google Play Console product setup and testing
