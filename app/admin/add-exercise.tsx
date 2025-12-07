import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { Category, Question, MultiLanguageInstructions } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SUPPORTED_LANGUAGES, LANGUAGE_ORDER } from '@/constants/languages';
import { createEmptyInstructions, isMultiLanguageInstructions } from '@/utils/languageHelpers';

export default function AddExerciseScreen() {
  const { id: exerciseId } = useLocalSearchParams();
  const isEditMode = !!exerciseId;
  const { appUser, user } = useAuth();

  const [exerciseData, setExerciseData] = useState<{
    title: string;
    description: string;
    instructions: MultiLanguageInstructions;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    type: 'multiple-choice' | 'fill-blanks' | 'true-false' | 'matching' | 'essay';
  }>({
    title: '',
    description: '',
    instructions: createEmptyInstructions(),
    category: '',
    difficulty: 'beginner',
    type: 'multiple-choice',
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
  }, [exerciseId,isEditMode]);

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
        // Convert old string format to new multi-language format if needed
        let instructions: MultiLanguageInstructions;
        if (typeof exercise.instructions === 'string') {
          // Legacy format - put in English field, leave others empty
          instructions = {
            en: exercise.instructions,
            es: '',
            fr: '',
            de: '',
          };
        } else {
          // Already in multi-language format
          instructions = exercise.instructions;
        }

        setExerciseData({
          title: exercise.title,
          description: exercise.description,
          instructions: instructions,
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
    let newQuestion: Partial<Question>;

    switch (exerciseData.type) {
      case 'multiple-choice':
        newQuestion = {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          explanation: '',
        };
        break;
      case 'true-false':
        newQuestion = {
          question: '', // This will be the statement
          passageText: '', // Reading passage (only for first question)
          options: ['True', 'False'],
          correctAnswer: '',
          explanation: '',
        };
        break;
      case 'matching':
        newQuestion = {
          question: 'Match the items from Column A with Column B',
          leftColumn: ['', '', '', '', '', ''], // Column A (numbered)
          options: ['', '', '', '', '', ''], // Column B (lettered)
          correctAnswer: ['', '', '', '', '', ''], // Array of letters matching each number
          explanation: '',
        };
        break;
      case 'fill-blanks':
        newQuestion = {
          question: '', // Sentence with ____ for blanks
          options: [], // Optional word bank
          correctAnswer: [''], // Array of correct words for each blank
          explanation: '',
        };
        break;
      case 'essay':
        newQuestion = {
          question: '',
          correctAnswer: '', // Not strictly applicable for essays
          explanation: 'Essay questions are graded manually',
        };
        break;
      default:
        newQuestion = {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          explanation: '',
        };
    }

    setQuestions((prev) => [...prev, newQuestion]);
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

  const handleLeftColumnChange = (
    questionIndex: number,
    itemIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && q.leftColumn) {
          const newLeftColumn = [...q.leftColumn];
          newLeftColumn[itemIndex] = value;
          return { ...q, leftColumn: newLeftColumn };
        }
        return q;
      })
    );
  };

  const handleCorrectAnswerArrayChange = (
    questionIndex: number,
    itemIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && Array.isArray(q.correctAnswer)) {
          const newCorrectAnswer = [...q.correctAnswer];
          newCorrectAnswer[itemIndex] = value;
          return { ...q, correctAnswer: newCorrectAnswer };
        }
        return q;
      })
    );
  };

  const handlePassageTextChange = (questionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex) {
          return { ...q, passageText: value };
        }
        return q;
      })
    );
  };

  const validateExercise = (): boolean => {
    console.log('🔍 Starting validation...');

    if (!exerciseData.title.trim()) {
      console.log('❌ Validation failed: No title');
      Alert.alert('Validation Error', 'Please enter an exercise title.');
      return false;
    }

    if (!exerciseData.description.trim()) {
      console.log('❌ Validation failed: No description');
      Alert.alert('Validation Error', 'Please enter an exercise description.');
      return false;
    }

    // Validate instructions - at least English must be provided
    if (!exerciseData.instructions.en.trim()) {
      console.log('❌ Validation failed: No English instructions');
      Alert.alert('Validation Error', 'Please enter instructions in English (required).');
      return false;
    }

    // Optionally warn about missing translations
    const missingLanguages = LANGUAGE_ORDER.filter(
      (lang) => lang !== 'en' && !exerciseData.instructions[lang].trim()
    );

    if (missingLanguages.length > 0) {
      const langNames = missingLanguages
        .map((code) => SUPPORTED_LANGUAGES[code].name)
        .join(', ');
      console.log(`⚠️ Warning: Missing translations for ${langNames}`);
      // Optional: Show warning but allow saving
    }

    if (!exerciseData.category) {
      console.log('❌ Validation failed: No category selected');
      Alert.alert('Validation Error', 'Please select a category.');
      return false;
    }

    console.log(`📝 Validating ${questions.length} questions...`);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`   Checking question ${i + 1}:`, q);

      // For true-false, check passage text on first question
      if (exerciseData.type === 'true-false' && i === 0) {
        if (!q.passageText?.trim()) {
          console.log(
            `❌ Validation failed: No passage text for true/false question`
          );
          Alert.alert(
            'Validation Error',
            'Please enter the reading passage for true/false questions.'
          );
          return false;
        }
      }

      if (!q.question?.trim()) {
        console.log(
          `❌ Validation failed: No question text for question ${i + 1}`
        );
        Alert.alert(
          'Validation Error',
          `Please enter ${
            exerciseData.type === 'true-false' ? 'statement' : 'question'
          } ${i + 1}.`
        );
        return false;
      }

      // Validate based on question type
      console.log(`   Question type: ${exerciseData.type}`);
      switch (exerciseData.type) {
        case 'multiple-choice':
          console.log('   Checking multiple-choice options:', q.options);
          if (!q.options || q.options.some((opt) => !opt.trim())) {
            console.log(
              `❌ Validation failed: Empty options in question ${i + 1}`
            );
            Alert.alert(
              'Validation Error',
              `Please fill all options for question ${i + 1}.`
            );
            return false;
          }

          const correctAnswer = q.correctAnswer;
          console.log('   Checking correct answer:', correctAnswer);
          if (
            !correctAnswer ||
            (typeof correctAnswer === 'string' && !correctAnswer.trim())
          ) {
            console.log(
              `❌ Validation failed: No correct answer for question ${i + 1}`
            );
            Alert.alert(
              'Validation Error',
              `Please select the correct answer for question ${i + 1}.`
            );
            return false;
          }
          break;

        case 'true-false':
          console.log(
            '   Checking true/false correct answer:',
            q.correctAnswer
          );
          if (
            !q.correctAnswer ||
            (typeof q.correctAnswer === 'string' && !q.correctAnswer.trim())
          ) {
            console.log(
              `❌ Validation failed: No True/False answer for question ${i + 1}`
            );
            Alert.alert(
              'Validation Error',
              `Please select True or False for statement ${i + 1}.`
            );
            return false;
          }
          break;

        case 'matching':
          console.log('   Checking matching left column:', q.leftColumn);
          if (!q.leftColumn || q.leftColumn.some((item) => !item.trim())) {
            console.log(
              `❌ Validation failed: Empty items in Column A for question ${
                i + 1
              }`
            );
            Alert.alert(
              'Validation Error',
              `Please fill all items in Column A for question ${i + 1}.`
            );
            return false;
          }

          console.log('   Checking matching right column:', q.options);
          if (!q.options || q.options.some((item) => !item.trim())) {
            console.log(
              `❌ Validation failed: Empty items in Column B for question ${
                i + 1
              }`
            );
            Alert.alert(
              'Validation Error',
              `Please fill all items in Column B for question ${i + 1}.`
            );
            return false;
          }

          console.log('   Checking matching correct answers:', q.correctAnswer);
          if (
            !Array.isArray(q.correctAnswer) ||
            q.correctAnswer.some(
              (ans) => !ans || (typeof ans === 'string' && !ans.trim())
            )
          ) {
            console.log(
              `❌ Validation failed: Incomplete matches for question ${i + 1}`
            );
            console.log('   correctAnswer array:', q.correctAnswer);
            Alert.alert(
              'Validation Error',
              `Please provide correct matches for all items in question ${
                i + 1
              }.`
            );
            return false;
          }
          break;

        case 'fill-blanks':
          console.log(
            '   Checking fill-blanks correct answer:',
            q.correctAnswer
          );
          if (
            !q.correctAnswer ||
            (Array.isArray(q.correctAnswer) &&
              q.correctAnswer.every((ans) => !ans)) ||
            (typeof q.correctAnswer === 'string' && !q.correctAnswer.trim())
          ) {
            console.log(
              `❌ Validation failed: No correct answer(s) for question ${i + 1}`
            );
            Alert.alert(
              'Validation Error',
              `Please provide the correct answer(s) for question ${i + 1}.`
            );
            return false;
          }
          break;

        case 'essay':
          console.log('   Essay type - no strict validation needed');
          // Essay questions don't require strict validation
          break;
      }
    }

    console.log('✅ Validation passed successfully!');
    return true;
  };

  const handleSaveExercise = async () => {
    console.log('💾 SAVE BUTTON CLICKED!');
    console.log('📋 Current exercise data:', exerciseData);
    console.log('❓ Current questions:', questions);

    const isValid = validateExercise();
    console.log('✅ Validation result:', isValid);

    if (!isValid) {
      console.log('❌ Validation failed, not saving');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Starting exercise save operation...');
      console.log('👤 User authentication state:', {
        userId: user?.uid,
        email: user?.email,
        isAdmin: appUser?.isAdmin,
      });

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
            // Include optional fields for different question types
            ...(q.leftColumn && { leftColumn: q.leftColumn }), // For matching
            ...(q.passageText && { passageText: q.passageText }), // For true-false
            ...(q.blanksCount && { blanksCount: q.blanksCount }), // For fill-blanks
          })),
        },
      };

      console.log('📝 Exercise data prepared:', exerciseContent);

      if (isEditMode && typeof exerciseId === 'string') {
        // Update existing exercise
        console.log(`🔄 Updating exercise ${exerciseId}...`);
        const { updateExercise } = await import('@/services/firebaseService');
        await updateExercise(exerciseId, exerciseContent);
        console.log('✅ Exercise updated successfully');

        Alert.alert('Success', 'Exercise updated successfully!', [
          {
            text: 'OK',
            onPress: () => router.push('/admin/manage-exercises'),
          },
        ]);
      } else {
        // Create new exercise
        console.log('🔄 Creating new exercise...');
        const { createExercise } = await import('@/services/firebaseService');
        const newExerciseId = await createExercise(exerciseContent);
        console.log('✅ Exercise created successfully with ID:', newExerciseId);

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
    } catch (error: any) {
      console.error(
        `❌ Error ${isEditMode ? 'updating' : 'creating'} exercise:`,
        error
      );
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });

      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'create'} exercise.\n\nError: ${
          error?.message || 'Unknown error'
        }\n\nCheck browser console for details.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size='large' color='#6996b3' />
        <ThemedText style={styles.loadingText}>Loading exercise...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.push(isEditMode ? '/admin/manage-exercises' : '/admin')
            }
          >
            <IconSymbol name='chevron.left' size={24} color='#6996b3' />
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

              {/* Instructions Section - Multi-Language */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>
                  Instructions (All Languages)
                </ThemedText>
                <ThemedText style={[styles.helperText, { marginBottom: 12 }]}>
                  Provide instructions in all supported languages. English is required.
                </ThemedText>

                {LANGUAGE_ORDER.map((langCode) => {
                  const lang = SUPPORTED_LANGUAGES[langCode];
                  return (
                    <View key={langCode} style={styles.languageInputContainer}>
                      <View style={styles.languageHeader}>
                        <Text style={styles.flagIcon}>{lang.flag}</Text>
                        <ThemedText style={styles.languageCode}>
                          {langCode.toUpperCase()}
                        </ThemedText>
                        <ThemedText style={styles.languageLabel}>
                          ({lang.nativeLabel})
                        </ThemedText>
                        {langCode === 'en' && (
                          <ThemedText style={styles.requiredBadge}>
                            Required
                          </ThemedText>
                        )}
                      </View>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={exerciseData.instructions[langCode]}
                        onChangeText={(text) =>
                          setExerciseData((prev) => ({
                            ...prev,
                            instructions: {
                              ...prev.instructions,
                              [langCode]: text,
                            },
                          }))
                        }
                        placeholder={`Instructions in ${lang.name}`}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor='rgba(102, 102, 102, 0.5)'
                      />
                    </View>
                  );
                })}
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

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Question Type</ThemedText>
                <View style={styles.pickerContainer}>
                  {exerciseTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        exerciseData.type === type && styles.selectedOption,
                      ]}
                      onPress={() =>
                        setExerciseData((prev) => ({
                          ...prev,
                          type: type as any,
                        }))
                      }
                    >
                      <ThemedText
                        style={[
                          styles.pickerText,
                          exerciseData.type === type && styles.selectedText,
                        ]}
                      >
                        {type.replace('-', ' ')}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
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
                        <IconSymbol name='trash' size={16} color='#6f0202' />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* True/False: Show passage text for first question only */}
                  {exerciseData.type === 'true-false' && qIndex === 0 && (
                    <View style={styles.inputGroup}>
                      <ThemedText style={styles.label}>
                        Reading Passage
                      </ThemedText>
                      <TextInput
                        style={[styles.input, styles.textArea, { height: 120 }]}
                        value={question.passageText}
                        onChangeText={(text) =>
                          handlePassageTextChange(qIndex, text)
                        }
                        placeholder='Enter the text passage that students will read...'
                        multiline
                        numberOfLines={6}
                        placeholderTextColor='rgba(102, 102, 102, 0.5)'
                      />
                    </View>
                  )}

                  {/* Question/Statement field */}
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>
                      {exerciseData.type === 'true-false'
                        ? 'Statement'
                        : exerciseData.type === 'matching'
                        ? 'Instructions'
                        : 'Question'}
                    </ThemedText>
                    <TextInput
                      style={styles.input}
                      value={question.question}
                      onChangeText={(text) =>
                        handleQuestionChange(qIndex, 'question', text)
                      }
                      placeholder={
                        exerciseData.type === 'true-false'
                          ? 'Enter a statement about the passage'
                          : exerciseData.type === 'matching'
                          ? 'Match the items from Column A with Column B'
                          : exerciseData.type === 'fill-blanks'
                          ? 'Enter sentence with ____ for blanks'
                          : 'Enter the question'
                      }
                      placeholderTextColor='rgba(102, 102, 102, 0.5)'
                    />
                  </View>

                  {/* Multiple Choice Options */}
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

                  {/* True/False Answer Selection */}
                  {exerciseData.type === 'true-false' && (
                    <View style={styles.inputGroup}>
                      <ThemedText style={styles.label}>
                        Correct Answer
                      </ThemedText>
                      <View style={styles.pickerContainer}>
                        {['True', 'False'].map((option) => (
                          <TouchableOpacity
                            key={option}
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
                          >
                            <ThemedText
                              style={[
                                styles.pickerText,
                                question.correctAnswer === option &&
                                  styles.selectedText,
                              ]}
                            >
                              {option}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Matching: Left and Right Columns */}
                  {exerciseData.type === 'matching' && question.leftColumn && (
                    <>
                      <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>
                          Column A (Numbered)
                        </ThemedText>
                        {question.leftColumn.map((item, itemIndex) => (
                          <View key={itemIndex} style={styles.optionRow}>
                            <ThemedText style={styles.optionLabel}>
                              {itemIndex + 1}.
                            </ThemedText>
                            <TextInput
                              style={[styles.input, styles.optionInput]}
                              value={item}
                              onChangeText={(text) =>
                                handleLeftColumnChange(qIndex, itemIndex, text)
                              }
                              placeholder={`Item ${itemIndex + 1}`}
                              placeholderTextColor='rgba(102, 102, 102, 0.5)'
                            />
                          </View>
                        ))}
                      </View>

                      <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>
                          Column B (Lettered)
                        </ThemedText>
                        {question.options?.map((item, itemIndex) => (
                          <View key={itemIndex} style={styles.optionRow}>
                            <ThemedText style={styles.optionLabel}>
                              {String.fromCharCode(65 + itemIndex)}.
                            </ThemedText>
                            <TextInput
                              style={[styles.input, styles.optionInput]}
                              value={item}
                              onChangeText={(text) =>
                                handleOptionChange(qIndex, itemIndex, text)
                              }
                              placeholder={`Item ${String.fromCharCode(
                                65 + itemIndex
                              )}`}
                              placeholderTextColor='rgba(102, 102, 102, 0.5)'
                            />
                          </View>
                        ))}
                      </View>

                      <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>
                          Correct Matches (Letter for each number)
                        </ThemedText>
                        {Array.isArray(question.correctAnswer) &&
                          question.correctAnswer.map((answer, itemIndex) => (
                            <View key={itemIndex} style={styles.optionRow}>
                              <ThemedText style={styles.optionLabel}>
                                {itemIndex + 1} →
                              </ThemedText>
                              <TextInput
                                style={[styles.input, styles.optionInput]}
                                value={answer}
                                onChangeText={(text) =>
                                  handleCorrectAnswerArrayChange(
                                    qIndex,
                                    itemIndex,
                                    text.toUpperCase()
                                  )
                                }
                                placeholder='A, B, C, or D'
                                maxLength={1}
                                placeholderTextColor='rgba(102, 102, 102, 0.5)'
                              />
                            </View>
                          ))}
                      </View>
                    </>
                  )}

                  {/* Fill Blanks: Correct Answers */}
                  {exerciseData.type === 'fill-blanks' && (
                    <View style={styles.inputGroup}>
                      <ThemedText style={styles.label}>
                        Correct Answer(s)
                      </ThemedText>
                      <ThemedText
                        style={[styles.label, { fontSize: 12, color: '#666' }]}
                      >
                        Enter answers separated by commas for multiple blanks
                      </ThemedText>
                      <TextInput
                        style={styles.input}
                        value={
                          Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(', ')
                            : question.correctAnswer || ''
                        }
                        onChangeText={(text) => {
                          const answers = text.split(',').map((a) => a.trim());
                          handleQuestionChange(
                            qIndex,
                            'correctAnswer',
                            answers as any
                          );
                        }}
                        placeholder='e.g., answer1, answer2'
                        placeholderTextColor='rgba(102, 102, 102, 0.5)'
                      />
                    </View>
                  )}

                  {/* Essay: Info message */}
                  {exerciseData.type === 'essay' && (
                    <View style={styles.inputGroup}>
                      <ThemedText style={[styles.label, { color: '#6996b3' }]}>
                        ℹ️ Essay questions are open-ended and require manual
                        grading
                      </ThemedText>
                    </View>
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
                      placeholder='Explain the correct answer'
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
                  {loading
                    ? 'Loading...'
                    : isEditMode
                    ? 'Update Exercise'
                    : 'Save Exercise'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    color: '#6996b3',
  },
  disabledText: {
    color: '#ccc',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07b524',
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
    padding: 12,
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

    color: '#6996b3',
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
    marginVertical: 20,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#6996b3',
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
    color: '#202029',
    fontWeight: 'normal',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  languageInputContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  flagIcon: {
    fontSize: 24,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  languageLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  requiredBadge: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#07b524',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
    overflow: 'hidden',
  },
});
