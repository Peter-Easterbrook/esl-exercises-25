import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  DEFAULT_LEVEL_BANDS,
  LEVEL_COLOURS,
  assignLevel,
} from '@/constants/levelTest';
import { blues } from '@/constants/theme';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  Exercise,
  LevelBand,
  LevelTestContent,
  LevelTestSection,
  LevelTestSectionScore,
  Question,
} from '@/types';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Confetti } from 'react-native-fast-confetti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LevelTestInterfaceProps {
  exercise: Exercise;
}

interface SectionResult {
  sectionId: string;
  sectionTitle: string;
  points: number;
  maxPoints: number;
  correctAnswers: number;
  totalQuestions: number;
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function isAnswerCorrect(
  question: Question,
  sectionType: LevelTestSection['type'],
  userAnswer: string | undefined,
): boolean {
  if (!userAnswer) return false;
  const correctAnswer = question.correctAnswer;

  if (sectionType === 'matching') {
    if (Array.isArray(correctAnswer)) {
      const userArr = userAnswer.split('').map((a) => a.trim());
      return (
        userArr.length === correctAnswer.length &&
        userArr.every(
          (ans, i) => ans.toUpperCase() === correctAnswer[i].toUpperCase(),
        )
      );
    }
    return userAnswer === correctAnswer;
  }

  if (sectionType === 'fill-blanks') {
    if (Array.isArray(correctAnswer)) {
      const userArr = userAnswer.split(',').map((a) => a.trim());
      return (
        userArr.length === correctAnswer.length &&
        userArr.every(
          (ans, i) => ans.toLowerCase() === correctAnswer[i].toLowerCase(),
        )
      );
    }
    return userAnswer === correctAnswer;
  }

  if (sectionType === 'short-answer') {
    if (typeof correctAnswer === 'string') {
      return (
        userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      );
    }
    return false;
  }

  // multiple-choice, true-false
  return userAnswer === correctAnswer;
}

function calculateSectionPoints(
  section: LevelTestSection,
  answers: Record<string, string>,
): number {
  if (section.questions.length === 0) return 0;
  const correct = section.questions.filter((q) =>
    isAnswerCorrect(q, section.type, answers[q.id]),
  ).length;
  return Math.round((correct / section.questions.length) * section.maxPoints);
}

// ─── Component ───────────────────────────────────────────────────────────────

export const LevelTestInterface: React.FC<LevelTestInterfaceProps> = ({
  exercise,
}) => {
  const rawContent = exercise.content as LevelTestContent;
  // Ignore any section without questions so progress/scoring never divides by
  // zero and the player never shows an empty section.
  const content = useMemo<LevelTestContent>(
    () => ({
      ...rawContent,
      sections: (rawContent.sections ?? []).filter(
        (s) => s.questions && s.questions.length > 0,
      ),
    }),
    [rawContent],
  );
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Stop confetti after animation completes
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const currentSection = content.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const isLastSection = currentSectionIndex === content.sections.length - 1;
  const isLastQuestion =
    currentQuestionIndex === currentSection?.questions.length - 1;
  const hasAnswered = !!answers[currentQuestion?.id];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNext = () => {
    if (!hasAnswered) {
      Alert.alert(
        'Please answer',
        'Select or enter an answer before continuing.',
      );
      return;
    }

    if (isLastQuestion) {
      // End of section — compute results and show section summary
      const correct = currentSection.questions.filter((q) =>
        isAnswerCorrect(q, currentSection.type, answers[q.id]),
      ).length;
      const points = calculateSectionPoints(currentSection, answers);

      const result: SectionResult = {
        sectionId: currentSection.id,
        sectionTitle: currentSection.title,
        points,
        maxPoints: currentSection.maxPoints,
        correctAnswers: correct,
        totalQuestions: currentSection.questions.length,
      };

      setSectionResults((prev) => [...prev, result]);

      // Haptic feedback on section completion
      if (Constants.executionEnvironment === 'storeClient') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Confirm,
        ).catch(() => {});
      }

      setShowSectionSummary(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextSection = async () => {
    setShowSectionSummary(false);

    if (isLastSection) {
      // All sections done — save and show final results
      const allResults = [...sectionResults];
      const totalPoints = allResults.reduce((sum, r) => sum + r.points, 0);
      const totalMax = allResults.reduce((sum, r) => sum + r.maxPoints, 0);
      const assignedBand =
        assignLevel(totalPoints, content.levelBands, totalMax) ??
        assignLevel(totalPoints, DEFAULT_LEVEL_BANDS, totalMax);

      // Trigger confetti for a perfect score
      if (totalMax > 0 && totalPoints === totalMax) {
        setShowConfetti(true);
      }

      if (user && assignedBand) {
        setIsSaving(true);
        try {
          const sectionScores: LevelTestSectionScore[] = allResults.map(
            (r) => ({
              sectionId: r.sectionId,
              sectionTitle: r.sectionTitle,
              points: r.points,
              maxPoints: r.maxPoints,
            }),
          );

          const { updateUserProgress, updateUserEnglishLevel } =
            await import('@/services/firebaseService');

          await Promise.all([
            updateUserProgress(user.uid, exercise.id, {
              completed: true,
              score: totalPoints,
              levelTestResult: {
                totalPoints,
                assignedLevel: assignedBand.level,
                assignedLevelLabel: assignedBand.label,
                sectionScores,
              },
            }),
            updateUserEnglishLevel(user.uid, assignedBand.level),
          ]);
        } catch (error) {
          console.error('Error saving level test result:', error);
        } finally {
          setIsSaving(false);
        }
      }

      setShowFinalResults(true);
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handleRestart = () => {
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSectionResults([]);
    setShowSectionSummary(false);
    setShowFinalResults(false);
    setShowConfetti(false);
  };

  // ── Section summary screen ───────────────────────────────────────────────────

  if (showSectionSummary) {
    const latestResult = sectionResults[sectionResults.length - 1];
    const pct = latestResult
      ? Math.round((latestResult.points / latestResult.maxPoints) * 100)
      : 0;

    return (
      <View
        style={[
          styles.container,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.summaryContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryIconRow}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={56}
              color={pct >= 60 ? theme.status.success : theme.status.warning}
            />
          </View>

          <ThemedText type="title" style={styles.summaryTitle}>
            Section Complete!
          </ThemedText>

          <ThemedText style={styles.summarySubtitle}>
            {latestResult?.sectionTitle}
          </ThemedText>

          <View style={styles.summaryScoreBox}>
            <ThemedText style={styles.summaryScoreLabel}>Your score</ThemedText>
            <ThemedText style={styles.summaryScoreValue}>
              {latestResult?.points} / {latestResult?.maxPoints}
            </ThemedText>
            <ThemedText style={styles.summaryScorePct}>{pct}%</ThemedText>
          </View>

          <ThemedText style={styles.summaryCorrectText}>
            {latestResult?.correctAnswers} of {latestResult?.totalQuestions}{' '}
            questions correct
          </ThemedText>

          <Pressable
            android_ripple={{ color: blues.blue9, foreground: true }}
            style={styles.primaryButton}
            onPress={handleNextSection}
            disabled={isSaving}
          >
            <ThemedText style={styles.primaryButtonText}>
              {isLastSection
                ? isSaving
                  ? 'Saving…'
                  : 'See Final Results'
                : `Next: ${content.sections[currentSectionIndex + 1]?.title}`}
            </ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── Final results screen ─────────────────────────────────────────────────────

  if (showFinalResults) {
    const totalPoints = sectionResults.reduce((sum, r) => sum + r.points, 0);
    const totalMax = sectionResults.reduce((sum, r) => sum + r.maxPoints, 0);
    const isPerfectScore = totalMax > 0 && totalPoints === totalMax;
    const assignedBand: LevelBand | null =
      assignLevel(totalPoints, content.levelBands, totalMax) ??
      assignLevel(totalPoints, DEFAULT_LEVEL_BANDS, totalMax);
    const levelColour = assignedBand
      ? (LEVEL_COLOURS[assignedBand.level] ?? theme.accent.mid)
      : theme.accent.mid;

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
          contentContainerStyle={[
            styles.resultsContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* CEFR badge */}
          <View style={styles.resultsHeader}>
            <ThemedText type="title" style={styles.resultsTitle}>
              Level Test Complete!
            </ThemedText>

            {isPerfectScore && (
              <IconSymbol
                name="trophy.fill"
                size={56}
                color="#f6a800"
                style={styles.trophyIcon}
              />
            )}

            <View style={[styles.levelBadge, { backgroundColor: levelColour }]}>
              <ThemedText style={styles.levelBadgeCode}>
                {assignedBand?.level ?? '—'}
              </ThemedText>
              <ThemedText style={styles.levelBadgeLabel}>
                {assignedBand?.label ?? 'Not assessed'}
              </ThemedText>
            </View>

            <ThemedText style={styles.totalScoreText}>
              Total: {totalPoints} / {totalMax} points
            </ThemedText>

            {assignedBand?.description && (
              <View style={styles.levelDescription}>
                <ThemedText style={styles.levelDescriptionText}>
                  {assignedBand.description}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Per-section breakdown */}
          <View style={styles.sectionBreakdown}>
            <ThemedText type="subtitle" style={styles.breakdownTitle}>
              Section Breakdown
            </ThemedText>

            {sectionResults.map((result) => {
              const pct = Math.round((result.points / result.maxPoints) * 100);
              const barColour =
                pct >= 70
                  ? theme.status.success
                  : pct >= 50
                    ? theme.status.warning
                    : '#6f0202';

              return (
                <View key={result.sectionId} style={styles.sectionRow}>
                  <View style={styles.sectionRowHeader}>
                    <ThemedText style={styles.sectionRowTitle}>
                      {result.sectionTitle}
                    </ThemedText>
                    <ThemedText style={styles.sectionRowScore}>
                      {result.points}/{result.maxPoints} ({pct}%)
                    </ThemedText>
                  </View>
                  <View style={styles.sectionBarTrack}>
                    <View
                      style={[
                        styles.sectionBarFill,
                        { width: `${pct}%`, backgroundColor: barColour },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Per-section answer review */}
          <View style={styles.reviewSection}>
            <ThemedText type="subtitle" style={styles.breakdownTitle}>
              Review Your Answers
            </ThemedText>

            {content.sections.map((section) => (
              <View key={section.id} style={styles.reviewSectionBlock}>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.reviewSectionTitle}
                >
                  {section.title}
                </ThemedText>

                {section.questions.map((question, qIdx) => {
                  const userAnswer = answers[question.id];
                  const correct = isAnswerCorrect(
                    question,
                    section.type,
                    userAnswer,
                  );

                  return (
                    <View
                      key={question.id}
                      style={[
                        styles.reviewItem,
                        {
                          borderLeftColor: correct
                            ? theme.status.success
                            : '#6f0202',
                        },
                      ]}
                    >
                      <View style={styles.reviewItemHeader}>
                        <ThemedText style={styles.reviewItemNumber}>
                          Q{qIdx + 1}
                        </ThemedText>
                        <IconSymbol
                          name={
                            correct
                              ? 'checkmark.circle.fill'
                              : 'xmark.circle.fill'
                          }
                          size={18}
                          color={correct ? theme.status.success : '#6f0202'}
                        />
                      </View>

                      <ThemedText style={styles.reviewItemQuestion}>
                        {question.question}
                      </ThemedText>

                      <Text style={styles.reviewUserAnswer}>
                        Your answer: {userAnswer || '(no answer)'}
                      </Text>

                      {!correct && (
                        <Text style={styles.reviewCorrectAnswer}>
                          Correct:{' '}
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(', ')
                            : question.correctAnswer}
                        </Text>
                      )}

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
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.resultsFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRestart}
            >
              <IconSymbol
                name="arrow.clockwise"
                size={20}
                color={theme.accent.mid}
              />
              <ThemedText style={styles.secondaryButtonText}>
                Retake Test
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

  // ── Question screen ──────────────────────────────────────────────────────────

  if (!currentSection || !currentQuestion) return null;

  return (
    <View style={styles.container}>
      {/* Section progress dots */}
      <View style={styles.sectionProgress}>
        <View style={styles.sectionDots}>
          {content.sections.map((section, index) => (
            <View
              key={section.id}
              style={[
                styles.sectionDot,
                index === currentSectionIndex
                  ? styles.sectionDotActive
                  : index < currentSectionIndex
                    ? styles.sectionDotDone
                    : styles.sectionDotPending,
              ]}
            >
              {index < currentSectionIndex && (
                <IconSymbol name="checkmark" size={10} color="#fff" />
              )}
            </View>
          ))}
        </View>
        <ThemedText style={styles.sectionLabel}>
          Section {currentSectionIndex + 1}/{content.sections.length}:{' '}
          {currentSection.title}
        </ThemedText>
      </View>

      {/* Question progress bar */}
      <View style={styles.questionProgress}>
        <ThemedText style={styles.questionProgressText}>
          Question {currentQuestionIndex + 1} of{' '}
          {currentSection.questions.length}
        </ThemedText>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIndex + 1) / currentSection.questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.questionSection}
        showsVerticalScrollIndicator={false}
      >
        {/* True/False: passage shown once from first question */}
        {currentSection.type === 'true-false' &&
          currentSection.questions[0]?.passageText && (
            <View style={styles.passageContainer}>
              <ThemedText style={styles.passageLabel}>
                Read the passage below:
              </ThemedText>
              <ThemedText style={styles.passageText}>
                {currentSection.questions[0].passageText}
              </ThemedText>
            </View>
          )}

        <ThemedText type="subtitle" style={styles.questionText}>
          {currentSection.type === 'true-false'
            ? `Statement ${currentQuestionIndex + 1}`
            : currentQuestion.question}
        </ThemedText>

        {currentSection.type === 'true-false' && (
          <ThemedText style={styles.statementText}>
            {currentQuestion.question}
          </ThemedText>
        )}

        {/* Multiple Choice */}
        {currentSection.type === 'multiple-choice' &&
          currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
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

        {/* True / False */}
        {currentSection.type === 'true-false' && (
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
        {currentSection.type === 'matching' &&
          currentQuestion.leftColumn &&
          currentQuestion.options && (
            <View style={styles.matchingContainer}>
              <View style={styles.matchingColumns}>
                <View style={styles.matchingColumn}>
                  <ThemedText style={styles.columnHeader}>Column A</ThemedText>
                  {currentQuestion.leftColumn.map((item, idx) => (
                    <View key={idx} style={styles.matchingItem}>
                      <ThemedText style={styles.matchingNumber}>
                        {idx + 1}.
                      </ThemedText>
                      <ThemedText style={styles.matchingItemText}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                <View style={styles.matchingColumn}>
                  <ThemedText style={styles.columnHeader}>Column B</ThemedText>
                  {currentQuestion.options.map((item, idx) => (
                    <View key={idx} style={styles.matchingItem}>
                      <ThemedText style={styles.matchingNumber}>
                        {String.fromCharCode(65 + idx)}.
                      </ThemedText>
                      <ThemedText style={styles.matchingItemText}>
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
                {currentQuestion.leftColumn.map((_, idx) => (
                  <View key={idx} style={styles.matchingInputRow}>
                    <ThemedText style={styles.matchingInputLabel}>
                      {idx + 1} →
                    </ThemedText>
                    <TextInput
                      style={styles.matchingInput}
                      value={
                        (answers[currentQuestion.id] as string)?.[idx] || ''
                      }
                      onChangeText={(text) => {
                        const current =
                          (answers[currentQuestion.id] as string) || '';
                        const arr = current.split('');
                        arr[idx] = text.toUpperCase();
                        handleAnswerSelect(arr.join(''));
                      }}
                      placeholder="A–Z"
                      maxLength={1}
                      autoCapitalize="characters"
                      placeholderTextColor="rgba(102,102,102,0.5)"
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Fill Blanks */}
        {currentSection.type === 'fill-blanks' && (
          <View style={styles.fillBlanksContainer}>
            <ThemedText style={styles.fillBlanksInstruction}>
              Fill in the blank(s) — separate multiple answers with a comma:
            </ThemedText>
            <TextInput
              style={styles.textInput}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={handleAnswerSelect}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={3}
              placeholderTextColor="rgba(102,102,102,0.5)"
            />
          </View>
        )}

        {/* Short Answer */}
        {currentSection.type === 'short-answer' && (
          <View style={styles.shortAnswerContainer}>
            <ThemedText style={styles.shortAnswerInstruction}>
              Write your answer below:
            </ThemedText>
            <TextInput
              style={styles.textInput}
              value={(answers[currentQuestion.id] as string) || ''}
              onChangeText={handleAnswerSelect}
              placeholder="Type your answer here..."
              multiline
              numberOfLines={3}
              placeholderTextColor="rgba(102,102,102,0.5)"
            />
          </View>
        )}
      </ScrollView>

      {/* Navigation footer */}
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
            {isLastQuestion ? 'Finish Section' : 'Next'}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    trophyIcon: {
      marginBottom: 16,
    },
    // Section progress
    sectionProgress: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
      alignItems: 'center',
      gap: 8,
    },
    sectionDots: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      gap: 10,
    },
    sectionDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionDotActive: {
      backgroundColor: theme.accent.mid,
    },
    sectionDotDone: {
      backgroundColor: theme.status.success,
    },
    sectionDotPending: {
      backgroundColor: theme.borders.light,
    },
    sectionLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      textAlign: 'center',
    },
    // Question progress
    questionProgress: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    questionProgressText: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 6,
    },
    progressBar: {
      height: 5,
      backgroundColor: theme.borders.light,
      borderRadius: 3,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent.mid,
      borderRadius: 3,
    },
    // Question content
    questionSection: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    questionText: {
      fontSize: 20,
      marginBottom: 20,
      lineHeight: 28,
    },
    statementText: {
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    passageContainer: {
      backgroundColor: theme.backgrounds.tinted,
      padding: 14,
      borderRadius: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    passageLabel: {
      fontSize: 13,
      color: theme.accent.mid,
      marginBottom: 8,
    },
    passageText: {
      fontSize: 15,
      lineHeight: 24,
      color: theme.text.primary,
    },
    // Options
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
    // Matching
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
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    columnHeader: {
      fontSize: 13,
      color: theme.accent.mid,
      marginBottom: 10,
      textAlign: 'center',
    },
    matchingItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    matchingNumber: {
      fontSize: 14,
      color: theme.text.secondary,
      marginRight: 6,
      minWidth: 20,
    },
    matchingItemText: {
      fontSize: 14,
      flex: 1,
    },
    matchingInputContainer: {
      gap: 8,
    },
    matchingInstructions: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },
    matchingInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    matchingInputLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      width: 36,
    },
    matchingInput: {
      borderWidth: 1,
      borderColor: theme.borders.medium,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      width: 56,
      backgroundColor: theme.backgrounds.card,
      color: theme.text.primary,
      textAlign: 'center',
    },
    // Fill blanks / Short answer
    fillBlanksContainer: {
      paddingBottom: 20,
    },
    fillBlanksInstruction: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    shortAnswerContainer: {
      paddingBottom: 20,
    },
    shortAnswerInstruction: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.borders.medium,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      backgroundColor: theme.backgrounds.card,
      color: theme.text.primary,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    // Navigation
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
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 6,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
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
    disabledButton: {
      opacity: 0.5,
    },
    disabledText: {
      color: theme.icons.placeholder,
    },
    // Section summary
    summaryContent: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 32,
      alignItems: 'center',
    },
    summaryIconRow: {
      marginBottom: 20,
    },
    summaryTitle: {
      fontSize: 26,
      marginBottom: 8,
      textAlign: 'center',
    },
    summarySubtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      marginBottom: 32,
      textAlign: 'center',
    },
    summaryScoreBox: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 20,
      paddingHorizontal: 40,
      paddingVertical: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
      boxShadow: theme.shadow.level2,
      width: '100%',
    },
    summaryScoreLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 8,
    },
    summaryScoreValue: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.text.accent,
      marginBottom: 4,
    },
    summaryScorePct: {
      fontSize: 18,
      color: theme.text.secondary,
    },
    summaryCorrectText: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 40,
    },
    // Final results
    resultsContent: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },
    resultsHeader: {
      alignItems: 'center',
      paddingBottom: 28,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
      marginBottom: 24,
    },
    resultsTitle: {
      fontSize: 26,
      marginBottom: 24,
      textAlign: 'center',
    },
    levelBadge: {
      borderRadius: 20,
      paddingHorizontal: 48,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 16,
      minWidth: 180,
    },
    levelBadgeCode: {
      fontSize: 48,
      fontWeight: '800',
      color: '#fff',
      lineHeight: 56,
    },
    levelBadgeLabel: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
      marginTop: 4,
    },
    totalScoreText: {
      fontSize: 16,
      color: theme.text.secondary,
      marginBottom: 16,
    },
    levelDescription: {
      backgroundColor: theme.backgrounds.tinted,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    levelDescriptionText: {
      fontSize: 14,
      color: theme.text.secondary,
      lineHeight: 22,
      textAlign: 'center',
    },
    // Section breakdown
    sectionBreakdown: {
      marginBottom: 28,
    },
    breakdownTitle: {
      marginBottom: 16,
    },
    sectionRow: {
      marginBottom: 16,
    },
    sectionRowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    sectionRowTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    sectionRowScore: {
      fontSize: 14,
      color: theme.text.secondary,
    },
    sectionBarTrack: {
      height: 8,
      backgroundColor: theme.borders.light,
      borderRadius: 4,
    },
    sectionBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    // Review
    reviewSection: {
      marginBottom: 28,
    },
    reviewSectionBlock: {
      marginBottom: 20,
    },
    reviewSectionTitle: {
      fontSize: 16,
      color: theme.accent.mid,
      marginBottom: 12,
      paddingBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    reviewItem: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      borderLeftWidth: 4,
      boxShadow: theme.shadow.level1,
    },
    reviewItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    reviewItemNumber: {
      fontSize: 13,
      color: theme.text.secondary,
    },
    reviewItemQuestion: {
      fontSize: 15,
      marginBottom: 8,
    },
    reviewUserAnswer: {
      fontSize: 13,
      color: theme.text.primary,
      marginBottom: 4,
    },
    reviewCorrectAnswer: {
      fontSize: 13,
      color: '#07b524',
      marginBottom: 4,
    },
    explanation: {
      backgroundColor: theme.backgrounds.tinted,
      padding: 8,
      borderRadius: 8,
      marginTop: 4,
      borderLeftWidth: 3,
      borderLeftColor: theme.accent.mid,
    },
    explanationText: {
      fontSize: 13,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    // Results footer
    resultsFooter: {
      gap: 12,
      paddingBottom: 8,
    },
  });
}
