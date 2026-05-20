import { ThemedLoader } from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/UserAvatar';
import { AppTheme } from '@/constants/themes';
import { useAppTheme } from '@/contexts/ThemeContext';
import { loadProfilePhoto } from '@/services/profilePhotoService';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt?: Date;
}

interface UserStats {
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  streak: number;
  categories: {
    name: string;
    completed: number;
    total: number;
    avgScore: number;
  }[];
  recentActivity: {
    exerciseTitle: string;
    score: number;
    completedAt: Date;
    success: boolean;
  }[];
}

export default function ManageUsersScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPhotos, setUserPhotos] = useState<Record<string, string | null>>(
    {},
  );

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [editDisplayName, setEditDisplayName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { getAllUsers } = await import('@/services/firebaseService');
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      const photos: Record<string, string | null> = {};
      await Promise.all(
        allUsers.map(async (user: UserData) => {
          const photoUri = await loadProfilePhoto(user.id);
          photos[user.id] = photoUri;
        }),
      );
      setUserPhotos(photos);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadUsers();
      return;
    }

    try {
      const { searchUsers } = await import('@/services/firebaseService');
      const results = await searchUsers(query);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  const handleViewDetails = async (user: UserData) => {
    setSelectedUser(user);
    setDetailsModalVisible(true);
    setLoadingStats(true);

    try {
      const { getUserProgressStats } =
        await import('@/services/firebaseService');
      const stats = await getUserProgressStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      Alert.alert('Error', 'Failed to load user statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditDisplayName(user.displayName || '');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setSavingEdit(true);
      const { updateUserDisplayName } =
        await import('@/services/firebaseService');
      await updateUserDisplayName(selectedUser.id, editDisplayName.trim());
      Alert.alert('Success', 'User updated successfully');
      setEditModalVisible(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResetProgress = (user: UserData) => {
    Alert.alert(
      'Reset Progress',
      `Are you sure you want to reset all progress for ${
        user.displayName || user.email
      }?\n\nThis will delete:\n• All completed exercises\n• All scores and achievements\n• All activity history\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Progress',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteAllUserProgress } =
                await import('@/services/firebaseService');
              await deleteAllUserProgress(user.id);
              Alert.alert('Success', 'User progress reset successfully');
              loadUsers();
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset user progress');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = (user: UserData) => {
    setUserToDelete(user);
    setDeleteEmailInput('');
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (
      deleteEmailInput.trim().toLowerCase() !== userToDelete.email.toLowerCase()
    ) {
      Alert.alert('Error', 'Email does not match. Deletion cancelled.');
      return;
    }
    try {
      setDeleting(true);
      const { deleteUserAccount } = await import('@/services/firebaseService');
      await deleteUserAccount(userToDelete.id);
      setDeleteModalVisible(false);
      Alert.alert('Success', 'User account deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete user account');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date?: Date | { toDate: () => Date }) => {
    if (!date) return 'Unknown';
    const jsDate =
      typeof (date as any).toDate === 'function'
        ? (date as any).toDate()
        : new Date(date as Date);
    return jsDate.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(date);
  };

  if (loading) {
    return <ThemedLoader />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={theme.accent.mid} />
            <ThemedText style={styles.backText}>Back to Admin</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>
            Manage Users
          </ThemedText>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color={theme.icons.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              placeholderTextColor={theme.icons.placeholder}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {/* Users List */}
          <ScrollView
            style={styles.usersList}
            showsVerticalScrollIndicator={false}
          >
            {users.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name="person.2" size={48} color={theme.icons.placeholder} />
                <ThemedText style={styles.emptyText}>
                  {searchQuery
                    ? 'No users match your search'
                    : 'No users found'}
                </ThemedText>
              </View>
            ) : (
              users.map((user: UserData) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <UserAvatar
                      displayName={user.displayName}
                      email={user.email}
                      size={50}
                      photoUri={userPhotos[user.id]}
                    />
                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <ThemedText style={styles.userName}>
                          {user.displayName || 'No Name'}
                        </ThemedText>
                        {user.isAdmin && (
                          <View style={styles.adminBadge}>
                            <ThemedText style={styles.adminBadgeText}>
                              Admin
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <ThemedText style={styles.userEmail}>
                        {user.email}
                      </ThemedText>
                      <ThemedText style={styles.userMeta}>
                        Joined {formatDate(user.createdAt)}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.infoButton]}
                      onPress={() => handleViewDetails(user)}
                    >
                      <IconSymbol
                        name="info.circle"
                        size={20}
                        color={theme.accent.mid}
                      />
                      <ThemedText style={styles.actionButtonText}>
                        Info
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditUser(user)}
                    >
                      <IconSymbol name="pencil" size={20} color={theme.accent.mid} />
                      <ThemedText style={styles.actionButtonText}>
                        Edit
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.resetButton]}
                      onPress={() => handleResetProgress(user)}
                    >
                      <IconSymbol
                        name="arrow.clockwise"
                        size={20}
                        color={theme.status.warning}
                      />
                      <ThemedText
                        style={[styles.actionButtonText, styles.resetText]}
                      >
                        Reset
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAccount(user)}
                    >
                      <IconSymbol name="trash" size={20} color={theme.status.error} />
                      <ThemedText
                        style={[styles.actionButtonText, styles.deleteText]}
                      >
                        Delete
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* User Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                User Details
              </ThemedText>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={theme.icons.tertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedUser && (
                <>
                  {/* User Info */}
                  <View style={styles.detailSection}>
                    <View style={styles.avatarCenter}>
                      <UserAvatar
                        displayName={selectedUser.displayName}
                        email={selectedUser.email}
                        size={80}
                        photoUri={userPhotos[selectedUser.id]}
                      />
                    </View>
                    <ThemedText style={styles.detailName}>
                      {selectedUser.displayName || 'No Name'}
                    </ThemedText>
                    <ThemedText style={styles.detailEmail}>
                      {selectedUser.email}
                    </ThemedText>
                    {selectedUser.isAdmin && (
                      <View style={[styles.adminBadge, styles.adminBadgeLarge]}>
                        <ThemedText style={styles.adminBadgeText}>
                          Administrator
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Statistics */}
                  {loadingStats ? (
                    <View style={styles.loadingContainer}>
                      <ThemedText>Loading statistics...</ThemedText>
                    </View>
                  ) : userStats ? (
                    <>
                      <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                          <ThemedText style={styles.statNumber}>
                            {userStats.completedExercises}
                          </ThemedText>
                          <ThemedText style={styles.statLabel}>
                            Completed
                          </ThemedText>
                        </View>
                        <View style={styles.statCard}>
                          <ThemedText style={styles.statNumber}>
                            {userStats.averageScore}%
                          </ThemedText>
                          <ThemedText style={styles.statLabel}>
                            Avg Score
                          </ThemedText>
                        </View>
                        <View style={styles.statCard}>
                          <ThemedText style={styles.statNumber}>
                            {userStats.streak}
                          </ThemedText>
                          <ThemedText style={styles.statLabel}>
                            Day Streak
                          </ThemedText>
                        </View>
                      </View>

                      {/* Category Breakdown */}
                      <View style={styles.detailSection}>
                        <ThemedText style={styles.sectionTitle}>
                          Category Progress
                        </ThemedText>
                        {userStats.categories.map(
                          (
                            cat: {
                              name: string;
                              completed: number;
                              total: number;
                              avgScore: number;
                            },
                            idx: number,
                          ) => (
                            <View key={idx} style={styles.categoryRow}>
                              <ThemedText style={styles.categoryName}>
                                {cat.name}
                              </ThemedText>
                              <ThemedText style={styles.categoryProgress}>
                                {cat.completed}/{cat.total} • {cat.avgScore}%
                              </ThemedText>
                            </View>
                          ),
                        )}
                      </View>

                      {/* Recent Activity */}
                      <View style={styles.detailSection}>
                        <ThemedText style={styles.sectionTitle}>
                          Recent Activity
                        </ThemedText>
                        {userStats.recentActivity.length === 0 ? (
                          <ThemedText style={styles.noActivity}>
                            No recent activity
                          </ThemedText>
                        ) : (
                          userStats.recentActivity.map(
                            (
                              activity: {
                                exerciseTitle: string;
                                score: number;
                                completedAt: Date;
                                success: boolean;
                              },
                              idx: number,
                            ) => (
                              <View key={idx} style={styles.activityRow}>
                                <View style={styles.activityInfo}>
                                  <ThemedText style={styles.activityTitle}>
                                    {activity.exerciseTitle}
                                  </ThemedText>
                                  <ThemedText style={styles.activityDate}>
                                    {formatRelativeTime(activity.completedAt)}
                                  </ThemedText>
                                </View>
                                <View
                                  style={[
                                    styles.scoreChip,
                                    activity.success
                                      ? styles.scoreSuccess
                                      : styles.scoreFail,
                                  ]}
                                >
                                  <ThemedText style={styles.scoreText}>
                                    {activity.score}%
                                  </ThemedText>
                                </View>
                              </View>
                            ),
                          )
                        )}
                      </View>
                    </>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Delete Account
              </ThemedText>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={theme.icons.tertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {userToDelete && (
                <>
                  <ThemedText style={styles.deleteWarning}>
                    This will permanently delete the account for:
                  </ThemedText>
                  <ThemedText style={styles.deleteEmail}>
                    {userToDelete.email}
                  </ThemedText>
                  <ThemedText style={styles.deleteWarning}>
                    All progress, achievements, and activity history will be
                    deleted. This action cannot be undone.
                  </ThemedText>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>
                      Type the user&apos;s email to confirm
                    </ThemedText>
                    <TextInput
                      style={styles.formInput}
                      value={deleteEmailInput}
                      onChangeText={setDeleteEmailInput}
                      placeholder={userToDelete.email}
                      placeholderTextColor={theme.icons.placeholder}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setDeleteModalVisible(false)}
                    >
                      <ThemedText style={styles.cancelButtonText}>
                        Cancel
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.modalButton,
                        styles.confirmDeleteButton,
                        deleting && styles.disabledButton,
                      ]}
                      onPress={handleConfirmDelete}
                      disabled={deleting}
                    >
                      <ThemedText style={styles.confirmDeleteButtonText}>
                        {deleting ? 'Deleting...' : 'Delete Account'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Edit User
              </ThemedText>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name="xmark" size={24} color={theme.icons.tertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedUser && (
                <>
                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>Email</ThemedText>
                    <TextInput
                      style={[styles.formInput, styles.formInputDisabled]}
                      value={selectedUser.email}
                      editable={false}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.formLabel}>
                      Display Name
                    </ThemedText>
                    <TextInput
                      style={styles.formInput}
                      value={editDisplayName}
                      onChangeText={setEditDisplayName}
                      placeholder="Enter display name"
                      placeholderTextColor={theme.icons.placeholder}
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <ThemedText style={styles.cancelButtonText}>
                        Cancel
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.modalButton,
                        styles.saveButton,
                        savingEdit && styles.disabledButton,
                      ]}
                      onPress={handleSaveEdit}
                      disabled={savingEdit}
                    >
                      <ThemedText style={styles.saveButtonText}>
                        {savingEdit ? 'Saving...' : 'Save Changes'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgrounds.card,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: theme.backgrounds.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backText: {
      marginLeft: 8,
      color: theme.accent.mid,
      fontSize: 16,
    },
    title: {
      fontSize: 28,
      lineHeight: 34,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgrounds.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginTop: 16,
      marginBottom: 16,
      boxShadow: theme.shadow.level1,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: theme.text.title,
    },
    usersList: {
      flex: 1,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text.secondary,
    },
    userCard: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      boxShadow: theme.shadow.level1,
    },
    userHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
      marginLeft: 12,
    },
    userNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    userName: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.text.primary,
    },
    adminBadge: {
      backgroundColor: theme.accent.darkest,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    adminBadgeLarge: {
      marginTop: 8,
      alignSelf: 'center',
    },
    adminBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
    userEmail: {
      fontSize: 14,
      color: theme.text.primary,
      fontWeight: 'normal',
      marginBottom: 4,
    },
    userMeta: {
      fontSize: 12,
      color: theme.icons.placeholder,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: theme.backgrounds.subtle,
      gap: 4,
    },
    infoButton: {
      backgroundColor: theme.backgrounds.tintedStrong,
    },
    editButton: {
      backgroundColor: theme.backgrounds.tintedStrong,
    },
    resetButton: {
      backgroundColor: theme.difficulty.intermediate.background,
    },
    deleteButton: {
      backgroundColor: theme.destructive.background,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.accent.mid,
    },
    resetText: {
      color: theme.status.warning,
    },
    deleteText: {
      color: theme.status.error,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 16,
      width: '90%',
      maxHeight: '80%',
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    modalTitle: {
      fontSize: 20,
    },
    closeButton: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
    },
    detailSection: {
      marginBottom: 24,
    },
    avatarCenter: {
      alignItems: 'center',
      marginBottom: 12,
    },
    detailName: {
      fontSize: 22,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 4,
    },
    detailEmail: {
      fontSize: 14,
      color: theme.text.primary,
      fontWeight: 'normal',
      textAlign: 'center',
      marginBottom: 8,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgrounds.subtle,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.accent.mid,
    },
    statLabel: {
      fontSize: 12,
      color: theme.text.primary,
      fontWeight: 'normal',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 12,
      color: theme.text.primary,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.dividerLight,
    },
    categoryName: {
      fontSize: 14,
      color: theme.text.primary,
    },
    categoryProgress: {
      fontSize: 14,
      color: theme.text.primary,
      fontWeight: 'normal',
    },
    noActivity: {
      fontSize: 14,
      color: theme.icons.placeholder,
      textAlign: 'center',
      paddingVertical: 20,
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.dividerLight,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      color: theme.text.primary,
      marginBottom: 4,
    },
    activityDate: {
      fontSize: 12,
      color: theme.icons.placeholder,
    },
    scoreChip: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    scoreSuccess: {
      backgroundColor: theme.difficulty.beginner.background,
    },
    scoreFail: {
      backgroundColor: theme.destructive.background,
    },
    scoreText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text.primary,
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: theme.text.primary,
    },
    formInput: {
      backgroundColor: theme.backgrounds.subtle,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.text.title,
      borderWidth: 0.5,
      borderColor: theme.borders.divider,
    },
    formInputDisabled: {
      backgroundColor: theme.backgrounds.subtle,
      color: theme.icons.placeholder,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgrounds.subtle,
    },
    cancelButtonText: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: '500',
    },
    saveButton: {
      backgroundColor: theme.accent.mid,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    disabledButton: {
      opacity: 0.5,
    },
    deleteWarning: {
      fontSize: 14,
      color: theme.text.primary,
      marginBottom: 8,
    },
    deleteEmail: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.status.error,
      marginBottom: 12,
    },
    confirmDeleteButton: {
      backgroundColor: theme.status.error,
    },
    confirmDeleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
  });
}
