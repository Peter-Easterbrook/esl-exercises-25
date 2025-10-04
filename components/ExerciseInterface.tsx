import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { Exercise } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const percentage = Math.round(
      (correctAnswers / exercise.content.questions.length) * 100
    );
    setScore(percentage);

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
  };

  const handleDownloadResults = async () => {
    try {
      const { exportExerciseResults } = await import(
        '@/services/exportService'
      );
      await exportExerciseResults(exercise, answers, score);
    } catch (error) {
      console.error('Error downloading results:', error);
      Alert.alert('Error', 'Failed to download results. Please try again.');
    }
  };

  if (showResults) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultsHeader}>
          <ThemedText type='title' style={styles.resultsTitle}>
            Exercise Complete!
          </ThemedText>
          <ThemedText style={styles.scoreText}>Your Score: {score}%</ThemedText>

          <View style={styles.scoreIndicator}>
            <View
              style={[
                styles.scoreBar,
                {
                  backgroundColor:
                    score >= 70
                      ? '#4CAF50'
                      : score >= 50
                      ? '#FF9800'
                      : '#F44336',
                },
              ]}
            />
          </View>

          <ThemedText style={styles.scoreDescription}>
            {score >= 80
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
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <View key={question.id} style={styles.reviewItem}>
                <View style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>
                    Question {index + 1}
                  </ThemedText>
                  <IconSymbol
                    name={
                      isCorrect ? 'checkmark.circle.fill' : 'xmark.circle.fill'
                    }
                    size={20}
                    color={isCorrect ? '#4CAF50' : '#F44336'}
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
            onPress={handleDownloadResults}
          >
            <IconSymbol
              name='square.and.arrow.down'
              size={20}
              color='#2196F3'
            />
            <ThemedText style={styles.secondaryButtonText}>
              Download Results
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestart}
          >
            <IconSymbol name='arrow.clockwise' size={20} color='#2196F3' />
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
        <ThemedText type='subtitle' style={styles.question}>
          {currentQuestion.question}
        </ThemedText>

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
            color={currentQuestionIndex === 0 ? '#ccc' : '#2196F3'}
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
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  questionSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  question: {
    fontSize: 20,
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
  },
  selectedOption: {
    borderColor: '#2196F3',
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
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
  },
  selectedIndicator: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '600',
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
    color: '#2196F3',
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
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
    fontWeight: '500',
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
    fontWeight: '500',
    color: '#2196F3',
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
    color: '#666',
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
    fontWeight: '500',
    color: '#666',
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
    color: '#4CAF50',
    fontWeight: '500',
  },
  explanation: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  resultsFooter: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});
