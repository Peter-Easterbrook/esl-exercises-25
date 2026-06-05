import { PremiumPurchaseModal } from '@/components/PremiumPurchaseModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LEVEL_COLOURS } from '@/constants/levelTest';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { downloadFile, getFilesByCategory } from '@/services/fileService';
import { getUserProgress } from '@/services/firebaseService';
import { Category, DownloadableFile, Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface CategoryCardProps {
  category: Category;
  refreshToken?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  refreshToken,
}) => {
  const { user, hasPremiumAccess, appUser } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isLevelTest = category.name === 'Level Test';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [downloadableFiles, setDownloadableFiles] = useState<
    DownloadableFile[]
  >([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(
    new Set(),
  );
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Admins have free access to downloads
  const canDownload = hasPremiumAccess || appUser?.isAdmin;

  useEffect(() => {
    const loadExercises = async () => {
      if (isExpanded && exercises.length === 0) {
        try {
          // First check if category already has exercises loaded
          if (category.exercises && category.exercises.length > 0) {
            // ensure exercises are shown alphabetically
            setExercises(
              [...category.exercises].sort((a, b) =>
                a.title.localeCompare(b.title),
              ),
            );
          } else {
            // Fetch exercises from Firebase
            const { getExercisesByCategory } =
              await import('@/services/firebaseService');
            const categoryExercises = await getExercisesByCategory(category.id);
            // sort fetched exercises alphabetically by title
            setExercises(
              [...categoryExercises].sort((a, b) =>
                a.title.localeCompare(b.title),
              ),
            );
          }
        } catch (error) {
          console.error('Error loading exercises:', error);
          Alert.alert(
            'Error',
            'Failed to load exercises. Please check your connection and try again.',
          );
          setExercises([]);
        }
      }
    };

    loadExercises();
  }, [isExpanded, category.id, category.exercises, exercises.length]);

  useEffect(() => {
    const loadFiles = async () => {
      if (isExpanded) {
        try {
          const files = await getFilesByCategory(category.id);
          // sort alphabetically by file name
          setDownloadableFiles(
            [...files].sort((a, b) => a.name.localeCompare(b.name)),
          );
        } catch (error) {
          console.error('Error loading files:', error);
        }
      }
    };
    loadFiles();
  }, [isExpanded, category.id]);

  useEffect(() => {
    const loadUserProgress = async () => {
      if (isExpanded && user) {
        try {
          const progress = await getUserProgress(user.uid);
          const completed = new Set(
            progress.filter((p) => p.completed).map((p) => p.exerciseId),
          );
          setCompletedExerciseIds(completed);
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    };
    loadUserProgress();
  }, [isExpanded, user, refreshToken]);

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  const handleLevelTestPress = async () => {
    const preloaded = category.exercises ?? [];
    const ex =
      preloaded.find((e) => e.content?.type === 'level-test') ?? preloaded[0];
    if (ex) {
      router.push(`/exercise/${ex.id}`);
      return;
    }
    // Fallback fetch if exercises weren't pre-loaded
    try {
      const { getExercisesByCategory } =
        await import('@/services/firebaseService');
      const exs = await getExercisesByCategory(category.id);
      const fetched =
        exs.find((e) => e.content?.type === 'level-test') ?? exs[0];
      if (fetched) router.push(`/exercise/${fetched.id}`);
    } catch (e) {
      console.error('Error loading level test:', e);
    }
  };

  const handleDownloadFile = async (file: DownloadableFile) => {
    // Check platform - web doesn't support downloads
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Downloads are only available on mobile devices.',
      );
      return;
    }

    // Check premium access (admins bypass paywall)
    if (!canDownload) {
      setShowPremiumModal(true);
      return;
    }

    // Proceed with download
    try {
      await downloadFile(file);
    } catch (error) {
      console.error('Error downloading file:', error);
      Alert.alert('Error', 'Failed to download file');
    }
  };

  const heightStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 'auto' : 0, { duration: 300 }),
  }));

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 300 }),
  }));

  return (
    <ThemedView style={[styles.card, isLevelTest && styles.levelTestCard]}>
      <TouchableOpacity
        style={[styles.header, isLevelTest && styles.levelTestHeader]}
        onPress={
          isLevelTest ? handleLevelTestPress : () => setIsExpanded(!isExpanded)
        }
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <IconSymbol
            name={isLevelTest ? 'school' : (category.icon as any)}
            size={24}
            color={isLevelTest ? '#fff' : theme.accent.mid}
          />
          <View style={styles.titleContainer}>
            <View style={styles.levelTestTitleRow}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.title, isLevelTest && styles.levelTestTitle]}
              >
                {category.name}
              </ThemedText>
              {isLevelTest && (
                <View style={styles.levelTestBadge}>
                  <ThemedText style={styles.levelTestBadgeText}>
                    Free!
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText
              style={[
                styles.description,
                isLevelTest && styles.levelTestDescription,
              ]}
            >
              {category.description}
            </ThemedText>
          </View>
        </View>
        <IconSymbol
          name={
            isLevelTest
              ? 'chevron.right'
              : isExpanded
                ? 'chevron.up'
                : 'chevron.down'
          }
          size={20}
          color={isLevelTest ? 'rgba(255,255,255,0.8)' : theme.icons.tertiary}
        />
      </TouchableOpacity>

      {!isLevelTest && isExpanded && (
        <Animated.View
          style={opacityStyle}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Animated.View style={heightStyle}>
            <Collapsible collapsed={!isExpanded}>
              <View style={styles.exercisesList}>
                {exercises.map((exercise) => {
                  const isCompleted = completedExerciseIds.has(exercise.id);

                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseItem}
                      onPress={() => handleExercisePress(exercise)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.exerciseContent}>
                        <View style={styles.exerciseTitleRow}>
                          <ThemedText
                            type="defaultSemiBold"
                            style={styles.exerciseTitle}
                          >
                            {exercise.title}
                          </ThemedText>
                          {isCompleted && (
                            <IconSymbol
                              name="checkmark.circle.fill"
                              size={20}
                              color={theme.status.success}
                            />
                          )}
                        </View>
                        <ThemedText style={styles.exerciseDescription}>
                          {exercise.description}
                        </ThemedText>
                        <View style={styles.exerciseFooter}>
                          <Text
                            style={[
                              styles.difficulty,
                              styles[exercise.difficulty],
                            ]}
                          >
                            {exercise.difficulty}
                          </Text>
                          <Text style={styles.exerciseType}>
                            {exercise.content.type.replace('-', ' ')}
                          </Text>
                        </View>
                      </View>
                      <IconSymbol
                        name="chevron.right"
                        size={16}
                        color={theme.icons.tertiary}
                      />
                    </TouchableOpacity>
                  );
                })}

                {exercises.length === 0 && (
                  <ThemedText style={styles.noExercises}>
                    No exercises available yet
                  </ThemedText>
                )}
              </View>

              {downloadableFiles.length > 0 && (
                <View style={styles.filesSection}>
                  <TouchableOpacity
                    style={styles.filesSectionHeader}
                    onPress={() => setIsFilesExpanded(!isFilesExpanded)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.filesSectionTitle}>
                      Downloadable Files ({downloadableFiles.length})
                    </ThemedText>
                    <IconSymbol
                      name={isFilesExpanded ? 'chevron.up' : 'chevron.down'}
                      size={16}
                      color={theme.icons.tertiary}
                    />
                  </TouchableOpacity>
                  <Collapsible collapsed={!isFilesExpanded}>
                    <View style={styles.filesList}>
                      {downloadableFiles.map((file) => (
                        <TouchableOpacity
                          key={file.id}
                          style={styles.fileItem}
                          onPress={() => handleDownloadFile(file)}
                        >
                          <IconSymbol
                            name="doc.text"
                            size={16}
                            color={theme.accent.mid}
                          />
                          <ThemedText style={styles.fileItemText}>
                            {file.name}
                          </ThemedText>
                          {!canDownload && (
                            <IconSymbol
                              name="lock.fill"
                              size={14}
                              color={theme.status.warning}
                              style={styles.lockIcon}
                            />
                          )}
                          <IconSymbol
                            name="arrow.down.circle"
                            size={16}
                            color={theme.icons.tertiary}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Collapsible>
                </View>
              )}
            </Collapsible>
          </Animated.View>
        </Animated.View>
      )}

      <PremiumPurchaseModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchaseSuccess={() => {
          Alert.alert('Success', 'You can now download files!');
        }}
      />
    </ThemedView>
  );
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: theme.backgrounds.card,
      boxShadow: theme.shadow.level1,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    titleContainer: {
      marginLeft: 16,
      flex: 1,
    },
    title: {
      fontSize: 18,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: theme.text.secondary,
    },
    exercisesList: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.backgrounds.tinted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
      marginBottom: 10,
    },
    exerciseContent: {
      flex: 1,
    },
    exerciseTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
      marginRight: -16,
    },
    exerciseTitle: {
      fontSize: 16,
      flex: 1,
    },
    exerciseDescription: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },
    exerciseFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    difficulty: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      overflow: 'hidden',
      fontWeight: '500',
    },
    beginner: {
      backgroundColor: theme.difficulty.beginner.background,
      color: theme.difficulty.beginner.text,
    },
    intermediate: {
      backgroundColor: theme.difficulty.intermediate.background,
      color: theme.difficulty.intermediate.text,
    },
    advanced: {
      backgroundColor: theme.difficulty.advanced.background,
      color: theme.difficulty.advanced.text,
    },
    exerciseType: {
      fontSize: 12,
      color: theme.text.secondary,
      textTransform: 'capitalize',
    },
    noExercises: {
      textAlign: 'center',
      color: theme.text.secondary,
      fontStyle: 'italic',
      padding: 20,
    },
    filesSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.borders.divider,
      paddingHorizontal: 10,
    },
    filesSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.backgrounds.tintedStrong,
      borderRadius: 12,
      marginBottom: 12,
    },
    filesSectionTitle: {
      fontSize: 16,
      letterSpacing: 1,
      fontWeight: '500',
    },
    filesList: {
      paddingBottom: 4,
    },
    fileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.backgrounds.tinted,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
      marginBottom: 10,
    },
    fileItemText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
    },
    lockIcon: {
      marginRight: 8,
    },
    levelTestCard: {
      borderColor: LEVEL_COLOURS.B1,
      borderWidth: 2,
    },
    levelTestHeader: {
      backgroundColor: LEVEL_COLOURS.B1,
      borderRadius: 12,
      margin: 4,
    },
    levelTestTitle: {
      color: '#fff',
    },
    levelTestDescription: {
      color: 'rgba(255,255,255,0.8)',
    },
    levelTestTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    levelTestBadge: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
    },
    levelTestBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}
