import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import {
  AppSettings,
  getAppSettings,
  resetAppSettings,
  updateAppSettings,
} from '@/services/firebaseService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AppSettingsScreen() {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    exerciseSettings: {
      defaultTimeLimit: 30,
      showSolutionsImmediately: false,
      enablePointsSystem: true,
    },
    userManagement: {
      allowNewRegistrations: true,
      requireEmailVerification: false,
    },
    notifications: {
      enablePushNotifications: true,
      dailyReminderTime: '09:00',
    },
    admin: {
      maintenanceMode: false,
      announcementBanner: '',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const appSettings = await getAppSettings();
      setSettings(appSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load app settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateAppSettings(settings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await resetAppSettings();
              await loadSettings();
              Alert.alert('Success', 'Settings reset to defaults');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  // Redirect if not admin
  if (!appUser?.isAdmin) {
    router.replace('/(tabs)');
    return null;
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#0078ff' />
          <ThemedText style={styles.loadingText}>
            Loading settings...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name='chevron.left' size={24} color='#0078ff' />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          App Settings
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name='doc.text' size={20} color='#4CAF50' />
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Exercise Settings
            </ThemedText>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Default Time Limit
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Default duration for timed exercises (minutes)
                </ThemedText>
              </View>
              <TextInput
                style={styles.numberInput}
                value={settings.exerciseSettings.defaultTimeLimit.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setSettings({
                    ...settings,
                    exerciseSettings: {
                      ...settings.exerciseSettings,
                      defaultTimeLimit: num,
                    },
                  });
                }}
                keyboardType='numeric'
                placeholder='30'
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Show Solutions Immediately
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Allow users to see answers right away
                </ThemedText>
              </View>
              <Switch
                value={settings.exerciseSettings.showSolutionsImmediately}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    exerciseSettings: {
                      ...settings.exerciseSettings,
                      showSolutionsImmediately: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor='#fff'
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Enable Points System
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Award points for completed exercises
                </ThemedText>
              </View>
              <Switch
                value={settings.exerciseSettings.enablePointsSystem}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    exerciseSettings: {
                      ...settings.exerciseSettings,
                      enablePointsSystem: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#4CAF50' }}
                thumbColor='#fff'
              />
            </View>
          </View>
        </View>

        {/* User Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name='person.2' size={20} color='#9C27B0' />
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              User Management
            </ThemedText>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Allow New Registrations
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Enable new users to create accounts
                </ThemedText>
              </View>
              <Switch
                value={settings.userManagement.allowNewRegistrations}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    userManagement: {
                      ...settings.userManagement,
                      allowNewRegistrations: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#9C27B0' }}
                thumbColor='#fff'
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Require Email Verification
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Users must verify email before accessing app
                </ThemedText>
              </View>
              <Switch
                value={settings.userManagement.requireEmailVerification}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    userManagement: {
                      ...settings.userManagement,
                      requireEmailVerification: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#9C27B0' }}
                thumbColor='#fff'
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name='bell' size={20} color='#FF9800' />
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Notifications
            </ThemedText>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Enable Push Notifications
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Send notifications to users
                </ThemedText>
              </View>
              <Switch
                value={settings.notifications.enablePushNotifications}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      enablePushNotifications: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#FF9800' }}
                thumbColor='#fff'
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Daily Reminder Time
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Time for daily practice reminders (HH:MM)
                </ThemedText>
              </View>
              <TextInput
                style={styles.timeInput}
                value={settings.notifications.dailyReminderTime}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      dailyReminderTime: text,
                    },
                  })
                }
                placeholder='09:00'
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Admin Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name='gear' size={20} color='#795548' />
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Admin
            </ThemedText>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Maintenance Mode
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Disable app for non-admin users
                </ThemedText>
              </View>
              <Switch
                value={settings.admin.maintenanceMode}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    admin: {
                      ...settings.admin,
                      maintenanceMode: value,
                    },
                  })
                }
                trackColor={{ false: '#ddd', true: '#F44336' }}
                thumbColor='#fff'
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRowColumn}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>
                  Announcement Banner
                </ThemedText>
                <ThemedText style={styles.settingDescription}>
                  Message to display to all users
                </ThemedText>
              </View>
              <TextInput
                style={styles.textAreaInput}
                value={settings.admin.announcementBanner}
                onChangeText={(text) =>
                  setSettings({
                    ...settings,
                    admin: {
                      ...settings.admin,
                      announcementBanner: text,
                    },
                  })
                }
                placeholder='Enter announcement message...'
                multiline
                numberOfLines={3}
                textAlignVertical='top'
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#fff'
                />
                <ThemedText style={styles.buttonText}>Save Settings</ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleResetSettings}
            disabled={saving}
          >
            <IconSymbol
              name='arrow.counterclockwise'
              size={20}
              color='#F44336'
            />
            <ThemedText style={[styles.buttonText, styles.resetButtonText]}>
              Reset to Defaults
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    color: '#0078ff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#444',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingRowColumn: {
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  timeInput: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  textAreaInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 80,
  },
  actionButtons: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#F44336',
  },
});
