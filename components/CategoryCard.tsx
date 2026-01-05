import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors as themeColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { downloadFile, getFilesByCategory } from '@/services/fileService';
import { getUserProgress } from '@/services/firebaseService';
import { Category, DownloadableFile, Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFilesExpanded, setIsFilesExpanded] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [downloadableFiles, setDownloadableFiles] = useState<
    DownloadableFile[]
  >([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadExercises = async () => {
      if (isExpanded && exercises.length === 0) {
        try {
          // First check if category already has exercises loaded
          if (category.exercises && category.exercises.length > 0) {
            // ensure exercises are shown alphabetically
            setExercises(
              [...category.exercises].sort((a, b) =>
                a.title.localeCompare(b.title)
              )
            );
          } else {
            // Fetch exercises from Firebase
            const { getExercisesByCategory } = await import(
              '@/services/firebaseService'
            );
            const categoryExercises = await getExercisesByCategory(category.id);
            // sort fetched exercises alphabetically by title
            setExercises(
              [...categoryExercises].sort((a, b) => a.title.localeCompare(b.title))
            );
          }
        } catch (error) {
          console.error('Error loading exercises:', error);
          Alert.alert(
            'Error',
            'Failed to load exercises. Please check your connection and try again.'
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
          setDownloadableFiles([...files].sort((a, b) => a.name.localeCompare(b.name)));
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
            progress.filter((p) => p.completed).map((p) => p.exerciseId)
          );
          setCompletedExerciseIds(completed);
        } catch (error) {
          console.error('Error loading user progress:', error);
        }
      }
    };
    loadUserProgress();
  }, [isExpanded, user]);

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  const handleDownloadFile = async (file: DownloadableFile) => {
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
    <ThemedView style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <IconSymbol name={category.icon as any} size={24} color='#6996b3' />
          <View style={styles.titleContainer}>
            <ThemedText type='defaultSemiBold' style={styles.title}>
              {category.name}
            </ThemedText>
            <ThemedText style={styles.description}>
              {category.description}
            </ThemedText>
          </View>
        </View>
        <IconSymbol
          name={isExpanded ? 'chevron.up' : 'chevron.down'}
          size={20}
          color='#464655'
        />
      </TouchableOpacity>

      {isExpanded && (
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
                            type='defaultSemiBold'
                            style={styles.exerciseTitle}
                          >
                            {exercise.title}
                          </ThemedText>
                          {isCompleted && (
                            <IconSymbol
                              name='checkmark.circle.fill'
                              size={20}
                              color={themeColors.success}
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
                        name='chevron.right'
                        size={16}
                        color='#464655'
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
                      color='#464655'
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
                          <IconSymbol name='doc.text' size={16} color='#6996b3' />
                          <ThemedText style={styles.fileItemText}>
                            {file.name}
                          </ThemedText>
                          <IconSymbol
                            name='arrow.down.circle'
                            size={16}
                            color='#464655'
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
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    boxShadow: '0px 1px 3px rgba(0, 76, 109, 0.08), 0px 4px 12px rgba(0, 76, 109, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(105, 150, 179, 0.08)',
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
    color: '#444',
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
    backgroundColor: 'rgba(105, 150, 179, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(105, 150, 179, 0.08)',
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
    // gap: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    flex: 1,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#444',
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
    backgroundColor: '#e8f5e8',
    color: themeColors.beginner,
  },
  intermediate: {
    backgroundColor: '#fff8dc',
    color: themeColors.intermediate,
  },
  advanced: {
    backgroundColor: '#f9dfd8',
    color: themeColors.advanced,
  },
  exerciseType: {
    fontSize: 12,
    color: '#444',
    textTransform: 'capitalize',
  },
  noExercises: {
    textAlign: 'center',
    color: '#444',
    fontStyle: 'italic',
    padding: 20,
  },
  filesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 10,
  },
  filesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(105, 150, 179, 0.05)',
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
    backgroundColor: 'rgba(105, 150, 179, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(105, 150, 179, 0.08)',
    marginBottom: 10,
  },
  fileItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
});
