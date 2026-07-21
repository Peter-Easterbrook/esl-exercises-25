import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
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
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type Styles = ReturnType<typeof createStyles>;

export default function UploadFilesScreen() {
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<
    'beginner' | 'intermediate' | 'advanced' | ''
  >('');
  const [files, setFiles] = useState<DownloadableFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    getCategories()
      .then((categoriesData) => {
        if (!isCancelled) {
          setCategories(categoriesData);
        }
      })
      .catch((error) => {
        console.error('Error loading categories:', error);
        if (!isCancelled) {
          Alert.alert('Error', 'Failed to load categories');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchFiles = useCallback(async () => {
    return getFilesByCategory(selectedCategory);
  }, [selectedCategory]);

  const loadFiles = useCallback(async () => {
    try {
      const filesData = await fetchFiles();
      setFiles(filesData);
    } catch (error) {
      console.error('Error loading files:', error);
      Alert.alert('Error', 'Failed to load files');
    }
  }, [fetchFiles]);

  useEffect(() => {
    if (!selectedCategory) return;
    let isCancelled = false;

    fetchFiles()
      .then((filesData) => {
        if (!isCancelled) {
          setFiles(filesData);
        }
      })
      .catch((error) => {
        console.error('Error loading files:', error);
        if (!isCancelled) {
          Alert.alert('Error', 'Failed to load files');
        }
      });

    getExercisesByCategory(selectedCategory)
      .then((exercisesData) => {
        if (!isCancelled) {
          setExercises(exercisesData);
          setSelectedExercise('');
        }
      })
      .catch((error) => {
        console.error('Error loading exercises:', error);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, fetchFiles]);

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

      const maxSize = 10 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'File size must be less than 10MB');
        return;
      }

      setUploading(true);

      await uploadFile(
        file,
        selectedCategory,
        selectedExercise || null,
        user!.uid,
        selectedLevel || undefined,
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
      ],
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={theme.accent.mid} />
            <ThemedText style={styles.backText}>Back to Admin</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>
            Upload Files
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Selection */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Select Category
            </ThemedText>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  styles={styles}
                />
              ))}
            </View>
          </View>

          {/* Exercise Selection */}
          {!!selectedCategory && exercises.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Link to Exercise (Optional)
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.exerciseList}>
                  <ExerciseChip
                    label="None"
                    isSelected={!selectedExercise}
                    onPress={() => setSelectedExercise('')}
                    theme={theme}
                    styles={styles}
                  />
                  {exercises.map((exercise) => (
                    <ExerciseChip
                      key={exercise.id}
                      label={exercise.title}
                      difficulty={exercise.difficulty}
                      isSelected={selectedExercise === exercise.id}
                      onPress={() => setSelectedExercise(exercise.id)}
                      theme={theme}
                      styles={styles}
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

          {/* Level Selection */}
          {!!selectedCategory && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Select Level (Optional)
              </ThemedText>
              <View style={styles.levelList}>
                <LevelChip
                  label="None"
                  isSelected={!selectedLevel}
                  onPress={() => setSelectedLevel('')}
                  theme={theme}
                  styles={styles}
                />
                <LevelChip
                  label="Beginner"
                  level="beginner"
                  isSelected={selectedLevel === 'beginner'}
                  onPress={() => setSelectedLevel('beginner')}
                  theme={theme}
                  styles={styles}
                />
                <LevelChip
                  label="Intermediate"
                  level="intermediate"
                  isSelected={selectedLevel === 'intermediate'}
                  onPress={() => setSelectedLevel('intermediate')}
                  theme={theme}
                  styles={styles}
                />
                <LevelChip
                  label="Advanced"
                  level="advanced"
                  isSelected={selectedLevel === 'advanced'}
                  onPress={() => setSelectedLevel('advanced')}
                  theme={theme}
                  styles={styles}
                />
              </View>
              <ThemedText style={styles.helpText}>
                {selectedLevel
                  ? `File will be marked for ${selectedLevel} level exercises`
                  : 'File will be available for all difficulty levels'}
              </ThemedText>
            </View>
          )}

          {/* Upload Button */}
          {!!selectedCategory && (
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.uploadingButton,
                ]}
                onPress={handlePickDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.uploadButtonContent}>
                    <IconSymbol name="doc.badge.plus" size={24} color="#fff" />
                    <ThemedText style={styles.uploadButtonText}>
                      Upload Document
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              <ThemedText style={styles.helpText}>
                Supported formats: PDF, DOC, DOCX (max 10MB)
              </ThemedText>
            </View>
          )}

          {/* Files List */}
          {!!selectedCategory && files.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Uploaded Files
              </ThemedText>
              {files.map((file) => (
                <View key={file.id} style={styles.fileCard}>
                  <View style={styles.fileIcon}>
                    <Ionicons name="document-text" size={28} color={theme.accent.mid} />
                  </View>
                  <View style={styles.fileInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.fileName}>
                      {file.name}
                    </ThemedText>
                    <ThemedText style={styles.fileDetails}>
                      {formatFileSize(file.size)} •{' '}
                      {file.fileType.toUpperCase()}
                    </ThemedText>
                    {file.exerciseId && (
                      <ThemedText style={styles.linkedExercise}>
                        📎 Linked to exercise
                      </ThemedText>
                    )}
                    {file.level && (
                      <View style={styles.levelBadge}>
                        <ThemedText style={styles.levelBadgeText}>
                          {file.level === 'beginner' && '🟢 Beginner'}
                          {file.level === 'intermediate' && '🟠 Intermediate'}
                          {file.level === 'advanced' && '🔴 Advanced'}
                        </ThemedText>
                      </View>
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
                    <IconSymbol name="trash" size={20} color={theme.status.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

function CategoryButton({
  category,
  isSelected,
  onPress,
  styles,
}: {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
  styles: Styles;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

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

function ExerciseChip({
  label,
  difficulty,
  isSelected,
  onPress,
  theme,
  styles,
}: {
  label: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isSelected: boolean;
  onPress: () => void;
  theme: AppTheme;
  styles: Styles;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

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

  const getDifficultyColor = () => {
    if (!difficulty) return null;
    return theme.difficulty[difficulty].text;
  };

  const difficultyColor = getDifficultyColor();

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
        <View style={styles.exerciseChipContent}>
          {difficultyColor && (
            <View
              style={[
                styles.difficultyIndicator,
                { backgroundColor: difficultyColor },
              ]}
            />
          )}
          <ThemedText
            style={[
              styles.exerciseChipText,
              isSelected && styles.selectedExerciseChipText,
            ]}
          >
            {label}
          </ThemedText>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function LevelChip({
  label,
  level,
  isSelected,
  onPress,
  theme,
  styles,
}: {
  label: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  isSelected: boolean;
  onPress: () => void;
  theme: AppTheme;
  styles: Styles;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

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

  const getLevelColors = () => {
    if (!level) {
      return {
        background: theme.backgrounds.subtle,
        border: theme.borders.divider,
        text: theme.text.secondary,
        selectedBg: theme.accent.mid,
        selectedBorder: theme.accent.mid,
        selectedText: '#fff',
      };
    }

    const diff = theme.difficulty[level];

    return {
      background: diff.background,
      border: diff.text,
      text: diff.text,
      selectedBg: diff.text,
      selectedBorder: diff.text,
      selectedText: '#fff',
    };
  };

  const c = getLevelColors();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.1)',
        foreground: true,
      }}
    >
      <Animated.View
        style={[
          styles.levelChip,
          {
            backgroundColor: isSelected ? c.selectedBg : c.background,
            borderColor: isSelected ? c.selectedBorder : c.border,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ThemedText
          style={[
            styles.levelChipText,
            {
              color: isSelected ? c.selectedText : c.text,
            },
          ]}
        >
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgrounds.card,
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
      backgroundColor: theme.backgrounds.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    backText: {
      marginLeft: 8,
      color: theme.accent.mid,
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
      backgroundColor: theme.backgrounds.card,
      marginBottom: 20,
      borderRadius: 12,
      padding: 12,
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
      backgroundColor: theme.backgrounds.tintedStrong,
      borderWidth: 0.5,
      borderColor: theme.borders.light,
      boxShadow: theme.shadow.level1,
    },
    selectedCategory: {
      backgroundColor: theme.backgrounds.progressCircle,
      borderColor: theme.accent.mid,
      boxShadow: theme.shadow.level2,
    },
    categoryText: {
      fontSize: 14,
      color: theme.accent.mid,
    },
    selectedCategoryText: {
      color: theme.accent.mid,
      fontWeight: '500',
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.status.success,
      paddingVertical: 16,
      borderRadius: 8,
      gap: 8,
      boxShadow: theme.shadow.level1,
    },
    uploadButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
      color: theme.text.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    fileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.backgrounds.subtle,
      borderRadius: 8,
      marginBottom: 12,
    },
    fileIcon: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: theme.backgrounds.tintedStrong,
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
      color: theme.text.secondary,
      marginBottom: 2,
    },
    fileDate: {
      fontSize: 12,
      color: theme.icons.placeholder,
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
      backgroundColor: theme.backgrounds.subtle,
      borderWidth: 0.5,
      borderColor: theme.borders.divider,
    },
    selectedExerciseChip: {
      backgroundColor: theme.status.success,
      borderColor: theme.status.success,
      boxShadow: theme.shadow.level1,
    },
    pressedChip: {
      opacity: 0.7,
    },
    exerciseChipContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    difficultyIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    exerciseChipText: {
      fontSize: 12,
      color: theme.text.secondary,
    },
    selectedExerciseChipText: {
      color: '#fff',
    },
    linkedExercise: {
      fontSize: 11,
      color: theme.status.success,
      marginTop: 2,
    },
    levelBadge: {
      marginTop: 4,
      alignSelf: 'flex-start',
    },
    levelBadgeText: {
      fontSize: 11,
      fontWeight: '500',
    },
    levelList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      paddingVertical: 4,
    },
    levelChip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      boxShadow: theme.shadow.level1,
    },
    levelChipText: {
      fontSize: 13,
      fontWeight: '500',
    },
  });
}
