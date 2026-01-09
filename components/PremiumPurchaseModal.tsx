import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEFAULT_PRICE,
  getProducts,
  purchasePremium,
  restorePurchases,
  setupPurchaseListeners,
  verifyAndSavePurchase,
} from '@/services/premiumService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [productPrice, setProductPrice] = useState<string>(DEFAULT_PRICE);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible && Platform.OS !== 'web') {
      loadProducts();

      // Setup purchase listeners
      let cleanup: (() => void) | undefined;

      const initListeners = async () => {
        cleanup = await setupPurchaseListeners(
          // On purchase update
          async (purchase: any) => {
            const hasValidPurchase = purchase.purchaseToken || purchase.transactionId;

            if (hasValidPurchase && user) {
              try {
                await verifyAndSavePurchase(user.uid, purchase);
                await refreshPremiumStatus();

                Alert.alert(
                  'Success!',
                  'You now have premium access to all downloadable files!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onPurchaseSuccess();
                        onClose();
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error('Error processing purchase:', error);
                Alert.alert('Error', 'Failed to verify purchase. Please contact support.');
              } finally {
                setPurchasing(false);
              }
            }
          },
          // On purchase error
          (error: any) => {
            // ErrorCode.UserCancelled = 'user-cancelled'
            if (error.code !== 'user-cancelled') {
              console.error('Purchase error:', error);
              Alert.alert('Purchase Error', error.message);
            }
            setPurchasing(false);
          }
        );
      };

      initListeners();

      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [visible, user, refreshPremiumStatus, onPurchaseSuccess, onClose]);

  const loadProducts = async () => {
    try {
      const products = await getProducts();
      if (products && products.length > 0) {
        setProductPrice((products[0] as any).displayPrice || DEFAULT_PRICE);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to make a purchase');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Premium purchases are only available on mobile devices. Please use the Android or iOS app to purchase.'
      );
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

    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Purchase restoration is only available on mobile devices.'
      );
      return;
    }

    setLoading(true);

    try {
      const restored = await restorePurchases(user.uid);

      if (restored) {
        await refreshPremiumStatus();
        Alert.alert('Success', 'Your purchase has been restored!', [
          {
            text: 'OK',
            onPress: () => {
              onPurchaseSuccess();
              onClose();
            },
          },
        ]);
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
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <IconSymbol name='xmark' size={24} color='#666' />
          </TouchableOpacity>

          <View style={styles.header}>
            <IconSymbol name='lock.shield' size={60} color='#6996b3' />
            <ThemedText type='title' style={styles.title}>
              Premium File Access
            </ThemedText>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.description}>
              Unlock all downloadable exercise files permanently for just{' '}
              {productPrice}
            </ThemedText>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={24}
                  color={colors.success}
                />
                <ThemedText style={styles.featureText}>
                  Access to all PDF and DOC files
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={24}
                  color={colors.success}
                />
                <ThemedText style={styles.featureText}>
                  One-time payment, lifetime access
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={24}
                  color={colors.success}
                />
                <ThemedText style={styles.featureText}>
                  Download files from all categories
                </ThemedText>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={24}
                  color={colors.success}
                />
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
                <ActivityIndicator color='#fff' />
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
                <ActivityIndicator color='#6996b3' />
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
