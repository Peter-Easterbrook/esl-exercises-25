import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/themes';
import { useAppTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.petereasterbro1.eslexercises25';

interface MilestoneRatingModalProps {
  visible: boolean;
  onClose: () => void;
  onFeedbackSubmit: (message: string) => Promise<void>;
}

type ModalView = 'main' | 'feedback' | 'success';

export const MilestoneRatingModal: React.FC<MilestoneRatingModalProps> = ({
  visible,
  onClose,
  onFeedbackSubmit,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [view, setView] = useState<ModalView>('main');
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let isCancelled = false;

    Promise.resolve().then(() => {
      if (!isCancelled) {
        setView('main');
        setFeedbackText('');
        setSubmitting(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [visible]);

  const handleRate = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {
      Alert.alert(
        'Error',
        'Unable to open Play Store. Please try again later.',
      );
    });
    onClose();
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    try {
      await onFeedbackSubmit(feedbackText.trim());
      setView('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
      setSubmitting(false);
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
          {view !== 'success' && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol
                name="xmark"
                size={24}
                color={theme.icons.secondary}
              />
            </TouchableOpacity>
          )}

          {view === 'main' && (
            <>
              <View style={styles.header}>
                <IconSymbol
                  name="star.fill"
                  size={52}
                  color={theme.accent.mid}
                />
                <ThemedText type="title" style={styles.title}>
                  Enjoying the App?
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  You&apos;ve completed 5 exercises — great work! Help other learners
                  find the app by leaving a quick review.
                </ThemedText>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleRate}
                >
                  <IconSymbol name="star" size={18} color="#fff" />
                  <ThemedText style={styles.primaryButtonText}>
                    Rate on Play Store
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setView('feedback')}
                >
                  <ThemedText style={styles.secondaryButtonText}>
                    Send Feedback Instead
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onClose}
                >
                  <ThemedText style={styles.dismissButtonText}>
                    Not now
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {view === 'feedback' && (
            <>
              <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                  Send Feedback
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Let us know what you think or suggest an improvement.
                </ThemedText>
              </View>

              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text.primary,
                    borderColor: theme.borders.medium,
                    backgroundColor: theme.backgrounds.subtle,
                  },
                ]}
                placeholder="Your feedback..."
                placeholderTextColor={theme.text.secondary}
                multiline
                numberOfLines={5}
                value={feedbackText}
                onChangeText={setFeedbackText}
                maxLength={500}
                textAlignVertical="top"
              />

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !feedbackText.trim() && styles.disabledButton,
                  ]}
                  onPress={handleFeedbackSubmit}
                  disabled={submitting || !feedbackText.trim()}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.primaryButtonText}>
                      Submit
                    </ThemedText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setView('main')}
                >
                  <ThemedText style={styles.dismissButtonText}>
                    ← Back
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {view === 'success' && (
            <View style={styles.successContainer}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={60}
                color={theme.status.success}
              />
              <ThemedText type="title" style={styles.title}>
                Thank you!
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Your feedback has been sent.
              </ThemedText>
            </View>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      backgroundColor: theme.backgrounds.card,
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
      marginTop: 8,
    },
    title: {
      fontSize: 22,
      marginTop: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      textAlign: 'center',
      color: theme.text.secondary,
      marginTop: 8,
      lineHeight: 22,
    },
    footer: {
      gap: 10,
    },
    primaryButton: {
      backgroundColor: theme.accent.mid,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    disabledButton: {
      opacity: 0.4,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      borderWidth: 1.5,
      borderColor: theme.accent.mid,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.accent.mid,
      fontSize: 16,
      fontWeight: '500',
    },
    dismissButton: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    dismissButtonText: {
      color: theme.text.secondary,
      fontSize: 14,
    },
    textInput: {
      borderWidth: 1.5,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      minHeight: 120,
      marginBottom: 16,
    },
    successContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      gap: 12,
    },
  });
}
