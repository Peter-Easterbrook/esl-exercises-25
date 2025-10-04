import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function ProgressScreen() {
  const { appUser } = useAuth();

  // Mock progress data - later this will come from Firebase
  const stats = {
    completedExercises: 12,
    totalExercises: 45,
    averageScore: 78,
    streak: 5,
    categories: [
      { name: 'Tenses', completed: 5, total: 8, avgScore: 85 },
      { name: 'Grammar', completed: 3, total: 10, avgScore: 72 },
      { name: 'Vocabulary', completed: 2, total: 12, avgScore: 90 },
      { name: 'Reading Comprehension', completed: 2, total: 8, avgScore: 65 },
    ],
  };

  const progressPercentage =
    (stats.completedExercises / stats.totalExercises) * 100;

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                <IconSymbol name='chart.bar.fill' size={20} color='#2196F3' />
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
                            categoryProgress >= 70 ? '#4CAF50' : '#2196F3',
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

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <IconSymbol name='checkmark' size={16} color='#4CAF50' />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>
                Present Simple Tense
              </ThemedText>
              <ThemedText style={styles.activityDetails}>
                Completed • Score: 85% • 2 hours ago
              </ThemedText>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <IconSymbol name='checkmark' size={16} color='#4CAF50' />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>
                Past Simple Tense
              </ThemedText>
              <ThemedText style={styles.activityDetails}>
                Completed • Score: 92% • Yesterday
              </ThemedText>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <IconSymbol name='xmark' size={16} color='#F44336' />
            </View>
            <View style={styles.activityContent}>
              <ThemedText style={styles.activityTitle}>
                Future Perfect Tense
              </ThemedText>
              <ThemedText style={styles.activityDetails}>
                Attempted • Score: 45% • 2 days ago
              </ThemedText>
            </View>
          </View>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '500',
    color: '#2196F3',
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
    color: '#666',
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
    fontWeight: '600',
  },
  categoryScore: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
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
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#666',
  },
});
