import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProgressStats } from '@/services/firebaseService';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

export default function ProgressScreen() {
  const { appUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    completedExercises: 0,
    totalExercises: 0,
    averageScore: 0,
    streak: 0,
    categories: [] as Array<{
      name: string;
      completed: number;
      total: number;
      avgScore: number;
    }>,
    recentActivity: [] as Array<{
      exerciseTitle: string;
      score: number;
      completedAt: Date;
      success: boolean;
    }>,
  });

  useEffect(() => {
    loadProgressData();
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const progressStats = await getUserProgressStats(user.uid);
      setStats(progressStats);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgressData();
    setRefreshing(false);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const progressPercentage =
    stats.totalExercises > 0
      ? (stats.completedExercises / stats.totalExercises) * 100
      : 0;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Image
              source={require('@/assets/images/favicon.png')}
              style={{ width: 40, height: 40 }}
            />
            <ThemedText type='title'>Your Progress</ThemedText>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#0078ff' />
          <ThemedText style={styles.loadingText}>
            Loading your progress...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <Image
            source={require('@/assets/images/favicon.png')}
            style={{ width: 40, height: 40 }}
          />
          <ThemedText type='title'>Your Progress</ThemedText>
        </View>
        <View style={{ height: 10 }} />
        <ThemedText style={styles.subtitle}>
          Keep up the great work, {appUser?.displayName || 'Student'}!
        </ThemedText>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Progress */}
        <View style={styles.card}>
          <ThemedText type='subtitle' style={styles.cardTitle}>
            Overall Progress
          </ThemedText>

          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <ThemedText style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </ThemedText>
            </View>

            <View style={styles.progressDetails}>
              <View style={styles.statRow}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={20}
                  color='#4CAF50'
                />
                <ThemedText style={styles.statText}>
                  {stats.completedExercises} of {stats.totalExercises} exercises
                  completed
                </ThemedText>
              </View>

              <View style={styles.statRow}>
                <IconSymbol name='chart.bar.fill' size={20} color='#0078ff' />
                <ThemedText style={styles.statText}>
                  Average score: {stats.averageScore}%
                </ThemedText>
              </View>

              <View style={styles.statRow}>
                <IconSymbol name='flame.fill' size={20} color='#FF9800' />
                <ThemedText style={styles.statText}>
                  {stats.streak} day streak
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Category Progress */}
        <View style={styles.card}>
          <ThemedText type='subtitle' style={styles.cardTitle}>
            Progress by Category
          </ThemedText>

          {stats.categories.map((category, index) => {
            const categoryProgress =
              (category.completed / category.total) * 100;

            return (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <ThemedText style={styles.categoryName}>
                    {category.name}
                  </ThemedText>
                  <ThemedText style={styles.categoryScore}>
                    Avg: {category.avgScore}%
                  </ThemedText>
                </View>

                <View style={styles.categoryProgress}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${categoryProgress}%`,
                          backgroundColor:
                            categoryProgress >= 70 ? '#4CAF50' : '#0078ff',
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.progressText}>
                    {category.completed}/{category.total}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <ThemedText type='subtitle' style={styles.cardTitle}>
            Recent Activity
          </ThemedText>

          {stats.recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name='clock' size={48} color='#ccc' />
              <ThemedText style={styles.emptyStateText}>
                No exercises completed yet
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Start an exercise to see your activity here!
              </ThemedText>
            </View>
          ) : (
            stats.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <IconSymbol
                    name={activity.success ? 'checkmark' : 'xmark'}
                    size={16}
                    color={activity.success ? '#4CAF50' : '#F44336'}
                  />
                </View>
                <View style={styles.activityContent}>
                  <ThemedText style={styles.activityTitle}>
                    {activity.exerciseTitle}
                  </ThemedText>
                  <ThemedText style={styles.activityDetails}>
                    {activity.success ? 'Completed' : 'Attempted'} • Score:{' '}
                    {activity.score}% • {formatTimeAgo(activity.completedAt)}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#444',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  cardTitle: {
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercentage: {
    fontSize: 20,
    color: '#0078ff',
  },
  progressDetails: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
  },
  categoryItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryScore: {
    fontSize: 14,
    color: '#444',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#444',
    minWidth: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,

    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#444',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
