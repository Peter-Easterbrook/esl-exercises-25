import { ThemedLoader } from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/UserAvatar';
import { loadProfilePhoto } from '@/services/profilePhotoService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  categories: Array<{
    name: string;
    completed: number;
    total: number;
    avgScore: number;
  }>;
  recentActivity: Array<{
    exerciseTitle: string;
    score: number;
    completedAt: Date;
    success: boolean;
  }>;
}

export default function ManageUsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPhotos, setUserPhotos] = useState<Record<string, string | null>>(
    {}
  );

  // Modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Edit form states
  const [editDisplayName, setEditDisplayName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { getAllUsers } = await import('@/services/firebaseService');
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      // Load profile photos for all users
      const photos: Record<string, string | null> = {};
      await Promise.all(
        allUsers.map(async (user: UserData) => {
          const photoUri = await loadProfilePhoto(user.id);
          photos[user.id] = photoUri;
        })
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
      const { getUserProgressStats } = await import(
        '@/services/firebaseService'
      );
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
      const { updateUserDisplayName } = await import(
        '@/services/firebaseService'
      );
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
              const { deleteAllUserProgress } = await import(
                '@/services/firebaseService'
              );
              await deleteAllUserProgress(user.id);
              Alert.alert('Success', 'User progress reset successfully');
              loadUsers();
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Error', 'Failed to reset user progress');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = (user: UserData) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to permanently delete this account?\n\nUser: ${user.email}\n\nThis will:\n• Delete the user account permanently\n• Delete all progress and achievements\n• Delete all activity history\n\nThis action CANNOT be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Deletion',
          style: 'destructive',
          onPress: () => {
            // Second confirmation with email verification
            Alert.prompt(
              'Confirm Deletion',
              `Type the user's email to confirm: ${user.email}`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async (inputEmail?: string) => {
                    if (
                      inputEmail?.toLowerCase() === user.email.toLowerCase()
                    ) {
                      try {
                        const { deleteUserAccount } = await import(
                          '@/services/firebaseService'
                        );
                        await deleteUserAccount(user.id);
                        Alert.alert(
                          'Success',
                          'User account deleted successfully'
                        );
                        loadUsers();
                      } catch (error) {
                        console.error('Error deleting account:', error);
                        Alert.alert('Error', 'Failed to delete user account');
                      }
                    } else {
                      Alert.alert(
                        'Error',
                        'Email does not match. Deletion cancelled.'
                      );
                    }
                  },
                },
              ],
              'plain-text'
            );
          },
        },
      ]
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
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
          onPress={() => router.push('/admin')}
        >
          <IconSymbol name='chevron.left' size={24} color='#6996b3' />
          <ThemedText style={styles.backText}>Back to Admin</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          Manage Users
        </ThemedText>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name='magnifyingglass' size={20} color='#464655' />
          <TextInput
            style={styles.searchInput}
            placeholder='Search by name or email...'
            placeholderTextColor='rgba(102, 102, 102, 0.5)'
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
              <IconSymbol name='person.2' size={48} color='#ccc' />
              <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No users match your search' : 'No users found'}
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
                    <IconSymbol name='info.circle' size={20} color='#6996b3' />
                    <ThemedText style={styles.actionButtonText}>
                      Info
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditUser(user)}
                  >
                    <IconSymbol name='pencil' size={20} color='#6996b3' />
                    <ThemedText style={styles.actionButtonText}>
                      Edit
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.resetButton]}
                    onPress={() => handleResetProgress(user)}
                  >
                    <IconSymbol
                      name='arrow.clockwise'
                      size={20}
                      color='#FF9800'
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
                    <IconSymbol name='trash' size={20} color='#6f0202' />
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
        animationType='slide'
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type='subtitle' style={styles.modalTitle}>
                User Details
              </ThemedText>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name='xmark' size={24} color='#464655' />
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
                            idx: number
                          ) => (
                            <View key={idx} style={styles.categoryRow}>
                              <ThemedText style={styles.categoryName}>
                                {cat.name}
                              </ThemedText>
                              <ThemedText style={styles.categoryProgress}>
                                {cat.completed}/{cat.total} • {cat.avgScore}%
                              </ThemedText>
                            </View>
                          )
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
                              idx: number
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
                            )
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

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        animationType='slide'
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type='subtitle' style={styles.modalTitle}>
                Edit User
              </ThemedText>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol name='xmark' size={24} color='#464655' />
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
                      placeholder='Enter display name'
                      placeholderTextColor='rgba(102, 102, 102, 0.5)'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#6996b3',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
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
    color: '#444',
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    fontWeight: '600',
    color: '#333',
  },
  adminBadge: {
    backgroundColor: '#9C27B0',
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
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#464655',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#f0f0f0',
    gap: 4,
  },
  infoButton: {
    backgroundColor: '#E3F2FD',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  resetButton: {
    backgroundColor: '#FFF3E0',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6996b3',
  },
  resetText: {
    color: '#FF9800',
  },
  deleteText: {
    color: '#6f0202',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#eee',
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
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailEmail: {
    fontSize: 14,
    color: '#464655',
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
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6996b3',
  },
  statLabel: {
    fontSize: 12,
    color: '#464655',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
  },
  categoryProgress: {
    fontSize: 14,
    color: '#464655',
  },
  noActivity: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  scoreChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  scoreSuccess: {
    backgroundColor: '#E8F5E9',
  },
  scoreFail: {
    backgroundColor: '#FFEBEE',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  formInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  formInputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
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
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#464655',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6996b3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
