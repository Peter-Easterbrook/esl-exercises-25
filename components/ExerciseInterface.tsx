import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Confetti } from 'react-native-fast-confetti';

interface ExerciseInterfaceProps {
  exercise: Exercise;
}

export const ExerciseInterface: React.FC<ExerciseInterfaceProps> = ({
  exercise,
}) => {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('📚 Exercise loaded:', {
      type: exercise.content.type,
      questionsCount: exercise.content.questions.length,
      title: exercise.title,
    });
    console.log('📝 First question:', exercise.content.questions[0]);
  }, [exercise]);

  // Stop confetti after 4 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const currentQuestion = exercise.content.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === exercise.content.questions.length - 1;
  const hasAnswered = answers[currentQuestion.id] !== undefined;

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!hasAnswered) {
      Alert.alert(
        'Please select an answer',
        'Choose one of the options before proceeding.'
      );
      return;
    }

    if (isLastQuestion) {
      calculateScore();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateScore = async () => {
    let correctAnswers = 0;

    exercise.content.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      console.log('🔍 Checking answer for question:', question.id);
      console.log('   User answer:', userAnswer, typeof userAnswer);
      console.log('   Correct answer:', correctAnswer, typeof correctAnswer);

      let isCorrect = false;

      // Handle different question types
      if (
        exercise.content.type === 'matching' ||
        exercise.content.type === 'fill-blanks'
      ) {
        // For matching: userAnswer is "ABCDEF", correctAnswer is ["A","B","C","D","E","F"]
        // For fill-blanks: userAnswer is "word1, word2", correctAnswer is ["word1","word2"]
        if (Array.isArray(correctAnswer)) {
          const userAnswerArray =
            typeof userAnswer === 'string'
              ? userAnswer.split('').map((a) => a.trim()) // For matching: split into chars
              : userAnswer;

          // Compare arrays element by element
          isCorrect =
            userAnswerArray.length === correctAnswer.length &&
            userAnswerArray.every(
              (ans, idx) =>
                ans.toUpperCase() === correctAnswer[idx].toUpperCase()
            );
        } else {
          isCorrect = userAnswer === correctAnswer;
        }
      } else {
        // For multiple-choice and true-false: simple string comparison
        isCorrect = userAnswer === correctAnswer;
      }

      console.log('   Is correct?', isCorrect);

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const percentage = Math.round(
      (correctAnswers / exercise.content.questions.length) * 100
    );
    setScore(percentage);

    // Trigger confetti for perfect score
    if (percentage === 100) {
      setShowConfetti(true);
    }

    // Save progress to Firebase
    if (user) {
      try {
        const { updateUserProgress } = await import(
          '@/services/firebaseService'
        );
        await updateUserProgress(user.uid, exercise.id, {
          completed: true,
          score: percentage,
        });
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }

    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowConfetti(false);
  };

  const handleDownloadFile = async () => {
    try {
      console.log('handleDownloadFile called for exercise:', exercise.id);
      const { getFilesByExercise, downloadFile } = await import(
        '@/services/fileService'
      );

      // Get files linked to this exercise
      console.log('Fetching files for exercise:', exercise.id);
      const files = await getFilesByExercise(exercise.id);
      console.log('Files found:', files.length, files);

      if (files.length === 0) {
        Alert.alert(
          'No Files',
          'No downloadable files are available for this exercise.'
        );
        return;
      }

      // If only one file, download it directly
      if (files.length === 1) {
        console.log('Downloading single file:', files[0].name);
        await downloadFile(files[0]);
        return;
      }

      // If multiple files, show selection dialog
      const fileNames = files.map((f, i) => `${i + 1}. ${f.name}`).join('\n');
      Alert.alert(
        'Select File',
        `Multiple files available:\n${fileNames}\n\nDownloading the first file...`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              console.log(
                'Downloading first file from multiple:',
                files[0].name
              );
              await downloadFile(files[0]);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error in handleDownloadFile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to download file: ${errorMessage}\n\nPlease check the console for details.`
      );
    }
  };

  if (showResults) {
    return (
      <View style={styles.container}>
        {showConfetti && Platform.OS !== 'web' && (
          <View style={styles.confettiContainer}>
            <Confetti
              count={200}
              colors={[
                '#FFD700',
                '#FFA500',
                '#FF6347',
                '#07b524',
                '#6996b3',
                '#9C27B0',
              ]}
            />
          </View>
        )}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.resultsHeader}>
            <ThemedText type='title' style={styles.resultsTitle}>
              Exercise Complete!
            </ThemedText>
            <ThemedText style={styles.scoreText}>
              Your Score: {score}%
            </ThemedText>

            <View style={styles.scoreIndicator}>
              <View
                style={[
                  styles.scoreBar,
                  {
                    backgroundColor:
                      score >= 70
                        ? '#07b524'
                        : score >= 50
                        ? '#FF9800'
                        : '#6f0202',
                  },
                ]}
              />
            </View>

            <ThemedText style={styles.scoreDescription}>
              {score === 100
                ? '🎉 Perfect score! Outstanding work!'
                : score >= 80
                ? 'Excellent work!'
                : score >= 60
                ? 'Good job! Keep practicing.'
                : 'Keep studying and try again!'}
            </ThemedText>
          </View>

          <View style={styles.reviewSection}>
            <ThemedText type='subtitle' style={styles.reviewTitle}>
              Review Your Answers
            </ThemedText>

            {exercise.content.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correctAnswer = question.correctAnswer;

              // Use same logic as calculateScore
              let isCorrect = false;
              if (exercise.content.type === 'matching' || exercise.content.type === 'fill-blanks') {
                if (Array.isArray(correctAnswer)) {
                  const userAnswerArray = typeof userAnswer === 'string'
                    ? userAnswer.split('').map(a => a.trim())
                    : userAnswer;
                  isCorrect = userAnswerArray.length === correctAnswer.length &&
                    userAnswerArray.every((ans, idx) => ans.toUpperCase() === correctAnswer[idx].toUpperCase());
                } else {
                  isCorrect = userAnswer === correctAnswer;
                }
              } else {
                isCorrect = userAnswer === correctAnswer;
              }

              return (
                <View key={question.id} style={styles.reviewItem}>
                  <View style={styles.questionHeader}>
                    <ThemedText style={styles.questionNumber}>
                      Question {index + 1}
                    </ThemedText>
                    <IconSymbol
                      name={
                        isCorrect
                          ? 'checkmark.circle.fill'
                          : 'xmark.circle.fill'
                      }
                      size={20}
                      color={isCorrect ? '#07b524' : '#6f0202'}
                    />
                  </View>

                  <ThemedText style={styles.reviewQuestion}>
                    {question.question}
                  </ThemedText>

                  <View style={styles.answerReview}>
                    <Text style={[styles.answerText, styles.userAnswer]}>
                      Your answer: {userAnswer}
                    </Text>
                    {!isCorrect && (
                      <Text style={[styles.answerText, styles.correctAnswer]}>
                        Correct answer: {question.correctAnswer}
                      </Text>
                    )}
                  </View>

                  {question.explanation && (
                    <View style={styles.explanation}>
                      <ThemedText style={styles.explanationText}>
                        {question.explanation}
                      </ThemedText>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.resultsFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDownloadFile}
            >
              <IconSymbol
                name='square.and.arrow.down'
                size={20}
                color='#6996b3'
              />
              <ThemedText style={styles.secondaryButtonText}>
                Download Exercise
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestart}
            >
              <IconSymbol name='arrow.clockwise' size={20} color='#6996b3' />
              <ThemedText style={styles.secondaryButtonText}>
                Try Again
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.primaryButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <ThemedText style={styles.progressText}>
          Question {currentQuestionIndex + 1} of{' '}
          {exercise.content.questions.length}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestionIndex + 1) /
                    exercise.content.questions.length) *
                  100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.questionSection}>
        {/* True/False: Show passage on first question */}
        {exercise.content.type === 'true-false' &&
          currentQuestionIndex === 0 &&
          currentQuestion.passageText && (
            <View style={styles.passageContainer}>
              <ThemedText style={styles.passageLabel}>
                Read the passage below:
              </ThemedText>
              <ThemedText style={styles.passageText}>
                {currentQuestion.passageText}
              </ThemedText>
            </View>
          )}

        <ThemedText type='subtitle' style={styles.question}>
          {exercise.content.type === 'true-false'
            ? `Statement ${currentQuestionIndex + 1}`
            : currentQuestion.question}
        </ThemedText>

        {/* Show the statement for true/false */}
        {exercise.content.type === 'true-false' && (
          <ThemedText style={styles.statementText}>
            {currentQuestion.question}
          </ThemedText>
        )}

        {/* Multiple Choice */}
        {exercise.content.type === 'multiple-choice' &&
          currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestion.id] === option &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionIndicator,
                        answers[currentQuestion.id] === option &&
                          styles.selectedIndicator,
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.optionText,
                        answers[currentQuestion.id] === option &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* True/False Options */}
        {exercise.content.type === 'true-false' && (
          <View style={styles.optionsContainer}>
            {['True', 'False'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === option &&
                    styles.selectedOption,
                ]}
                onPress={() => handleAnswerSelect(option)}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.optionIndicator,
                      answers[currentQuestion.id] === option &&
                        styles.selectedIndicator,
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.optionText,
                      answers[currentQuestion.id] === option &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Matching */}
        {(() => {
          console.log('🔍 Checking matching conditions:', {
            type: exercise.content.type,
            hasLeftColumn: !!currentQuestion.leftColumn,
            hasOptions: !!currentQuestion.options,
            leftColumn: currentQuestion.leftColumn,
            options: currentQuestion.options,
          });
          return null;
        })()}
        {exercise.content.type === 'matching' &&
          currentQuestion.leftColumn &&
          currentQuestion.options && (
            <View style={styles.matchingContainer}>
              <View style={styles.matchingColumns}>
                <View style={styles.matchingColumn}>
                  <ThemedText style={styles.columnHeader}>Column A</ThemedText>
                  {currentQuestion.leftColumn.map((item, index) => (
                    <View key={index} style={styles.matchingItem}>
                      <ThemedText style={styles.matchingNumber}>
                        {index + 1}.
                      </ThemedText>
                      <ThemedText style={styles.matchingText}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.matchingColumn}>
                  <ThemedText style={styles.columnHeader}>Column B</ThemedText>
                  {currentQuestion.options.map((item, index) => (
                    <View key={index} style={styles.matchingItem}>
                      <ThemedText style={styles.matchingLetter}>
                        {String.fromCharCode(65 + index)}.
                      </ThemedText>
                      <ThemedText style={styles.matchingText}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.matchingInputContainer}>
                <ThemedText style={styles.matchingInstructions}>
                  Enter the letter for each number:
                </ThemedText>
                {currentQuestion.leftColumn.map((_, index) => (
                  <View key={index} style={styles.matchingInputRow}>
                    <ThemedText style={styles.matchingInputLabel}>
                      {index + 1} →
                    </ThemedText>
                    <TextInput
                      style={styles.matchingInput}
                      value={
                        (answers[currentQuestion.id] as string)?.[index] || ''
                      }
                      onChangeText={(text) => {
                        const currentAnswers =
                          (answers[currentQuestion.id] as string) || '';
                        const answersArray = currentAnswers.split('');
                        answersArray[index] = text.toUpperCase();
                        handleAnswerSelect(answersArray.join(''));
                      }}
                      placeholder='A-F'
                      maxLength={1}
                      autoCapitalize='characters'
                      placeholderTextColor='rgba(102, 102, 102, 0.5)'
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Fill Blanks */}
        {exercise.content.type === 'fill-blanks' && (
          <View style={styles.fillBlanksContainer}>
            <ThemedText style={styles.fillBlanksInstruction}>
              Fill in the blank(s):
            </ThemedText>
            <TextInput
              style={[styles.input, styles.fillBlanksInput]}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={(text) => handleAnswerSelect(text)}
              placeholder='Type your answer here...'
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Essay */}
        {exercise.content.type === 'essay' && (
          <View style={styles.essayContainer}>
            <ThemedText style={styles.essayInstruction}>
              Write your essay answer below:
            </ThemedText>
            <TextInput
              style={[styles.input, styles.essayInput]}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={(text) => handleAnswerSelect(text)}
              placeholder='Type your essay here...'
              multiline
              numberOfLines={10}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationFooter}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <IconSymbol
            name='chevron.left'
            size={20}
            color={currentQuestionIndex === 0 ? '#ccc' : '#6996b3'}
          />
          <ThemedText
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.disabledText,
            ]}
          >
            Previous
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, !hasAnswered && styles.disabledButton]}
          onPress={handleNext}
          disabled={!hasAnswered}
        >
          <ThemedText
            style={[
              styles.primaryButtonText,
              !hasAnswered && styles.disabledText,
            ]}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </ThemedText>
          {!isLastQuestion && (
            <IconSymbol
              name='chevron.right'
              size={20}
              color={hasAnswered ? '#fff' : '#ccc'}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6996b3',
    borderRadius: 2,
  },
  questionSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 40,
  },
  question: {
    fontSize: 20,
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  optionButton: {
    borderWidth: 0.5,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
  },
  selectedOption: {
    borderColor: '#6996b3',
    backgroundColor: '#f0f8ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
    marginRight: 12,
  },
  selectedIndicator: {
    borderColor: '#6996b3',
    backgroundColor: '#6996b3',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  selectedOptionText: {
    color: '#6996b3',
  },
  navigationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButtonText: {
    fontSize: 16,
    color: '#6996b3',
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#6996b3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,

    marginRight: 4,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#ccc',
  },
  // Results styles
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsTitle: {
    fontSize: 28,
    marginBottom: 16,
    lineHeight: 34,
  },
  scoreText: {
    fontSize: 32,

    color: '#6996b3',
    marginBottom: 16,
  },
  scoreIndicator: {
    width: 100,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 16,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  reviewSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  reviewTitle: {
    marginBottom: 20,
  },
  reviewItem: {
    marginBottom: 24,
    paddingBottom: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,

    color: '#444',
  },
  reviewQuestion: {
    fontSize: 16,
    marginBottom: 12,
  },
  answerReview: {
    marginBottom: 12,
  },
  answerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  userAnswer: {
    color: '#333',
  },
  correctAnswer: {
    color: '#07b524',
  },
  explanation: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6996b3',
  },
  explanationText: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
  },
  resultsFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#6996b3',
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#6996b3',
    fontSize: 16,
  },
  // True/False styles
  passageContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  passageLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#6996b3',
  },
  passageText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  statementText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#444',
    fontStyle: 'italic',
  },
  // Matching styles
  matchingContainer: {
    paddingBottom: 20,
  },
  matchingColumns: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  matchingColumn: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  columnHeader: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    color: '#6996b3',
  },
  matchingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  matchingNumber: {
    fontSize: 16,
    width: 24,
    color: '#333',
  },
  matchingLetter: {
    fontSize: 16,
    width: 24,
    color: '#333',
  },
  matchingText: {
    fontSize: 15,
    flex: 1,
    color: '#444',
  },
  matchingInputContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  matchingInstructions: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  matchingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchingInputLabel: {
    fontSize: 16,
    width: 50,
    color: '#333',
  },
  matchingInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  // Fill Blanks styles
  fillBlanksContainer: {
    paddingBottom: 20,
  },
  fillBlanksInstruction: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  fillBlanksInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Essay styles
  essayContainer: {
    paddingBottom: 20,
  },
  essayInstruction: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
  },
  essayInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  // Common input style
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
