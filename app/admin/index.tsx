import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminPanel() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState({
    totalExercises: 45,
    totalUsers: 128,
    exercisesAddedThisMonth: 8,
    activeUsers: 64,
  });

  // Redirect if not admin
  if (!appUser?.isAdmin) {
    router.replace('/(tabs)');
    return null;
  }

  const adminActions = [
    {
      icon: 'plus.circle',
      title: 'Add New Exercise',
      subtitle: 'Create a new exercise for students',
      color: '#4CAF50',
      onPress: () => router.push('/admin/add-exercise'),
    },
    {
      icon: 'pencil.circle',
      title: 'Manage Exercises',
      subtitle: 'Edit or delete existing exercises',
      color: '#2196F3',
      onPress: () => router.push('/admin/manage-exercises'),
    },
    {
      icon: 'folder.circle',
      title: 'Manage Categories',
      subtitle: 'Add, edit or organize categories',
      color: '#FF9800',
      onPress: () => router.push('/admin/manage-categories'),
    },
    {
      icon: 'person.2.circle',
      title: 'User Management',
      subtitle: 'View and manage user accounts',
      color: '#9C27B0',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'User management will be available in a future update.'
        ),
    },
    {
      icon: 'chart.pie',
      title: 'Analytics',
      subtitle: 'View detailed usage statistics',
      color: '#607D8B',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'Analytics dashboard will be available in a future update.'
        ),
    },
    {
      icon: 'gear',
      title: 'App Settings',
      subtitle: 'Configure app-wide settings',
      color: '#795548',
      onPress: () =>
        Alert.alert(
          'Coming Soon',
          'App settings will be available in a future update.'
        ),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name='chevron.left' size={24} color='#2196F3' />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          Admin Panel
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Overview
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol name='doc.text' size={24} color='#2196F3' />
              <ThemedText style={styles.statNumber}>
                {stats.totalExercises}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Exercises</ThemedText>
            </View>

            <View style={styles.statCard}>
              <IconSymbol name='person.2' size={24} color='#4CAF50' />
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
              <ThemedText style={styles.statLabel}>Added This Month</ThemedText>
            </View>

            <View style={styles.statCard}>
              <IconSymbol name='circle.fill' size={24} color='#4CAF50' />
              <ThemedText style={styles.statNumber}>
                {stats.activeUsers}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Active Users</ThemedText>
            </View>
          </View>
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

                <IconSymbol name='chevron.right' size={20} color='#666' />
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingHorizontal: 20,
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
    color: '#2196F3',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    paddingVertical: 24,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '500',
    marginVertical: 8,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});
