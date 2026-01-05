import { ThemedLoader } from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors as themeColors } from '@/constants/theme';
import { Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ManageExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadExercises();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { getCategories } = await import('@/services/firebaseService');
      const categories = await getCategories();
      const map: Record<string, string> = {};
      categories.forEach((cat) => {
        map[cat.id] = cat.name;
      });
      setCategoryMap(map);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const { getAllExercises } = await import('@/services/firebaseService');
      const allExercises = await getAllExercises();
      setExercises(allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exercise.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteExercise } = await import(
                '@/services/firebaseService'
              );
              await deleteExercise(exercise.id);
              Alert.alert('Success', 'Exercise deleted successfully');
              loadExercises(); // Reload the list
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise');
            }
          },
        },
      ]
    );
  };

  const handleEditExercise = (exercise: Exercise) => {
    router.push(`/admin/add-exercise?id=${exercise.id}`);
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string): string => {
    return categoryMap[categoryId] || categoryId;
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
            onPress={() => router.back()}
          >
            <IconSymbol name='chevron.left' size={24} color='#6996b3' />
            <ThemedText style={styles.backText}>Back to Admin</ThemedText>
          </TouchableOpacity>

          <ThemedText type='title' style={styles.title}>
            Manage Exercises
          </ThemedText>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <IconSymbol name='magnifyingglass' size={20} color='#464655' />
            <TextInput
              style={styles.searchInput}
              placeholder='Search exercises...'
              placeholderTextColor='rgba(102, 102, 102, 0.5)'
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Add New Exercise Button */}
          <Pressable
            onPress={() => router.push('/admin/add-exercise')}
            android_ripple={{
              color: 'rgba(149, 194, 151, 0.3)',
              foreground: true,
            }}
            style={styles.addButton}
          >
            <IconSymbol name='plus.circle.fill' size={24} color='#fff' />
            <ThemedText style={styles.addButtonText}>
              Add New Exercise
            </ThemedText>
          </Pressable>

          {/* Exercise List */}
          <ScrollView
            style={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          >
            {filteredExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <IconSymbol name='doc.text' size={48} color='#ccc' />
                <ThemedText style={styles.emptyText}>
                  {searchQuery
                    ? 'No exercises match your search'
                    : 'No exercises found'}
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {!searchQuery && 'Start by adding your first exercise'}
                </ThemedText>
              </View>
            ) : (
              filteredExercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <View style={styles.exerciseInfo}>
                    <ThemedText style={styles.exerciseTitle}>
                      {exercise.title}
                    </ThemedText>
                    <ThemedText style={styles.exerciseDescription}>
                      {exercise.description}
                    </ThemedText>

                    <View style={styles.exerciseMetadata}>
                      <View style={styles.metadataItem}>
                        <IconSymbol name='folder' size={14} color='#464655' />
                        <ThemedText style={styles.metadataText}>
                          {getCategoryName(exercise.category)}
                        </ThemedText>
                      </View>

                      <View style={styles.metadataItem}>
                        <IconSymbol
                          name='chart.bar'
                          size={14}
                          color='#464655'
                        />
                        <ThemedText
                          style={[
                            styles.metadataText,
                            styles[exercise.difficulty],
                          ]}
                        >
                          {exercise.difficulty}
                        </ThemedText>
                      </View>

                      <View style={styles.metadataItem}>
                        <IconSymbol
                          name='questionmark.circle'
                          size={14}
                          color='#464655'
                        />
                        <ThemedText style={styles.metadataText}>
                          {exercise.content.questions.length} questions
                        </ThemedText>
                      </View>

                      <View style={styles.metadataItem}>
                        <IconSymbol name='doc.text' size={14} color='#464655' />
                        <ThemedText style={styles.metadataText}>
                          {exercise.id}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditExercise(exercise)}
                    >
                      <IconSymbol name='pencil' size={16} color='#6996b3' />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteExercise(exercise)}
                    >
                      <IconSymbol name='trash' size={16} color={themeColors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    outlineWidth: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.success,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  exerciseList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,

    color: '#444',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseTitle: {
    fontSize: 16,

    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  exerciseMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#444',
  },
  beginner: {
    color: themeColors.beginner,
  },
  intermediate: {
    color: themeColors.intermediate,
  },
  advanced: {
    color: themeColors.advanced,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e3f2fd',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
});
