import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Category, Exercise, Question } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddExerciseScreen() {
  const { id: exerciseId } = useLocalSearchParams();
  const isEditMode = !!exerciseId;

  const [exerciseData, setExerciseData] = useState({
    title: '',
    description: '',
    instructions: '',
    category: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    type: 'multiple-choice' as
      | 'multiple-choice'
      | 'fill-blanks'
      | 'true-false'
      | 'matching'
      | 'essay',
  });

  const [questions, setQuestions] = useState<Partial<Question>[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    if (isEditMode && typeof exerciseId === 'string') {
      loadExercise(exerciseId);
    }
  }, [exerciseId]);

  const loadCategories = async () => {
    try {
      const { getCategories } = await import('@/services/firebaseService');
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const loadExercise = async (id: string) => {
    try {
      setLoading(true);
      const { getExerciseById } = await import('@/services/firebaseService');
      const exercise = await getExerciseById(id);

      if (exercise) {
        setExerciseData({
          title: exercise.title,
          description: exercise.description,
          instructions: exercise.instructions,
          category: exercise.category,
          difficulty: exercise.difficulty,
          type: exercise.content.type,
        });
        setQuestions(exercise.content.questions);
      } else {
        Alert.alert('Error', 'Exercise not found');
        router.push('/admin/manage-exercises');
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
      Alert.alert('Error', 'Failed to load exercise');
      router.push('/admin/manage-exercises');
    } finally {
      setLoading(false);
    }
  };

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const exerciseTypes = [
    'multiple-choice',
    'fill-blanks',
    'true-false',
    'matching',
    'essay',
  ];

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === index) {
          if (field === 'options' && Array.isArray(q.options)) {
            // This shouldn't happen as options are handled separately
            return q;
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const validateExercise = (): boolean => {
    if (!exerciseData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise title.');
      return false;
    }

    if (!exerciseData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter an exercise description.');
      return false;
    }

    if (!exerciseData.instructions.trim()) {
      Alert.alert('Validation Error', 'Please enter exercise instructions.');
      return false;
    }

    if (!exerciseData.category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question?.trim()) {
        Alert.alert('Validation Error', `Please enter question ${i + 1}.`);
        return false;
      }

      if (exerciseData.type === 'multiple-choice') {
        if (!q.options || q.options.some((opt) => !opt.trim())) {
          Alert.alert(
            'Validation Error',
            `Please fill all options for question ${i + 1}.`
          );
          return false;
        }

        const correctAnswer = q.correctAnswer;
        if (
          !correctAnswer ||
          (typeof correctAnswer === 'string' && !correctAnswer.trim())
        ) {
          Alert.alert(
            'Validation Error',
            `Please select the correct answer for question ${i + 1}.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveExercise = async () => {
    if (!validateExercise()) return;

    try {
      const exerciseContent = {
        title: exerciseData.title,
        description: exerciseData.description,
        instructions: exerciseData.instructions,
        category: exerciseData.category,
        difficulty: exerciseData.difficulty,
        content: {
          type: exerciseData.type,
          questions: questions.map((q, index) => ({
            id: `q${index + 1}`,
            question: q.question!,
            options: q.options,
            correctAnswer: q.correctAnswer!,
            explanation: q.explanation,
          })),
        },
      };

      if (isEditMode && typeof exerciseId === 'string') {
        // Update existing exercise
        const { updateExercise } = await import('@/services/firebaseService');
        await updateExercise(exerciseId, exerciseContent);

        Alert.alert('Success', 'Exercise updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/admin/manage-exercises'),
          },
        ]);
      } else {
        // Create new exercise
        const { createExercise } = await import('@/services/firebaseService');
        await createExercise(exerciseContent);

        Alert.alert('Success', 'Exercise created successfully!', [
          {
            text: 'Create Another',
            onPress: () => {
              setExerciseData({
                title: '',
                description: '',
                instructions: '',
                category: '',
                difficulty: 'beginner',
                type: 'multiple-choice',
              });
              setQuestions([
                {
                  question: '',
                  options: ['', '', '', ''],
                  correctAnswer: '',
                  explanation: '',
                },
              ]);
            },
          },
          {
            text: 'Done',
            onPress: () => router.push('/admin'),
          },
        ]);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} exercise:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} exercise. Please try again.`);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0078ff" />
        <ThemedText style={styles.loadingText}>Loading exercise...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push(isEditMode ? '/admin/manage-exercises' : '/admin')}
        >
          <IconSymbol name='chevron.left' size={24} color='#0078ff' />
          <ThemedText style={styles.backText}>
            {isEditMode ? 'Back to Manage' : 'Back to Admin'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText type='title' style={styles.title}>
          {isEditMode ? 'Edit Exercise' : 'Add New Exercise'}
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText type='subtitle' style={styles.sectionTitle}>
              Basic Information
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Title</ThemedText>
              <TextInput
                style={styles.input}
                value={exerciseData.title}
                onChangeText={(text) =>
                  setExerciseData((prev) => ({ ...prev, title: text }))
                }
                placeholder='Enter exercise title'
                placeholderTextColor='rgba(102, 102, 102, 0.5)'
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={styles.input}
                value={exerciseData.description}
                onChangeText={(text) =>
                  setExerciseData((prev) => ({ ...prev, description: text }))
                }
                placeholder='Brief description of the exercise'
                placeholderTextColor='rgba(102, 102, 102, 0.5)'
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Instructions</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={exerciseData.instructions}
                onChangeText={(text) =>
                  setExerciseData((prev) => ({ ...prev, instructions: text }))
                }
                placeholder='Detailed instructions for students'
                multiline
                numberOfLines={4}
                placeholderTextColor='rgba(102, 102, 102, 0.5)'
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <ThemedText style={styles.label}>Category</ThemedText>
                <View style={styles.pickerContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.pickerOption,
                        exerciseData.category === category.id &&
                          styles.selectedOption,
                      ]}
                      onPress={() =>
                        setExerciseData((prev) => ({
                          ...prev,
                          category: category.id,
                        }))
                      }
                    >
                      <ThemedText
                        style={[
                          styles.pickerText,
                          exerciseData.category === category.id &&
                            styles.selectedText,
                        ]}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.halfInput}>
                <ThemedText style={styles.label}>Difficulty</ThemedText>
                <View style={styles.pickerContainer}>
                  {difficulties.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.pickerOption,
                        exerciseData.difficulty === difficulty &&
                          styles.selectedOption,
                      ]}
                      onPress={() =>
                        setExerciseData((prev) => ({
                          ...prev,
                          difficulty: difficulty as any,
                        }))
                      }
                    >
                      <ThemedText
                        style={[
                          styles.pickerText,
                          exerciseData.difficulty === difficulty &&
                            styles.selectedText,
                        ]}
                      >
                        {difficulty}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Questions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type='subtitle' style={styles.sectionTitle}>
                Questions
              </ThemedText>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddQuestion}
              >
                <IconSymbol name='plus' size={16} color='#fff' />
                <ThemedText style={styles.addButtonText}>
                  Add Question
                </ThemedText>
              </TouchableOpacity>
            </View>

            {questions.map((question, qIndex) => (
              <View key={qIndex} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>
                    Question {qIndex + 1}
                  </ThemedText>
                  {questions.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveQuestion(qIndex)}
                    >
                      <IconSymbol name='trash' size={16} color='#F44336' />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Question</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={question.question}
                    onChangeText={(text) =>
                      handleQuestionChange(qIndex, 'question', text)
                    }
                    placeholder='Enter the question'
                    placeholderTextColor='rgba(102, 102, 102, 0.5)'
                  />
                </View>

                {exerciseData.type === 'multiple-choice' &&
                  question.options && (
                    <>
                      <ThemedText style={styles.label}>Options</ThemedText>
                      {question.options.map((option, oIndex) => (
                        <View key={oIndex} style={styles.optionRow}>
                          <ThemedText style={styles.optionLabel}>
                            {String.fromCharCode(65 + oIndex)}.
                          </ThemedText>
                          <TextInput
                            style={[styles.input, styles.optionInput]}
                            value={option}
                            onChangeText={(text) =>
                              handleOptionChange(qIndex, oIndex, text)
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + oIndex
                            )}`}
                            placeholderTextColor='rgba(102, 102, 102, 0.5)'
                          />
                        </View>
                      ))}

                      <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>
                          Correct Answer
                        </ThemedText>
                        <View style={styles.pickerContainer}>
                          {question.options.map((option, oIndex) => (
                            <TouchableOpacity
                              key={oIndex}
                              style={[
                                styles.pickerOption,
                                question.correctAnswer === option &&
                                  styles.selectedOption,
                              ]}
                              onPress={() =>
                                handleQuestionChange(
                                  qIndex,
                                  'correctAnswer',
                                  option
                                )
                              }
                              disabled={!option.trim()}
                            >
                              <ThemedText
                                style={[
                                  styles.pickerText,
                                  question.correctAnswer === option &&
                                    styles.selectedText,
                                  !option.trim() && styles.disabledText,
                                ]}
                              >
                                {String.fromCharCode(65 + oIndex)}:{' '}
                                {option || 'Empty'}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </>
                  )}

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>
                    Explanation (Optional)
                  </ThemedText>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={question.explanation}
                    onChangeText={(text) =>
                      handleQuestionChange(qIndex, 'explanation', text)
                    }
                    placeholder='Explain why this is the correct answer'
                    multiline
                    numberOfLines={2}
                    placeholderTextColor='rgba(102, 102, 102, 0.5)'
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveExercise}
              disabled={loading}
            >
              <ThemedText style={styles.saveButtonText}>
                {loading ? 'Loading...' : isEditMode ? 'Update Exercise' : 'Save Exercise'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
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
  scrollContent: {
    flexGrow: 1,
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
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 12,
    borderRadius: 12,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,

    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    gap: 4,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  pickerText: {
    fontSize: 14,
  },
  selectedText: {
    color: '#0078ff',
  },
  disabledText: {
    color: '#ccc',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  questionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,

    color: '#0078ff',
  },
  removeButton: {
    padding: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,

    width: 24,
    color: '#444',
  },
  optionInput: {
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingBottom: 40,
    marginTop: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#0078ff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
