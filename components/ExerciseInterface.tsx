import { MilestoneRatingModal } from '@/components/MilestoneRatingModal';
import { PremiumPurchaseModal } from '@/components/PremiumPurchaseModal';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Exercise, ExerciseContent } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExerciseInterfaceProps {
  exercise: Exercise;
}

// Responsive font size helper
const getResponsiveFontSize = (screenWidth: number): number => {
  if (screenWidth < 400) return 32;
  if (screenWidth < 768) return 40;
  return 48;
};

export const ExerciseInterface: React.FC<ExerciseInterfaceProps> = ({
  exercise,
}) => {
  const { user, hasPremiumAccess, appUser } = useAuth();
  const { theme } = useAppTheme();
  // Level tests are rendered by LevelTestInterface, so content is always ExerciseContent here.
  const content = exercise.content as ExerciseContent;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const scoreTextSize = getResponsiveFontSize(width);

  // Admins have free access to downloads
  const canDownload = hasPremiumAccess || appUser?.isAdmin;

  // Stop confetti after animation completes
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const currentQuestion = content.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === content.questions.length - 1;
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
        'Choose one of the options before proceeding.',
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
    let percentage = 0;

    try {
      content.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;
        let isCorrect = false;

        // Handle different question types
        if (content.type === 'matching') {
          // For matching: userAnswer is "ABCDEF", correctAnswer is ["A","B","C","D","E","F"]
          if (Array.isArray(correctAnswer)) {
            const userAnswerArray =
              typeof userAnswer === 'string'
                ? userAnswer.split('').map((a) => a.trim()) // Split into chars
                : userAnswer;

            // Compare arrays element by element
            isCorrect =
              userAnswerArray.length === correctAnswer.length &&
              userAnswerArray.every(
                (ans, idx) =>
                  ans.toUpperCase() === correctAnswer[idx].toUpperCase(),
              );
          } else {
            isCorrect = userAnswer === correctAnswer;
          }
        } else if (content.type === 'fill-blanks') {
          // For fill-blanks: userAnswer is "word1, word2", correctAnswer is ["word1","word2"]
          if (Array.isArray(correctAnswer)) {
            const userAnswerArray =
              typeof userAnswer === 'string'
                ? userAnswer.split(',').map((a) => a.trim()) // Split by commas
                : userAnswer;

            // Compare arrays element by element (case-insensitive)
            isCorrect =
              userAnswerArray.length === correctAnswer.length &&
              userAnswerArray.every(
                (ans, idx) =>
                  ans.toLowerCase() === correctAnswer[idx].toLowerCase(),
              );
          } else {
            isCorrect = userAnswer === correctAnswer;
          }
        } else if (content.type === 'short-answer') {
          // For short-answer: case-insensitive comparison with trimmed whitespace
          if (
            typeof correctAnswer === 'string' &&
            typeof userAnswer === 'string'
          ) {
            isCorrect =
              userAnswer.trim().toLowerCase() ===
              correctAnswer.trim().toLowerCase();
          }
        } else {
          // For multiple-choice and true-false: simple string comparison
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) {
          correctAnswers++;
        }
      });

      percentage = Math.round(
        (correctAnswers / content.questions.length) * 100,
      );
      setScore(percentage);

      // Trigger confetti and haptic feedback for perfect score
      if (percentage === 100) {
        setShowConfetti(true);
        if (Constants.executionEnvironment === 'storeClient') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.performAndroidHapticsAsync(
            Haptics.AndroidHaptics.Confirm,
          ).catch(() => {});
        }
      }

      // Save progress to Firebase
      if (user) {
        try {
          const { updateUserProgress } =
            await import('@/services/firebaseService');
          await updateUserProgress(user.uid, exercise.id, {
            completed: true,
            score: percentage,
          });
        } catch (error) {
          console.error('Error saving progress:', error);
        }

        // Rating modal: one-time trigger after 5+ completions, with 3s delay
        try {
          const [{ getUserProgress }, ratingShown] = await Promise.all([
            import('@/services/firebaseService'),
            AsyncStorage.getItem('@eslApp/ratingPromptShown'),
          ]);

          if (!ratingShown) {
            const allProgress = await getUserProgress(user.uid);
            const completedCount = allProgress.filter(
              (p) => p.completed,
            ).length;
            if (completedCount >= 5) {
              setTimeout(() => setShowRatingModal(true), 3000);
            }
          }
        } catch (milestoneError) {
          console.error('Milestone check error:', milestoneError);
        }
      }
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      // Always show results, even if there was an error
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setShowConfetti(false);
  };

  const handleRatingModalClose = async () => {
    try {
      await AsyncStorage.setItem('@eslApp/ratingPromptShown', 'true');
    } catch (error) {
      console.error('Error persisting rating prompt state:', error);
    }
    setShowRatingModal(false);
  };

  const handleFeedbackSubmit = async (message: string) => {
    if (!user) return;
    const { saveFeedback } = await import('@/services/firebaseService');
    await saveFeedback(user.uid, user.email ?? '', message, Platform.OS);
  };

  const handleDownloadFile = async () => {
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

    try {
      const { getFilesByExercise, downloadFile } =
        await import('@/services/fileService');

      // Get files linked to this exercise
      const files = await getFilesByExercise(exercise.id);

      if (files.length === 0) {
        Alert.alert(
          'No Files',
          'No downloadable files are available for this exercise.',
        );
        return;
      }

      // If only one file, download it directly
      if (files.length === 1) {
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
              await downloadFile(files[0]);
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error in handleDownloadFile:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to download file: ${errorMessage}\n\nPlease check the console for details.`,
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
            <ThemedText type="title" style={styles.resultsTitle}>
              Exercise Complete!
            </ThemedText>
            <ThemedText style={[styles.scoreText, { fontSize: scoreTextSize }]}>
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
            <ThemedText type="subtitle" style={styles.reviewTitle}>
              Review Your Answers
            </ThemedText>

            {content.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correctAnswer = question.correctAnswer;

              // Use same logic as calculateScore
              let isCorrect = false;
              if (content.type === 'matching') {
                if (Array.isArray(correctAnswer)) {
                  const userAnswerArray =
                    typeof userAnswer === 'string'
                      ? userAnswer.split('').map((a) => a.trim())
                      : userAnswer;
                  isCorrect =
                    userAnswerArray.length === correctAnswer.length &&
                    userAnswerArray.every(
                      (ans, idx) =>
                        ans.toUpperCase() === correctAnswer[idx].toUpperCase(),
                    );
                } else {
                  isCorrect = userAnswer === correctAnswer;
                }
              } else if (content.type === 'fill-blanks') {
                if (Array.isArray(correctAnswer)) {
                  const userAnswerArray =
                    typeof userAnswer === 'string'
                      ? userAnswer.split(',').map((a) => a.trim())
                      : userAnswer;
                  isCorrect =
                    userAnswerArray.length === correctAnswer.length &&
                    userAnswerArray.every(
                      (ans, idx) =>
                        ans.toLowerCase() === correctAnswer[idx].toLowerCase(),
                    );
                } else {
                  isCorrect = userAnswer === correctAnswer;
                }
              } else if (content.type === 'short-answer') {
                if (
                  typeof correctAnswer === 'string' &&
                  typeof userAnswer === 'string'
                ) {
                  isCorrect =
                    userAnswer.trim().toLowerCase() ===
                    correctAnswer.trim().toLowerCase();
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
                      Your answer: {userAnswer || '(no answer)'}
                    </Text>
                    {!isCorrect && (
                      <Text style={[styles.answerText, styles.correctAnswer]}>
                        Correct answer:{' '}
                        {Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.join(', ')
                          : question.correctAnswer}
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

          <View
            style={[
              styles.resultsFooter,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDownloadFile}
            >
              <IconSymbol
                name="square.and.arrow.down"
                size={20}
                color="#6996b3"
              />
              <ThemedText style={styles.secondaryButtonText}>
                Download Exercise
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestart}
            >
              <IconSymbol name="arrow.clockwise" size={20} color="#6996b3" />
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

        <PremiumPurchaseModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onPurchaseSuccess={() => {
            Alert.alert('Success', 'You can now download files!');
          }}
        />

        <MilestoneRatingModal
          visible={showRatingModal}
          onClose={handleRatingModalClose}
          onFeedbackSubmit={handleFeedbackSubmit}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <ThemedText style={styles.progressText}>
          Question {currentQuestionIndex + 1} of{' '}
          {content.questions.length}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestionIndex + 1) /
                    content.questions.length) *
                  100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.questionSection}>
        {/* True/False: Show passage on all questions if available */}
        {content.type === 'true-false' &&
          content.questions[0]?.passageText && (
            <View style={styles.passageContainer}>
              <ThemedText style={styles.passageLabel}>
                Read the passage below:
              </ThemedText>
              <ThemedText style={styles.passageTextContent}>
                {content.questions[0].passageText}
              </ThemedText>
            </View>
          )}

        <ThemedText type="subtitle" style={styles.question}>
          {content.type === 'true-false'
            ? `Statement ${currentQuestionIndex + 1}`
            : currentQuestion.question}
        </ThemedText>

        {/* Show the statement for true/false */}
        {content.type === 'true-false' && (
          <ThemedText style={styles.statementText}>
            {currentQuestion.question}
          </ThemedText>
        )}

        {/* Multiple Choice */}
        {content.type === 'multiple-choice' &&
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
        {content.type === 'true-false' && (
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
        {content.type === 'matching' &&
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
                      placeholder="A-F"
                      maxLength={1}
                      autoCapitalize="characters"
                      placeholderTextColor="rgba(102, 102, 102, 0.5)"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Fill Blanks */}
        {content.type === 'fill-blanks' && (
          <View style={styles.fillBlanksContainer}>
            <ThemedText style={styles.fillBlanksInstruction}>
              Fill in the blank(s) with a comma separating each answer:
            </ThemedText>
            <TextInput
              style={[styles.input, styles.fillBlanksInput]}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={(text) => handleAnswerSelect(text)}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={3}
              placeholderTextColor="rgba(102, 102, 102, 0.5)"
            />
          </View>
        )}

        {/* Essay */}
        {content.type === 'essay' && (
          <View style={styles.essayContainer}>
            <ThemedText style={styles.essayInstruction}>
              Write your essay answer below:
            </ThemedText>
            <TextInput
              style={[styles.input, styles.essayInput]}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={(text) => handleAnswerSelect(text)}
              placeholder="Type your essay here..."
              multiline
              numberOfLines={10}
              placeholderTextColor="rgba(102, 102, 102, 0.5)"
            />
          </View>
        )}

        {/* Short Answer */}
        {content.type === 'short-answer' && (
          <View style={styles.shortAnswerContainer}>
            <ThemedText style={styles.shortAnswerInstruction}>
              Write your answer below:
            </ThemedText>
            <TextInput
              style={[styles.input, styles.shortAnswerInput]}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={(text) => handleAnswerSelect(text)}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={3}
              placeholderTextColor="rgba(102, 102, 102, 0.5)"
            />
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.navigationFooter,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={
              currentQuestionIndex === 0
                ? theme.icons.placeholder
                : theme.accent.mid
            }
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
              name="chevron.right"
              size={20}
              color={hasAnswered ? '#fff' : theme.icons.placeholder}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgrounds.app,
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
      borderBottomColor: theme.borders.divider,
    },
    progressText: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.borders.light,
      borderRadius: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent.mid,
      borderRadius: 4,
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
      borderWidth: 1.5,
      borderColor: theme.borders.light,
      borderRadius: 12,
      padding: 16,
      backgroundColor: theme.backgrounds.card,
    },
    selectedOption: {
      borderWidth: 1,
      borderColor: theme.accent.mid,
      backgroundColor: theme.backgrounds.tintedStrong,
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
      borderColor: theme.icons.placeholder,
      marginRight: 12,
    },
    selectedIndicator: {
      borderColor: theme.accent.mid,
      backgroundColor: theme.accent.mid,
    },
    optionText: {
      fontSize: 16,
      flex: 1,
    },
    selectedOptionText: {
      color: theme.accent.mid,
    },
    navigationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borders.divider,
    },
    navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    navButtonText: {
      fontSize: 16,
      color: theme.accent.mid,
      marginLeft: 4,
    },
    primaryButton: {
      backgroundColor: theme.accent.mid,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 16,
      borderRadius: 12,
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
      color: theme.icons.placeholder,
    },
    // Results styles
    resultsHeader: {
      paddingHorizontal: 20,
      paddingVertical: 32,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    resultsTitle: {
      fontSize: 28,
      marginBottom: 16,
      lineHeight: 40,
    },
    scoreText: {
      fontWeight: '500',
      color: theme.text.accent,
      paddingVertical: 8,
      marginBottom: 16,
    },
    scoreIndicator: {
      width: 120,
      height: 12,
      backgroundColor: theme.borders.light,
      borderRadius: 6,
      marginBottom: 16,
    },
    scoreBar: {
      height: '100%',
      borderRadius: 4,
    },
    scoreDescription: {
      fontSize: 16,
      color: theme.text.secondary,
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
      backgroundColor: theme.backgrounds.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      boxShadow: theme.shadow.level1,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent.mid,
    },
    questionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    questionNumber: {
      fontSize: 14,
      color: theme.text.secondary,
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
      color: theme.text.primary,
    },
    correctAnswer: {
      color: theme.status.success,
    },
    explanation: {
      backgroundColor: theme.backgrounds.tinted,
      padding: 10,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.accent.mid,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    explanationText: {
      fontSize: 14,
      color: theme.text.secondary,
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
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.accent.mid,
      backgroundColor: theme.backgrounds.tinted,
      borderRadius: 12,
      gap: 8,
    },
    secondaryButtonText: {
      color: theme.accent.mid,
      fontSize: 16,
    },
    // True/False styles
    passageContainer: {
      backgroundColor: theme.backgrounds.tinted,
      padding: 14,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    passageLabel: {
      fontSize: 14,
      marginBottom: 8,
      color: theme.accent.mid,
    },
    passageTextContent: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.text.primary,
    },
    statementText: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      color: theme.text.secondary,
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
      backgroundColor: theme.backgrounds.tinted,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    columnHeader: {
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
      color: theme.accent.mid,
    },
    matchingItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    matchingNumber: {
      fontSize: 16,
      width: 24,
      color: theme.text.primary,
    },
    matchingLetter: {
      fontSize: 16,
      width: 24,
      color: theme.text.primary,
    },
    matchingText: {
      fontSize: 15,
      flex: 1,
      color: theme.text.secondary,
    },
    matchingInputContainer: {
      backgroundColor: theme.backgrounds.card,
      padding: 18,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.borders.light,
    },
    matchingInstructions: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.text.secondary,
    },
    matchingInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    matchingInputLabel: {
      fontSize: 16,
      width: 50,
      color: theme.text.primary,
    },
    matchingInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.borders.divider,
      borderRadius: 6,
      padding: 10,
      fontSize: 16,
      backgroundColor: theme.backgrounds.card,
      textAlign: 'center',
    },
    // Common input style
    input: {
      borderWidth: 1.5,
      borderColor: theme.borders.medium,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: theme.backgrounds.card,
    },
    // Fill Blanks styles
    fillBlanksContainer: {
      paddingBottom: 20,
    },
    fillBlanksInstruction: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.text.secondary,
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
      color: theme.text.secondary,
    },
    essayInput: {
      height: 200,
      textAlignVertical: 'top',
    },
    // Short Answer styles
    shortAnswerContainer: {
      paddingBottom: 20,
    },
    shortAnswerInstruction: {
      fontSize: 14,
      marginBottom: 12,
      color: theme.text.secondary,
    },
    shortAnswerInput: {
      height: 100,
      textAlignVertical: 'top',
    },
  });
}
