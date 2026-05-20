import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { getUserProgressStats } from '@/services/firebaseService';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    completedExercises: 0,
    totalExercises: 0,
    averageScore: 0,
    streak: 0,
    categories: [] as {
      name: string;
      completed: number;
      total: number;
      avgScore: number;
    }[],
    recentActivity: [] as {
      exerciseTitle: string;
      score: number;
      completedAt: Date;
      success: boolean;
    }[],
  });

  const loadProgressData = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

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
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}
            >
              <Image
                source={require('@/assets/images/favicon.png')}
                style={{ width: 40, height: 40 }}
              />
              <ThemedText type="title">Your Progress</ThemedText>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent.mid} />
            <ThemedText style={styles.loadingText}>
              Loading your progress...
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <Image
              source={require('@/assets/images/favicon.png')}
              style={{ width: 40, height: 40 }}
            />
            <ThemedText type="title">Your Progress</ThemedText>
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
            <ThemedText type="subtitle" style={styles.cardTitle}>
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
                    name="checkmark.circle.fill"
                    size={20}
                    color={theme.status.success}
                  />
                  <ThemedText style={styles.statText}>
                    {stats.completedExercises} of {stats.totalExercises}{' '}
                    exercises completed
                  </ThemedText>
                </View>

                <View style={styles.statRow}>
                  <IconSymbol
                    name="chart.bar.fill"
                    size={20}
                    color={theme.accent.mid}
                  />
                  <ThemedText style={styles.statText}>
                    Average score: {stats.averageScore}%
                  </ThemedText>
                </View>

                <View style={styles.statRow}>
                  <IconSymbol
                    name="flame.fill"
                    size={20}
                    color={theme.status.warning}
                  />
                  <ThemedText style={styles.statText}>
                    {stats.streak} day streak
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Category Progress */}
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Progress by Category
            </ThemedText>

            {stats.categories.map((category, index) => {
              const categoryProgress =
                category.total > 0
                  ? (category.completed / category.total) * 100
                  : 0;

              // Determine color based on progress
              let barColor = theme.status.warning; // Default orange for in-progress
              if (categoryProgress === 0) {
                barColor = theme.accent.mid; // Accent for not started
              } else if (categoryProgress >= 90) {
                barColor = theme.status.success; // Green for almost/fully complete
              }

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
                            width:
                              categoryProgress === 0
                                ? '5%'
                                : `${categoryProgress}%`,
                            backgroundColor: barColor,
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
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Recent Activity
            </ThemedText>

            {stats.recentActivity.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol
                  name="clock"
                  size={48}
                  color={theme.icons.placeholder}
                />
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
                      color={
                        activity.success
                          ? theme.status.success
                          : theme.status.error
                      }
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
      </View>
    </ThemedView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text.secondary,
    },
    header: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: 10,
    },
    card: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
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
      backgroundColor: theme.backgrounds.progressCircle,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 20,
    },
    progressPercentage: {
      fontSize: 20,
      color: theme.text.accent,
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
      color: theme.text.secondary,
      marginLeft: 8,
    },
    categoryItem: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
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
      color: theme.text.secondary,
    },
    categoryProgress: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: theme.borders.divider,
      borderRadius: 4,
      marginRight: 12,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: theme.text.secondary,
      minWidth: 40,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.dividerLight,
    },
    activityIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.backgrounds.tinted,
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
      color: theme.text.secondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.text.secondary,
      marginTop: 16,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.icons.placeholder,
      marginTop: 8,
      textAlign: 'center',
    },
  });
}
