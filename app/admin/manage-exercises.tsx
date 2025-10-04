import { ThemedLoader } from '@/components/themed-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      // This would normally fetch all exercises from Firebase
      // For now, we'll show a placeholder
      setExercises([]);
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
    Alert.alert(
      'Coming Soon',
      'Exercise editing will be available in a future update.'
    );
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <ThemedLoader />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin')}
        >
          <IconSymbol name='chevron.left' size={24} color='#2196F3' />
          <ThemedText style={styles.backText}>Back to Admin</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          Manage Exercises
        </ThemedText>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <IconSymbol name='magnifyingglass' size={20} color='#666' />
          <TextInput
            style={styles.searchInput}
            placeholder='Search exercises...'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add New Exercise Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/add-exercise')}
        >
          <IconSymbol name='plus.circle.fill' size={24} color='#fff' />
          <ThemedText style={styles.addButtonText}>Add New Exercise</ThemedText>
        </TouchableOpacity>

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
                      <IconSymbol name='folder' size={14} color='#666' />
                      <ThemedText style={styles.metadataText}>
                        {exercise.category}
                      </ThemedText>
                    </View>

                    <View style={styles.metadataItem}>
                      <IconSymbol name='chart.bar' size={14} color='#666' />
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
                        color='#666'
                      />
                      <ThemedText style={styles.metadataText}>
                        {exercise.content.questions.length} questions
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditExercise(exercise)}
                  >
                    <IconSymbol name='pencil' size={16} color='#2196F3' />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteExercise(exercise)}
                  >
                    <IconSymbol name='trash' size={16} color='#F44336' />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '600',
    color: '#666',
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
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
  },
  beginner: {
    color: '#4CAF50',
  },
  intermediate: {
    color: '#FF9800',
  },
  advanced: {
    color: '#F44336',
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
