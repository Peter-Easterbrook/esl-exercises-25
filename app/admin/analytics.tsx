import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { backgrounds, blues, borders, colors, elevation } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalyticsData } from '@/services/firebaseService';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Calculate proper chart width accounting for all padding
const contentMaxWidth = 600;
const contentPadding = 20; // content paddingHorizontal: 10 * 2
const chartContainerPadding = 24; // chartContainer padding: 12 * 2
const chartWidth = Math.min(screenWidth, contentMaxWidth) - contentPadding - chartContainerPadding;

interface AnalyticsData {
  totalCompletions: number;
  averageScore: number;
  completionRate: number;
  categoryPerformance: { name: string; count: number; percentage: number }[];
  difficultyDistribution: { name: string; count: number; color: string }[];
  userActivityTrend: { day: string; users: number }[];
  topExercises: { title: string; completions: number }[];
  recentActivity: {
    user: string;
    exercise: string;
    score: number;
    date: string;
  }[];
}

export default function AnalyticsScreen() {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'users' | 'exercises'
  >('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalCompletions: 0,
    averageScore: 0,
    completionRate: 0,
    categoryPerformance: [],
    difficultyDistribution: [],
    userActivityTrend: [],
    topExercises: [],
    recentActivity: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch real analytics data from Firebase
      const data = await getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
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
          <ActivityIndicator size='large' color={blues.blue5} />
          <ThemedText style={styles.loadingText}>
            Loading analytics...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: backgrounds.primary,
    backgroundGradientTo: backgrounds.primary,
    color: (opacity = 1) => `rgba(105, 150, 179, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.85,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const pieChartData = analyticsData.difficultyDistribution.map((item) => ({
    name: item.name,
    population: item.count,
    color: item.color,
    legendFontColor: '#202029',
    legendFontSize: 12,
  }));

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name='chevron.left' size={24} color={blues.blue5} />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>

          <ThemedText type='title' style={styles.title}>
            Analytics Dashboard
          </ThemedText>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
            onPress={() => setSelectedTab('overview')}
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'users' && styles.activeTab]}
            onPress={() => setSelectedTab('users')}
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === 'users' && styles.activeTabText,
              ]}
            >
              Users
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'exercises' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('exercises')}
          >
            <ThemedText
              style={[
                styles.tabText,
                selectedTab === 'exercises' && styles.activeTabText,
              ]}
            >
              Exercises
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Key Metrics */}
          <View style={styles.section}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Key Metrics
            </ThemedText>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={32}
                  color={colors.success}
                />
                <ThemedText style={styles.metricValue}>
                  {analyticsData.totalCompletions}
                </ThemedText>
                <ThemedText style={styles.metricLabel}>
                  Total Completions
                </ThemedText>
              </View>

              <View style={styles.metricCard}>
                <IconSymbol name='star.fill' size={32} color={colors.warning} />
                <ThemedText style={styles.metricValue}>
                  {analyticsData.averageScore}%
                </ThemedText>
                <ThemedText style={styles.metricLabel}>Avg Score</ThemedText>
              </View>

              <View style={styles.metricCard}>
                <IconSymbol
                  name='chart.line.uptrend.xyaxis'
                  size={32}
                  color={blues.blue5}
                />
                <ThemedText style={styles.metricValue}>
                  {analyticsData.completionRate}%
                </ThemedText>
                <ThemedText style={styles.metricLabel}>
                  Completion Rate
                </ThemedText>
              </View>
            </View>
          </View>

          {selectedTab === 'overview' && (
            <>
              {/* User Activity Trend */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  User Activity (Last 7 Days)
                </ThemedText>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: analyticsData.userActivityTrend.map((d) => d.day),
                      datasets: [
                        {
                          data: analyticsData.userActivityTrend.map(
                            (d) => d.users
                          ),
                        },
                      ],
                    }}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    fromZero
                  />
                </View>
              </View>

              {/* Category Performance */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Category Performance
                </ThemedText>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: analyticsData.categoryPerformance.map(
                        (c) => c.name
                      ),
                      datasets: [
                        {
                          data: analyticsData.categoryPerformance.map(
                            (c) => c.count
                          ),
                        },
                      ],
                    }}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=''
                    yAxisSuffix=''
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                  />
                </View>

                {/* Category List */}
                <View style={styles.categoryList}>
                  {analyticsData.categoryPerformance.map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <ThemedText style={styles.categoryName}>
                          {category.name}
                        </ThemedText>
                        <ThemedText style={styles.categoryCount}>
                          {category.count} completions
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.categoryPercentage}>
                        {category.percentage}%
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Difficulty Distribution */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Difficulty Distribution
                </ThemedText>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieChartData}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor='population'
                    backgroundColor='transparent'
                    paddingLeft='15'
                    absolute
                  />
                </View>
              </View>
            </>
          )}

          {selectedTab === 'users' && (
            <>
              {/* User Activity Trend */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Daily Active Users
                </ThemedText>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: analyticsData.userActivityTrend.map((d) => d.day),
                      datasets: [
                        {
                          data: analyticsData.userActivityTrend.map(
                            (d) => d.users
                          ),
                        },
                      ],
                    }}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
                    }}
                    bezier
                    style={styles.chart}
                    fromZero
                  />
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Recent Activity
                </ThemedText>
                <View style={styles.activityList}>
                  {analyticsData.recentActivity.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityIcon}>
                        <IconSymbol
                          name='person.circle.fill'
                          size={24}
                          color={blues.blue5}
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <ThemedText style={styles.activityUser}>
                          {activity.user}
                        </ThemedText>
                        <ThemedText style={styles.activityExercise}>
                          {activity.exercise}
                        </ThemedText>
                      </View>
                      <View style={styles.activityMeta}>
                        <ThemedText style={styles.activityScore}>
                          {activity.score}%
                        </ThemedText>
                        <ThemedText style={styles.activityDate}>
                          {activity.date}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {selectedTab === 'exercises' && (
            <>
              {/* Top Exercises */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Most Completed Exercises
                </ThemedText>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={{
                      labels: analyticsData.topExercises.map(
                        (_, i) => `#${i + 1}`
                      ),
                      datasets: [
                        {
                          data: analyticsData.topExercises.map(
                            (e) => e.completions
                          ),
                        },
                      ],
                    }}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=''
                    yAxisSuffix=''
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    }}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                  />
                </View>

                <View style={styles.exerciseList}>
                  {analyticsData.topExercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseItem}>
                      <View style={styles.exerciseRank}>
                        <ThemedText style={styles.rankNumber}>
                          #{index + 1}
                        </ThemedText>
                      </View>
                      <View style={styles.exerciseInfo}>
                        <ThemedText style={styles.exerciseTitle}>
                          {exercise.title}
                        </ThemedText>
                        <ThemedText style={styles.exerciseCount}>
                          {exercise.completions} completions
                        </ThemedText>
                      </View>
                      <IconSymbol
                        name='chevron.right'
                        size={20}
                        color='#464655'
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Difficulty Distribution */}
              <View style={styles.section}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>
                  Exercise Difficulty Distribution
                </ThemedText>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={pieChartData}
                    width={chartWidth}
                    height={220}
                    chartConfig={chartConfig}
                    accessor='population'
                    backgroundColor='transparent'
                    paddingLeft='15'
                    absolute
                  />
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgrounds.subtle,
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
    color: blues.blue5,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: backgrounds.primary,
    borderBottomWidth: 1,
    borderBottomColor: borders.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: blues.blue5,
  },
  tabText: {
    fontSize: 14,
    color: '#202029',
    fontWeight: 'normal',
  },
  activeTabText: {
    color: blues.blue5,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: backgrounds.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...elevation.level1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 8,
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: backgrounds.primary,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 0,
    ...elevation.level1,
  },
  chart: {
    borderRadius: 12,
  },
  categoryList: {
    marginTop: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: backgrounds.primary,
    padding: 12,
    borderRadius: 12,
    ...elevation.level1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#444',
  },
  categoryPercentage: {
    fontSize: 18,
    fontWeight: 'normal',
    color: colors.success,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgrounds.primary,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    ...elevation.level1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: backgrounds.tinted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityExercise: {
    fontSize: 14,
    color: '#444',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityScore: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
  },
  exerciseList: {
    marginTop: 16,
    gap: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: backgrounds.primary,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    ...elevation.level1,
  },
  exerciseRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: backgrounds.tinted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseCount: {
    fontSize: 14,
    color: '#444',
  },
});
