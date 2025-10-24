import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteFile,
  getFilesByCategory,
  uploadFile,
} from '@/services/fileService';
import {
  getCategories,
  getExercisesByCategory,
} from '@/services/firebaseService';
import { Category, DownloadableFile, Exercise } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

export default function UploadFilesScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadFiles();
      loadExercises();
    }
  }, [selectedCategory]);

  const loadExercises = async () => {
    try {
      const exercisesData = await getExercisesByCategory(selectedCategory);
      setExercises(exercisesData);
      setSelectedExercise(''); // Reset exercise selection
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      const filesData = await getFilesByCategory(selectedCategory);
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Error', 'Failed to load files');
    }
  };

  const handlePickDocument = async () => {
    try {
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a category first');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      setUploading(true);

      await uploadFile(
        file,
        selectedCategory,
        selectedExercise || null,
        user!.uid
      );

      Alert.alert('Success', 'File uploaded successfully');
      await loadFiles();
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (file: DownloadableFile) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFile(file.id, file.fileUrl);
              Alert.alert('Success', 'File deleted successfully');
              await loadFiles();
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin')}
        >
          <IconSymbol name='chevron.left' size={24} color='#0078ff' />
          <ThemedText style={styles.backText}>Back to Admin</ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          Upload Files
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>
            Select Category
          </ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </View>
        </View>

        {/* Exercise Selection */}
        {selectedCategory && exercises.length > 0 && (
          <View style={styles.section}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Link to Exercise (Optional)
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.exerciseList}>
                <ExerciseChip
                  label='None'
                  isSelected={!selectedExercise}
                  onPress={() => setSelectedExercise('')}
                />
                {exercises.map((exercise) => (
                  <ExerciseChip
                    key={exercise.id}
                    label={exercise.title}
                    isSelected={selectedExercise === exercise.id}
                    onPress={() => setSelectedExercise(exercise.id)}
                  />
                ))}
              </View>
            </ScrollView>
            <ThemedText style={styles.helpText}>
              {selectedExercise
                ? 'File will be linked to selected exercise'
                : 'File will be available for all exercises in category'}
            </ThemedText>
          </View>
        )}

        {/* Upload Button */}
        {selectedCategory && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadingButton]}
              onPress={handlePickDocument}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <IconSymbol name='doc.badge.plus' size={24} color='#fff' />
                  <ThemedText style={styles.uploadButtonText}>
                    Upload Document
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
            <ThemedText style={styles.helpText}>
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </ThemedText>
          </View>
        )}

        {/* Files List */}
        {selectedCategory && files.length > 0 && (
          <View style={styles.section}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Uploaded Files
            </ThemedText>
            {files.map((file) => (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileIcon}>
                  <IconSymbol
                    name={
                      file.fileType.toLowerCase() === 'pdf'
                        ? 'doc.text.fill'
                        : 'doc.fill'
                    }
                    size={28}
                    color='#0078ff'
                  />
                </View>
                <View style={styles.fileInfo}>
                  <ThemedText type='defaultSemiBold' style={styles.fileName}>
                    {file.name}
                  </ThemedText>
                  <ThemedText style={styles.fileDetails}>
                    {formatFileSize(file.size)} • {file.fileType.toUpperCase()}
                  </ThemedText>
                  {file.exerciseId && (
                    <ThemedText style={styles.linkedExercise}>
                      📎 Linked to exercise
                    </ThemedText>
                  )}
                  <ThemedText style={styles.fileDate}>
                    {file.uploadedAt.toLocaleDateString()}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFile(file)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name='trash' size={20} color='#F44336' />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// Category Button Component with Animation
function CategoryButton({
  category,
  isSelected,
  onPress,
}: {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{
        color: 'rgba(0, 120, 255, 0.2)',
        foreground: true,
      }}
    >
      <Animated.View
        style={[
          styles.categoryButton,
          isSelected && styles.selectedCategory,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <ThemedText
          style={[
            styles.categoryText,
            isSelected && styles.selectedCategoryText,
          ]}
        >
          {category.name}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

// Exercise Chip Component with Animation
function ExerciseChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{
        color: 'rgba(76, 175, 80, 0.3)',
        foreground: true,
      }}
    >
      <Animated.View
        style={[
          styles.exerciseChip,
          isSelected && styles.selectedExerciseChip,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <ThemedText
          style={[
            styles.exerciseChipText,
            isSelected && styles.selectedExerciseChipText,
          ]}
        >
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#0078ff',
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e8f4fd',
    borderWidth: 0.5,
    borderColor: '#d0e8f7',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  selectedCategory: {
    backgroundColor: '#e3f2fd',
    borderColor: '#0078ff',
    boxShadow: '0px 2px 6px rgba(0, 120, 255, 0.3)',
  },
  categoryText: {
    fontSize: 14,
    color: '#0078ff',
  },
  selectedCategoryText: {
    color: '#0078ff',
    fontWeight: '600',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  uploadingButton: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginTop: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  exerciseList: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  exerciseChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  selectedExerciseChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  pressedChip: {
    opacity: 0.7,
  },
  exerciseChipText: {
    fontSize: 12,
    color: '#444',
  },
  selectedExerciseChipText: {
    color: '#fff',
  },
  linkedExercise: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 2,
  },
});
