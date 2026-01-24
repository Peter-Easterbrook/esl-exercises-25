import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  backgrounds,
  blues,
  borders,
  colors,
  elevation,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import {
  AppSettings,
  auditOrphanedRecords,
  cleanupOrphanedRecords,
  getAppSettings,
  resetAppSettings,
  updateAppSettings,
} from "@/services/firebaseService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AppSettingsScreen() {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [cleanupModalVisible, setCleanupModalVisible] = useState(false);
  const [auditResults, setAuditResults] = useState<any>(null);
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
      dailyReminderTime: "09:00",
    },
    admin: {
      maintenanceMode: false,
      announcementBanner: "",
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
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load app settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateAppSettings(settings);
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await resetAppSettings();
              await loadSettings();
              Alert.alert("Success", "Settings reset to defaults");
            } catch (error) {
              console.error("Error resetting settings:", error);
              Alert.alert("Error", "Failed to reset settings");
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const handleAuditData = async () => {
    try {
      setSaving(true);
      const report = await auditOrphanedRecords();
      setAuditResults(report);
      setAuditModalVisible(true);
    } catch (error) {
      console.error("Error auditing data:", error);
      alert("Error: Failed to audit data integrity");
    } finally {
      setSaving(false);
    }
  };

  const handleCleanupData = () => {
    setCleanupModalVisible(true);
  };

  const confirmCleanup = async () => {
    try {
      setSaving(true);
      setCleanupModalVisible(false);
      const result = await cleanupOrphanedRecords();

      // Show success in audit modal
      setAuditResults({
        ...result,
        isCleanupResult: true,
      });
      setAuditModalVisible(true);
    } catch (error) {
      console.error("Error cleaning up data:", error);
      alert("Error: Failed to cleanup orphaned records");
    } finally {
      setSaving(false);
    }
  };

  // Redirect if not admin
  if (!appUser?.isAdmin) {
    router.replace("/(tabs)");
    return null;
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6996b3" />
          <ThemedText style={styles.loadingText}>
            Loading settings...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={blues.blue5} />
            <ThemedText style={styles.backText}>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>
            App Settings
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Exercise Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="doc.text" size={20} color={colors.success} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
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
                  keyboardType="numeric"
                  placeholder="30"
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
                  trackColor={{ false: "#ddd", true: colors.success }}
                  thumbColor="#fff"
                  thumbTintColor="#fff"
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
                  trackColor={{ false: "#ddd", true: colors.success }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>
          {/* User Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.2" size={20} color={blues.blue5} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
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
                  trackColor={{ false: "#ddd", true: blues.blue5 }}
                  thumbColor="#fff"
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
                  trackColor={{ false: "#ddd", true: blues.blue5 }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="bell" size={20} color={colors.warning} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
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
                  trackColor={{ false: "#ddd", true: colors.warning }}
                  thumbColor="#fff"
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
                  placeholder="09:00"
                  maxLength={5}
                />
              </View>
            </View>
          </View>

          {/* Admin Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="gear" size={20} color={blues.blue5} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
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
                  trackColor={{ false: "#ddd", true: colors.danger }}
                  thumbColor="#fff"
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
                  placeholder="Enter announcement message..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Data Integrity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol
                name="doc.text.magnifyingglass"
                size={20}
                color={blues.blue5}
              />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Data Integrity
              </ThemedText>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingRowColumn}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>
                    Audit Database
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Check for orphaned progress records (records referencing
                    deleted users or exercises)
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.dataButton, styles.auditButton]}
                  onPress={handleAuditData}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={blues.blue5} />
                  ) : (
                    <>
                      <IconSymbol
                        name="magnifyingglass"
                        size={18}
                        color={blues.blue5}
                      />
                      <ThemedText style={styles.auditButtonText}>
                        Run Audit
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRowColumn}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingLabel}>
                    Cleanup Orphaned Records
                  </ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Remove progress records that reference deleted users or
                    exercises. Run audit first to see what will be deleted.
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.dataButton, styles.cleanupButton]}
                  onPress={handleCleanupData}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <IconSymbol name="trash" size={18} color="#fff" />
                      <ThemedText style={styles.cleanupButtonText}>
                        Cleanup Now
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
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
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#fff"
                  />
                  <ThemedText style={styles.buttonText}>
                    Save Settings
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleResetSettings}
              disabled={saving}
            >
              <IconSymbol
                name="arrow.counterclockwise"
                size={20}
                color={colors.danger}
              />
              <ThemedText style={[styles.buttonText, styles.resetButtonText]}>
                Reset to Defaults
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Audit Results Modal */}
      <Modal
        visible={auditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAuditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <IconSymbol
                name={
                  auditResults?.isCleanupResult
                    ? "checkmark.circle.fill"
                    : "doc.text.magnifyingglass"
                }
                size={24}
                color={
                  auditResults?.isCleanupResult ? colors.success : blues.blue5
                }
              />
              <ThemedText style={styles.modalTitle}>
                {auditResults?.isCleanupResult
                  ? "Cleanup Complete"
                  : "Data Integrity Audit"}
              </ThemedText>
            </View>

            <View style={styles.modalBody}>
              {auditResults?.isCleanupResult ? (
                <ThemedText style={styles.modalText}>
                  {auditResults.message}
                </ThemedText>
              ) : (
                <>
                  <View style={styles.statRow}>
                    <ThemedText style={styles.statLabel}>
                      Total Progress Records:
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {auditResults?.totalProgressRecords || 0}
                    </ThemedText>
                  </View>
                  <View style={styles.statRow}>
                    <ThemedText style={styles.statLabel}>
                      Total Users:
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {auditResults?.totalUsers || 0}
                    </ThemedText>
                  </View>
                  <View style={styles.statRow}>
                    <ThemedText style={styles.statLabel}>
                      Total Exercises:
                    </ThemedText>
                    <ThemedText style={styles.statValue}>
                      {auditResults?.totalExercises || 0}
                    </ThemedText>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.statRow}>
                    <ThemedText style={styles.statLabelBold}>
                      Orphaned Records Found:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.statValueBold,
                        {
                          color:
                            auditResults?.orphanedRecords > 0
                              ? colors.warning
                              : colors.success,
                        },
                      ]}
                    >
                      {auditResults?.orphanedRecords || 0}
                    </ThemedText>
                  </View>

                  {auditResults?.orphanedRecords > 0 && (
                    <View style={styles.warningBox}>
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={16}
                        color={colors.warning}
                      />
                      <ThemedText style={styles.warningText}>
                        These records reference deleted users or exercises and
                        should be cleaned up.
                      </ThemedText>
                    </View>
                  )}

                  {auditResults?.orphanedRecords === 0 && (
                    <View style={styles.successBox}>
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={16}
                        color={colors.success}
                      />
                      <ThemedText style={styles.successText}>
                        Database is clean! No orphaned records found.
                      </ThemedText>
                    </View>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAuditModalVisible(false)}
            >
              <ThemedText style={styles.modalButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cleanup Confirmation Modal */}
      <Modal
        visible={cleanupModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCleanupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={24}
                color={colors.danger}
              />
              <ThemedText style={styles.modalTitle}>Confirm Cleanup</ThemedText>
            </View>

            <View style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                This will permanently delete all progress records that reference
                deleted users or exercises.
              </ThemedText>
              <ThemedText
                style={[styles.modalText, { marginTop: 12, fontWeight: "600" }]}
              >
                This action cannot be undone.
              </ThemedText>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.cancelButton]}
                onPress={() => setCleanupModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.confirmButton]}
                onPress={confirmCleanup}
              >
                <ThemedText style={styles.confirmButtonText}>
                  Cleanup
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgrounds.subtle,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    color: blues.blue5,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#444",
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
  },
  settingCard: {
    backgroundColor: backgrounds.primary,
    borderRadius: 12,
    padding: 12,
    ...elevation.level1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#202029",
    fontWeight: "normal",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: borders.light,
    marginVertical: 4,
  },
  numberInput: {
    width: 80,
    height: 40,
    borderWidth: 0.5,
    borderColor: borders.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: backgrounds.primary,
  },
  timeInput: {
    width: 100,
    height: 40,
    borderWidth: 0.5,
    borderColor: borders.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: backgrounds.primary,
  },
  textAreaInput: {
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: borders.medium,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: backgrounds.primary,
    minHeight: 80,
  },
  actionButtons: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: colors.success,
    ...elevation.level1,
  },
  resetButton: {
    backgroundColor: backgrounds.primary,
    borderWidth: 0.5,
    borderColor: colors.danger,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  resetButtonText: {
    color: colors.danger,
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  auditButton: {
    backgroundColor: backgrounds.primary,
    borderWidth: 0.5,
    borderColor: blues.blue5,
  },
  auditButtonText: {
    color: blues.blue5,
    fontSize: 14,
    fontWeight: "500",
  },
  cleanupButton: {
    backgroundColor: colors.danger,
  },
  cleanupButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: backgrounds.primary,
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    ...elevation.level3,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: borders.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#202029",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 15,
    color: "#444",
  },
  statValue: {
    fontSize: 15,
    color: "#202029",
    fontWeight: "500",
  },
  statLabelBold: {
    fontSize: 16,
    color: "#202029",
    fontWeight: "500",
  },
  statValueBold: {
    fontSize: 18,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#e65100",
    lineHeight: 20,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: "#1b5e20",
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: blues.blue5,
    margin: 20,
    marginTop: 0,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: backgrounds.primary,
    borderWidth: 0.5,
    borderColor: borders.medium,
  },
  cancelButtonText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: colors.danger,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
