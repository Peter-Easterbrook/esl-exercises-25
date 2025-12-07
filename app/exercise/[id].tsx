import { ExerciseInterface } from '@/components/ExerciseInterface';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Exercise } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { SUPPORTED_LANGUAGES, LANGUAGE_ORDER, DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages';
import { getInstructionsForLanguage } from '@/utils/languageHelpers';
import { useAuth } from '@/contexts/AuthContext';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appUser } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (appUser?.preferredLanguage as LanguageCode) || DEFAULT_LANGUAGE
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
              <IconSymbol name='chevron.left' size={24} color='#6996b3' />
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
                <Text style={[styles.difficulty, styles[exercise.difficulty]]}>
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
            <IconSymbol name='chevron.left' size={24} color='#6996b3' />
            <ThemedText style={styles.backText}>Instructions</ThemedText>
          </TouchableOpacity>
        </View>

        <ExerciseInterface exercise={exercise} />
        </View>
      </ThemedView>
    </Animated.View>
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
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 8,
    color: '#6996b3',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  titleSection: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,

    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
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
    backgroundColor: '#e8f5e8',
    color: '#07b524',
  },
  intermediate: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  advanced: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  exerciseType: {
    fontSize: 14,
    color: '#444',
    textTransform: 'capitalize',
  },
  instructionsSection: {
    flex: 1,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  footer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#6996b3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  languageSelectorSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  languageSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  languageButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6996b3',
  },
  languageButtonFlag: {
    fontSize: 20,
  },
  languageButtonCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  languageButtonCodeSelected: {
    color: '#6996b3',
  },
});
