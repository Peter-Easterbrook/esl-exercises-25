import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/UserAvatar';
import { DEFAULT_LANGUAGE, LANGUAGE_ORDER, SUPPORTED_LANGUAGES, type LanguageCode } from '@/constants/languages';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { exportAllUserData } from '@/services/exportService';
import {
  deleteAllUserProgress,
  getUserProgress,
} from '@/services/firebaseService';
import {
  deleteProfilePhoto,
  loadProfilePhoto,
  pickPhoto,
  saveProfilePhoto,
  takePhoto,
} from '@/services/profilePhotoService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AccountSettingsScreen() {
  const {
    user,
    appUser,
    updateUserPassword,
    updateDisplayName,
    updateLanguagePreference,
    deleteAccount,
  } = useAuth();

  const [displayName, setDisplayName] = useState(appUser?.displayName || '');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (appUser?.preferredLanguage as LanguageCode) || DEFAULT_LANGUAGE
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    memberSince: '',
  });

  const loadUserPhoto = useCallback(async () => {
    if (!user) return;
    const photoUri = await loadProfilePhoto(user.uid);
    setProfilePhotoUri(photoUri);
  }, [user]);

  const loadUserStats = useCallback(async () => {
    if (!user) return;

    try {
      const progress = await getUserProgress(user.uid);
      const completedCount = progress.filter((p) => p.completed).length;
      const scores = progress
        .filter((p) => p.score !== undefined)
        .map((p) => p.score!);
      const avgScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((sum, score) => sum + score, 0) / scores.length
            )
          : 0;

      const memberSince = user.metadata.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : 'Unknown';

      setStats({
        totalExercises: progress.length,
        completedExercises: completedCount,
        averageScore: avgScore,
        memberSince,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, [user]);

  useEffect(() => {
    loadUserStats();
    loadUserPhoto();
  }, [loadUserStats, loadUserPhoto]);

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    if (displayName === appUser?.displayName) {
      Alert.alert('Info', 'Display name is the same as current name');
      return;
    }

    Alert.alert(
      'Update Display Name',
      `Change your display name to "${displayName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              await updateDisplayName(displayName);
              Alert.alert('Success', 'Display name updated successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to update display name'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    Alert.alert(
      'Update Password',
      'Are you sure you want to change your password?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              await updateUserPassword(currentPassword, newPassword);
              Alert.alert('Success', 'Password updated successfully');
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            } catch (error: any) {
              const errorMessage =
                error.code === 'auth/wrong-password'
                  ? 'Current password is incorrect'
                  : error.message || 'Failed to update password';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateLanguage = async () => {
    if (!selectedLanguage) {
      Alert.alert('Error', 'Please select a language');
      return;
    }

    if (selectedLanguage === appUser?.preferredLanguage) {
      Alert.alert('Info', 'This is already your preferred language');
      return;
    }

    Alert.alert(
      'Update Language Preference',
      `Change your preferred language to ${SUPPORTED_LANGUAGES[selectedLanguage].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              await updateLanguagePreference(selectedLanguage);
              Alert.alert('Success', 'Language preference updated successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to update language preference'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    if (!user || !appUser) return;

    Alert.alert(
      'Export My Data',
      'This will export all your personal data and progress in JSON format. You can use this to backup your data or transfer it to another platform.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setLoading(true);
            try {
              const progress = await getUserProgress(user.uid);
              await exportAllUserData(appUser, progress);
              Alert.alert(
                'Success',
                'Your data has been exported successfully'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to export data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteProgress = async () => {
    if (!user) return;

    Alert.alert(
      'Delete Progress Data',
      'This will permanently delete all your exercise progress and scores. Your account will remain active but all progress will be lost. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAllUserProgress(user.uid);
              Alert.alert('Success', 'All progress data has been deleted');
              await loadUserStats(); // Refresh stats
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete progress data'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      Alert.alert(
        'Error',
        'Please enter your password to confirm account deletion'
      );
      return;
    }

    Alert.alert(
      'Delete Account',
      'This will PERMANENTLY delete your account and ALL associated data. This action CANNOT be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(deleteConfirmPassword);
              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted'
              );
              router.replace('/auth');
            } catch (error: any) {
              const errorMessage =
                error.code === 'auth/wrong-password'
                  ? 'Password is incorrect'
                  : error.message || 'Failed to delete account';
              Alert.alert('Error', errorMessage);
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose how you want to update your profile photo',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handlePickPhoto,
        },
        ...(profilePhotoUri
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: handleRemovePhoto,
              },
            ]
          : []),
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    if (!user) return;

    const photoUri = await takePhoto();
    if (photoUri) {
      try {
        await saveProfilePhoto(user.uid, photoUri);
        setProfilePhotoUri(photoUri);
        Alert.alert('Success', 'Profile photo updated successfully');
      } catch (error) {
        console.error('Failed to save profile photo:', error);
        Alert.alert('Error', 'Failed to save profile photo');
      }
    }
  };

  const handlePickPhoto = async () => {
    if (!user) return;

    const photoUri = await pickPhoto();
    if (photoUri) {
      try {
        await saveProfilePhoto(user.uid, photoUri);
        setProfilePhotoUri(photoUri);
        Alert.alert('Success', 'Profile photo updated successfully');
      } catch (error) {
        console.error('Failed to save profile photo:', error);
        Alert.alert('Error', 'Failed to save profile photo');
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfilePhoto(user.uid);
              setProfilePhotoUri(null);
              Alert.alert('Success', 'Profile photo removed');
            } catch (error) {
              console.error('Failed to remove profile photo:', error);
              Alert.alert('Error', 'Failed to remove profile photo');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons
              name='arrow-back-circle-outline'
              size={24}
              color={colorScheme === 'dark' ? '#687076' : '#9BA1A6'}
            />
          </TouchableOpacity>
          <ThemedText type='title'>Account Settings</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Avatar & Info */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={handleChangePhoto}
              activeOpacity={0.7}
              style={styles.avatarTouchable}
            >
              <UserAvatar
                displayName={appUser?.displayName}
                email={user?.email || ''}
                size={80}
                photoUri={profilePhotoUri}
              />
              <View style={styles.cameraIconBadge}>
                <Ionicons name='camera' size={16} color='#fff' />
              </View>
            </TouchableOpacity>
            <ThemedText type='subtitle' style={styles.emailText}>
              {user?.email}
            </ThemedText>
            <ThemedText style={styles.tapToChangeText}>
              Tap to change photo
            </ThemedText>
          </View>

          {/* Account Statistics */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Account Statistics
            </ThemedText>
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <ThemedText type='defaultSemiBold' style={styles.statValue}>
                    {stats.totalExercises}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>
                    Total Exercises
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type='defaultSemiBold' style={styles.statValue}>
                    {stats.completedExercises}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Completed</ThemedText>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <ThemedText type='defaultSemiBold' style={styles.statValue}>
                    {stats.averageScore}%
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>
                    Average Score
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText type='defaultSemiBold' style={styles.statValue}>
                    {stats.memberSince}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Member Since</ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Update Display Name */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Display Name
            </ThemedText>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder='Enter display name'
                placeholderTextColor='#999'
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUpdateDisplayName}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <IconSymbol name='person.fill' size={18} color='#fff' />
                    <ThemedText style={styles.primaryButtonText}>
                      Update Name
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Language Preference */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Preferred Language
            </ThemedText>
            <View style={styles.card}>
              <ThemedText style={styles.helperText}>
                Choose your preferred language for exercise instructions
              </ThemedText>

              <View style={styles.languageSelectorContainer}>
                {LANGUAGE_ORDER.map((langCode) => {
                  const lang = SUPPORTED_LANGUAGES[langCode];
                  const isSelected = selectedLanguage === langCode;

                  return (
                    <TouchableOpacity
                      key={langCode}
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                      ]}
                      onPress={() => setSelectedLanguage(langCode)}
                    >
                      <Text style={styles.languageFlag}>{lang.flag}</Text>
                      <View style={styles.languageInfo}>
                        <ThemedText
                          style={[
                            styles.languageName,
                            isSelected && styles.languageNameSelected,
                          ]}
                        >
                          {lang.nativeLabel}
                        </ThemedText>
                        <ThemedText style={styles.languageCodeText}>
                          {langCode.toUpperCase()}
                        </ThemedText>
                      </View>
                      {isSelected && (
                        <IconSymbol
                          name='checkmark.circle.fill'
                          size={24}
                          color='#6996b3'
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUpdateLanguage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <IconSymbol name='globe' size={18} color='#fff' />
                    <ThemedText style={styles.primaryButtonText}>
                      Update Language
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Update Password */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Change Password
            </ThemedText>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder='Current password'
                placeholderTextColor='#999'
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder='New password'
                placeholderTextColor='#999'
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder='Confirm new password'
                placeholderTextColor='#999'
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <IconSymbol name='lock.fill' size={18} color='#fff' />
                    <ThemedText style={styles.primaryButtonText}>
                      Update Password
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy & Data */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Privacy & Data
            </ThemedText>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleExportData}
                disabled={loading}
              >
                <IconSymbol
                  name='square.and.arrow.up'
                  size={18}
                  color='#6996b3'
                />
                <ThemedText style={styles.secondaryButtonText}>
                  Export My Data
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.helperText}>
                Download all your personal data in JSON format (GDPR/CCPA
                compliant)
              </ThemedText>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <ThemedText type='defaultSemiBold' style={styles.dangerTitle}>
              Danger Zone
            </ThemedText>
            <View style={styles.dangerCard}>
              <TouchableOpacity
                style={styles.warningButton}
                onPress={handleDeleteProgress}
                disabled={loading}
              >
                <IconSymbol name='trash' size={18} color='#f54707' />
                <ThemedText style={styles.warningButtonText}>
                  Delete Progress Data
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.helperText}>
                Permanently delete all exercise progress and scores
              </ThemedText>

              <View style={styles.divider} />

              <ThemedText style={styles.deleteAccountLabel}>
                Delete Account
              </ThemedText>
              <TextInput
                style={styles.input}
                value={deleteConfirmPassword}
                onChangeText={setDeleteConfirmPassword}
                placeholder='Enter password to confirm'
                placeholderTextColor='#999'
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <IconSymbol
                      name='xmark.circle.fill'
                      size={18}
                      color='#fff'
                    />
                    <ThemedText style={styles.dangerButtonText}>
                      Delete Account Forever
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
              <ThemedText style={styles.helperText}>
                Permanently delete your account and all associated data. This
                cannot be undone.
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarTouchable: {
    position: 'relative',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6996b3',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  emailText: {
    marginTop: 12,
    color: '#202029',
    fontWeight: 'normal',
  },
  tapToChangeText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6996b3',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#000',
  },
  dangerTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#ff3b30',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  dangerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#fea382',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    color: '#6996b3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#202029',
    fontWeight: 'normal',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6996b3',
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#6996b3',
  },
  secondaryButtonText: {
    color: '#6996b3',
    fontSize: 16,
    fontWeight: '600',
  },
  warningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#feded2',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#fea382',
  },
  warningButtonText: {
    color: '#f54707',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 14,
    gap: 8,
    marginBottom: 8,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#202029',
    fontWeight: 'normal',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  deleteAccountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff3b30',
    marginBottom: 8,
  },
  languageSelectorContainer: {
    marginVertical: 12,
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 12,
  },
  languageOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6996b3',
  },
  languageFlag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  languageNameSelected: {
    color: '#6996b3',
    fontWeight: '600',
  },
  languageCodeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
