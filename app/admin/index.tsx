import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats } from '@/services/firebaseService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminPanel() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState({
    totalExercises: 0,
    totalUsers: 0,
    exercisesAddedThisMonth: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load real statistics from Firebase
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  if (!appUser?.isAdmin) {
    router.replace('/(tabs)');
    return null;
  }

  type AdminActionIcon =
    | 'plus.circle'
    | 'doc.badge.plus'
    | 'pencil.circle'
    | 'folder.circle'
    | 'person.2.circle'
    | 'chart.pie'
    | 'gear';

  const adminActions: Array<{
    icon: AdminActionIcon;
    title: string;
    subtitle: string;
    color: string;
    onPress: () => void;
    animation?: 'slide_from_right' | 'slide_from_bottom' | 'fade';
  }> = [
    {
      icon: 'plus.circle',
      title: 'Add New Exercise',
      subtitle: 'Create a new exercise for students',
      color: '#07b524',
      onPress: () => router.push('/admin/add-exercise'),
      animation: 'slide_from_right',
    },
    {
      icon: 'doc.badge.plus',
      title: 'Upload Files',
      subtitle: 'Upload PDFs and documents for students',
      color: '#FF9800',
      onPress: () => router.push('/admin/upload-files'),
      animation: 'slide_from_right',
    },
    {
      icon: 'pencil.circle',
      title: 'Manage Exercises',
      subtitle: 'Edit or delete existing exercises',
      color: '#6996b3',
      onPress: () => router.push('/admin/manage-exercises'),
      animation: 'slide_from_right',
    },
    {
      icon: 'folder.circle',
      title: 'Manage Categories',
      subtitle: 'Add, edit or organize categories',
      color: '#FF9800',
      onPress: () => router.push('/admin/manage-categories'),
      animation: 'slide_from_right',
    },
    {
      icon: 'person.2.circle',
      title: 'User Management',
      subtitle: 'View and manage user accounts',
      color: '#9C27B0',
      onPress: () => router.push('/admin/manage-users'),
      animation: 'slide_from_right',
    },
    {
      icon: 'chart.pie',
      title: 'Analytics',
      subtitle: 'View detailed usage statistics',
      color: '#607D8B',
      onPress: () => router.push('/admin/analytics'),
      animation: 'slide_from_right',
    },
    {
      icon: 'gear',
      title: 'App Settings',
      subtitle: 'Configure app-wide settings',
      color: '#795548',
      onPress: () => router.push('/admin/app-settings'),
      animation: 'slide_from_right',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <IconSymbol name='chevron.left' size={24} color='#6996b3' />
            <ThemedText style={styles.backText}>Back to Profile</ThemedText>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Image
              source={require('@/assets/images/LL2020.png')}
              style={styles.headerLogo}
              resizeMode='contain'
            />
            <ThemedText type='title' style={styles.title}>
              Admin Panel
            </ThemedText>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Overview
            </ThemedText>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#6996b3' />
                <ThemedText style={styles.loadingText}>
                  Loading statistics...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <IconSymbol name='doc.text' size={24} color='#6996b3' />
                  <ThemedText style={styles.statNumber}>
                    {stats.totalExercises}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>
                    Total Exercises
                  </ThemedText>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name='person.2' size={24} color='#07b524' />
                  <ThemedText style={styles.statNumber}>
                    {stats.totalUsers}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Total Users</ThemedText>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name='calendar' size={24} color='#FF9800' />
                  <ThemedText style={styles.statNumber}>
                    {stats.exercisesAddedThisMonth}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>
                    Added This Month
                  </ThemedText>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name='circle.fill' size={24} color='#07b524' />
                  <ThemedText style={styles.statNumber}>
                    {stats.activeUsers}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Active Users</ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Admin Actions */}
          <View style={styles.actionsContainer}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Actions
            </ThemedText>

            <View style={styles.actionsList}>
              {adminActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: `${action.color}20` },
                    ]}
                  >
                    <IconSymbol
                      name={action.icon}
                      size={28}
                      color={action.color}
                    />
                  </View>

                  <View style={styles.actionContent}>
                    <ThemedText style={styles.actionTitle}>
                      {action.title}
                    </ThemedText>
                    <ThemedText style={styles.actionSubtitle}>
                      {action.subtitle}
                    </ThemedText>
                  </View>

                  <IconSymbol name='chevron.right' size={20} color='#464655' />
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flex: 1,
  },
  header: {
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  statsContainer: {
    paddingVertical: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#444',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  statNumber: {
    fontSize: 24,

    marginVertical: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  actionsContainer: {
    paddingBottom: 24,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,

    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#444',
  },
});
