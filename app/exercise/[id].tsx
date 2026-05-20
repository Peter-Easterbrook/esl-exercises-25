import { ExerciseInterface } from '@/components/ExerciseInterface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LANGUAGE_ORDER, SUPPORTED_LANGUAGES, type LanguageCode } from '@/constants/languages';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Exercise } from '@/types';
import { getDeviceDefaultLanguage, getInstructionsForLanguage } from '@/utils/languageHelpers';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    SlideOutLeft,
} from 'react-native-reanimated';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appUser } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (appUser?.preferredLanguage as LanguageCode) || getDeviceDefaultLanguage()
  );

  useEffect(() => {
    const loadExercise = async () => {
      try {
        const { getExerciseById } = await import('@/services/firebaseService');
        const exerciseData = await getExerciseById(id!);

        if (!exerciseData) {
          Alert.alert('Error', 'Exercise not found');
          router.back();
          return;
        }

        setExercise(exerciseData);
      } catch (error) {
        console.error('Error loading exercise:', error);
        Alert.alert('Error', 'Failed to load exercise');
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [id]);

  const handleStartExercise = () => {
    setShowInstructions(false);
  };

  const handleBackToInstructions = () => {
    setShowInstructions(true);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.contentWrapper}>
          <ThemedText>Loading exercise...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!exercise) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.contentWrapper}>
          <ThemedText>Exercise not found</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const difficultyStyle =
    exercise.difficulty === 'beginner'
      ? styles.beginner
      : exercise.difficulty === 'intermediate'
        ? styles.intermediate
        : styles.advanced;

  if (showInstructions) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={{ flex: 1 }}
      >
        <ThemedView style={styles.container}>
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol name='chevron.left' size={24} color={theme.accent.mid} />
              <ThemedText style={styles.backText}>Back</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSection}>
              <ThemedText type='title' style={styles.title}>
                {exercise.title}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {exercise.description}
              </ThemedText>
              <View style={styles.difficultyContainer}>
                <Text style={[styles.difficulty, difficultyStyle]}>
                  {exercise.difficulty}
                </Text>
                <Text style={styles.exerciseType}>
                  {exercise.content.type.replace('-', ' ')} •{' '}
                  {exercise.content.questions.length} questions
                </Text>
              </View>
            </View>

            {/* Language Selector */}
            <View style={styles.languageSelectorSection}>
              <ThemedText style={styles.languageSelectorLabel}>
                Instructions Language:
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.languageButtonsContainer}
              >
                {LANGUAGE_ORDER.map((langCode) => {
                  const lang = SUPPORTED_LANGUAGES[langCode];
                  const isSelected = selectedLanguage === langCode;

                  return (
                    <TouchableOpacity
                      key={langCode}
                      style={[
                        styles.languageButton,
                        isSelected && styles.languageButtonSelected,
                      ]}
                      onPress={() => setSelectedLanguage(langCode)}
                    >
                      <Text style={styles.languageButtonFlag}>{lang.flag}</Text>
                      <Text
                        style={[
                          styles.languageButtonCode,
                          isSelected && styles.languageButtonCodeSelected,
                        ]}
                      >
                        {langCode.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.instructionsSection}>
              <ThemedText style={styles.instructions}>
                {getInstructionsForLanguage(exercise.instructions, selectedLanguage)}
              </ThemedText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartExercise}
            >
              <ThemedText style={styles.primaryButtonText}>
                Start Exercise
              </ThemedText>
            </TouchableOpacity>
          </View>
          </View>
        </ThemedView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
      style={{ flex: 1 }}
    >
      <ThemedView style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToInstructions}
          >
            <IconSymbol name='chevron.left' size={24} color={theme.accent.mid} />
            <ThemedText style={styles.backText}>Instructions</ThemedText>
          </TouchableOpacity>
        </View>

        <ExerciseInterface exercise={exercise} />
        </View>
      </ThemedView>
    </Animated.View>
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
      paddingTop: 40,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      marginLeft: 8,
      color: theme.accent.mid,
      fontSize: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 10,
    },
    titleSection: {
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      marginBottom: 8,
      lineHeight: 34,
    },
    subtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      marginBottom: 16,
    },
    difficultyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    difficulty: {
      fontSize: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    beginner: {
      backgroundColor: theme.difficulty.beginner.background,
      color: theme.difficulty.beginner.text,
    },
    intermediate: {
      backgroundColor: theme.difficulty.intermediate.background,
      color: theme.difficulty.intermediate.text,
    },
    advanced: {
      backgroundColor: theme.difficulty.advanced.background,
      color: theme.difficulty.advanced.text,
    },
    exerciseType: {
      fontSize: 14,
      color: theme.text.secondary,
      textTransform: 'capitalize',
    },
    instructionsSection: {
      flex: 1,
    },
    instructions: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.text.primary,
      paddingBottom: 10,
      paddingHorizontal: 4,
    },
    footer: {
      paddingHorizontal: 10,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borders.divider,
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.backgrounds.tintedStrong,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      fontSize: 16,
      color: theme.text.primary,
    },
    primaryButton: {
      backgroundColor: theme.accent.mid,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
    },
    languageSelectorSection: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borders.divider,
      marginBottom: 16,
    },
    languageSelectorLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 12,
      color: theme.text.primary,
    },
    languageButtonsContainer: {
      gap: 8,
      paddingRight: 16,
    },
    languageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.backgrounds.tintedStrong,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'transparent',
      gap: 6,
    },
    languageButtonSelected: {
      backgroundColor: theme.backgrounds.progressCircle,
      borderColor: theme.accent.mid,
    },
    languageButtonFlag: {
      fontSize: 20,
    },
    languageButtonCode: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.icons.placeholder,
    },
    languageButtonCodeSelected: {
      color: theme.accent.mid,
    },
  });
}
