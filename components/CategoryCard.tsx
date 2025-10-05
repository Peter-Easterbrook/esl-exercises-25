import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { downloadFile, getFilesByCategory } from '@/services/fileService';
import { Category, DownloadableFile, Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [downloadableFiles, setDownloadableFiles] = useState<
    DownloadableFile[]
  >([]);

  useEffect(() => {
    const loadExercises = async () => {
      if (isExpanded && exercises.length === 0) {
        try {
          // First check if category already has exercises loaded
          if (category.exercises && category.exercises.length > 0) {
            setExercises(category.exercises);
          } else {
            // Fetch exercises from Firebase
            const { getExercisesByCategory } = await import(
              '@/services/firebaseService'
            );
            const categoryExercises = await getExercisesByCategory(category.id);
            setExercises(categoryExercises);
          }
        } catch (error) {
          console.error('Error loading exercises:', error);
          // Fallback to mock data
          const mockExercises: Exercise[] = [
            {
              id: `${category.id}-1`,
              title: 'Sample Exercise',
              description: 'A sample exercise for this category',
              instructions: 'Complete this sample exercise.',
              content: {
                type: 'multiple-choice',
                questions: [
                  {
                    id: '1',
                    question: 'This is a sample question.',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 'Option A',
                    explanation: 'This is the correct answer.',
                  },
                ],
              },
              category: category.id,
              difficulty: 'beginner',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setExercises(mockExercises);
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
          setDownloadableFiles(files);
        } catch (error) {
          console.error('Error loading files:', error);
        }
      }
    };
    loadFiles();
  }, [isExpanded, category.id]);

  const handleExercisePress = (exercise: Exercise) => {
    router.push(`/exercise/${exercise.id}`);
  };

  const handleDownloadFile = async (file: DownloadableFile) => {
    try {
      await downloadFile(file);
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    }
  };

  return (
    <ThemedView style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <IconSymbol name={category.icon as any} size={24} color='#2196F3' />
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
          color='#666'
        />
      </TouchableOpacity>

      <Collapsible collapsed={!isExpanded}>
        <View style={styles.exercisesList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseItem}
              onPress={() => handleExercisePress(exercise)}
              activeOpacity={0.7}
            >
              <View style={styles.exerciseContent}>
                <ThemedText type='defaultSemiBold' style={styles.exerciseTitle}>
                  {exercise.title}
                </ThemedText>
                <ThemedText style={styles.exerciseDescription}>
                  {exercise.description}
                </ThemedText>
                <View style={styles.exerciseFooter}>
                  <Text
                    style={[styles.difficulty, styles[exercise.difficulty]]}
                  >
                    {exercise.difficulty}
                  </Text>
                  <Text style={styles.exerciseType}>
                    {exercise.content.type.replace('-', ' ')}
                  </Text>
                </View>
              </View>
              <IconSymbol name='chevron.right' size={16} color='#666' />
            </TouchableOpacity>
          ))}

          {exercises.length === 0 && (
            <ThemedText style={styles.noExercises}>
              No exercises available yet
            </ThemedText>
          )}
        </View>

        {downloadableFiles.length > 0 && (
          <View style={styles.filesSection}>
            <ThemedText style={styles.filesSectionTitle}>
              Downloadable Files
            </ThemedText>
            {downloadableFiles.map((file) => (
              <TouchableOpacity
                key={file.id}
                style={styles.fileItem}
                onPress={() => handleDownloadFile(file)}
              >
                <IconSymbol name='doc.text' size={16} color='#2196F3' />
                <ThemedText style={styles.fileItemText}>{file.name}</ThemedText>
                <IconSymbol name='arrow.down.circle' size={16} color='#666' />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Collapsible>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#666',
  },
  exercisesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '600',
  },
  beginner: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d2e',
  },
  intermediate: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  advanced: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  exerciseType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  noExercises: {
    textAlign: 'center',
    color: '#666',
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
  filesSectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'normal',
    paddingLeft: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
    marginBottom: 8,
  },
  fileItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
});
