import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  DEFAULT_LEVEL_BANDS,
  DEFAULT_LEVEL_TEST_SECTIONS,
  LEVEL_COLOURS,
  assignLevel,
} from '@/constants/levelTest';
import { AppTheme } from '@/constants/themes';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import {
  LevelBand,
  LevelTestContent,
  LevelTestSection,
  Question,
} from '@/types';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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

const genId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// react-native's Alert is a no-op on react-native-web, so feedback (including
// save errors and validation messages) silently vanishes in the browser. These
// helpers fall back to the browser's native dialogs on web.
const notify = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

const confirmDestructive = (
  title: string,
  message: string,
  onConfirm: () => void,
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onConfirm },
    ]);
  }
};

function emptyQuestion(type: LevelTestSection['type']): Question {
  const id = genId();
  switch (type) {
    case 'multiple-choice':
      return {
        id,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      };
    case 'true-false':
      return {
        id,
        question: '',
        passageText: '',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: '',
      };
    case 'fill-blanks':
      return { id, question: '', correctAnswer: '', explanation: '' };
    case 'matching':
      return {
        id,
        question: 'Match the items',
        leftItems: ['', ''],
        rightItems: ['', ''],
        correctAnswer: '',
        explanation: '',
      };
    case 'short-answer':
      return { id, question: '', correctAnswer: '', explanation: '' };
  }
}

function buildDefaultSections(): LevelTestSection[] {
  const pointsEach = Math.floor(160 / DEFAULT_LEVEL_TEST_SECTIONS.length);
  return DEFAULT_LEVEL_TEST_SECTIONS.map((s) => ({
    id: genId(),
    title: s.title,
    type: s.type,
    questions: [],
    maxPoints: pointsEach,
  }));
}

const SECTION_TYPES: LevelTestSection['type'][] = [
  'multiple-choice',
  'fill-blanks',
  'true-false',
  'matching',
  'short-answer',
];

export default function LevelTestEditorScreen() {
  const { appUser, loading: authLoading } = useAuth();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingExerciseId, setExistingExerciseId] = useState<string | null>(
    null,
  );
  const [levelTestCategoryId, setLevelTestCategoryId] = useState<string | null>(
    null,
  );

  const [title, setTitle] = useState('English Level Test');
  const [description, setDescription] = useState(
    'Find out your CEFR English level through grammar, vocabulary and reading exercises.',
  );
  const [difficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate',
  );
  const [sections, setSections] =
    useState<LevelTestSection[]>(buildDefaultSections);
  const [levelBands, setLevelBands] =
    useState<LevelBand[]>(DEFAULT_LEVEL_BANDS);
  const [activeSection, setActiveSection] = useState(0);

  const totalMaxPoints = sections.reduce((sum, s) => sum + s.maxPoints, 0);

  useEffect(() => {
    if (authLoading) return;
    if (!appUser?.isAdmin) {
      router.replace('/(tabs)' as any);
      return;
    }
    loadExisting();
  }, [authLoading, appUser?.isAdmin]);

  const loadExisting = async () => {
    try {
      const { getCategories, getExercisesByCategory } =
        await import('@/services/firebaseService');
      const cats = await getCategories();
      const ltCat = cats.find((c) => c.name === 'Level Test');
      if (ltCat) {
        setLevelTestCategoryId(ltCat.id);
        const exs = await getExercisesByCategory(ltCat.id);
        const ltEx = exs.find((e) => e.content.type === 'level-test');
        if (ltEx) {
          setExistingExerciseId(ltEx.id);
          setTitle(ltEx.title);
          setDescription(ltEx.description ?? '');
          const c = ltEx.content as LevelTestContent;
          if (c.sections?.length) setSections(c.sections);
          if (c.levelBands?.length) setLevelBands(c.levelBands);
        }
      }
    } catch (e) {
      console.error('Error loading level test:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      notify('Validation', 'Please enter a title.');
      return;
    }

    // Every section must be named, but empty sections are allowed — they act as
    // placeholders the admin can fill in across multiple editing sessions.
    for (const s of sections) {
      if (!s.title.trim()) {
        notify('Validation', 'A section is missing a title.');
        return;
      }
      for (const q of s.questions) {
        if (!q.question.trim()) {
          notify('Validation', `A question in "${s.title}" has no text.`);
          return;
        }
        const answer = q.correctAnswer;
        const answerIsEmpty = Array.isArray(answer)
          ? answer.every((a) => !a.trim())
          : !answer?.trim();
        if (answerIsEmpty) {
          notify(
            'Validation',
            `A question in "${s.title}" is missing a correct answer.`,
          );
          return;
        }
      }
    }

    // Only sections that actually contain questions get persisted, and the
    // total is derived from those — this keeps the CEFR bands consistent and
    // protects the test player (which divides by question count) from empty
    // sections. At least one populated section is required.
    const sectionsToSave = sections.filter((s) => s.questions.length > 0);
    if (sectionsToSave.length === 0) {
      notify(
        'Nothing to save',
        'Add at least one question to one section before saving.',
      );
      return;
    }
    const savedMaxPoints = sectionsToSave.reduce(
      (sum, s) => sum + s.maxPoints,
      0,
    );

    setSaving(true);
    try {
      const { getCategories, createCategory, createExercise, updateExercise } =
        await import('@/services/firebaseService');

      let catId = levelTestCategoryId;
      if (!catId) {
        const cats = await getCategories();
        const existing = cats.find((c) => c.name === 'Level Test');
        if (existing) {
          catId = existing.id;
        } else {
          catId = await createCategory({
            name: 'Level Test',
            description: 'Test your English level and get a CEFR rating.',
            icon: 'school',
          });
        }
        setLevelTestCategoryId(catId);
      }

      const content: LevelTestContent = {
        type: 'level-test',
        sections: sectionsToSave,
        levelBands,
        totalMaxPoints: savedMaxPoints,
      };

      const exercisePayload = {
        title: title.trim(),
        description: description.trim(),
        instructions: {
          en: 'Complete all sections carefully. Each section tests a different skill.',
          es: 'Completa todas las secciones con cuidado. Cada sección evalúa una habilidad diferente.',
          fr: 'Complétez toutes les sections avec soin. Chaque section évalue une compétence différente.',
          de: 'Bearbeite alle Abschnitte sorgfältig. Jeder Abschnitt testet eine andere Fähigkeit.',
          it: 'Completa tutte le sezioni con attenzione. Ogni sezione testa una competenza diversa.',
        },
        category: catId,
        difficulty,
        content,
      };

      if (existingExerciseId) {
        await updateExercise(existingExerciseId, exercisePayload);
        notify(
          'Saved',
          `Level Test updated — ${sectionsToSave.length} section(s), ${savedMaxPoints} pts.`,
        );
      } else {
        const newId = await createExercise(exercisePayload as any);
        setExistingExerciseId(newId);
        notify(
          'Saved',
          `Level Test created — ${sectionsToSave.length} section(s), ${savedMaxPoints} pts.`,
        );
      }
    } catch (e: any) {
      console.error('[LevelTestEditor] Save failed:', e);
      notify('Error', e?.message ?? 'Failed to save level test.');
    } finally {
      setSaving(false);
    }
  };

  // ---- Section helpers ----
  const addSection = () => {
    const s: LevelTestSection = {
      id: genId(),
      title: '',
      type: 'multiple-choice',
      questions: [emptyQuestion('multiple-choice')],
      maxPoints: 40,
    };
    setSections((prev) => [...prev, s]);
    setActiveSection(sections.length);
  };

  const removeSection = (idx: number) => {
    if (sections.length <= 1) {
      notify('Error', 'At least one section is required.');
      return;
    }
    confirmDestructive(
      'Remove Section',
      `Remove "${sections[idx].title}"?`,
      () => {
        setSections((prev) => prev.filter((_, i) => i !== idx));
        setActiveSection((prev) => Math.max(0, prev - 1));
      },
    );
  };

  const updateSection = (idx: number, patch: Partial<LevelTestSection>) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  };

  const addQuestion = (sIdx: number) => {
    const s = sections[sIdx];
    updateSection(sIdx, { questions: [...s.questions, emptyQuestion(s.type)] });
  };

  const removeQuestion = (sIdx: number, qIdx: number) => {
    const s = sections[sIdx];
    if (s.questions.length <= 1) {
      notify('Error', 'At least one question is required per section.');
      return;
    }
    updateSection(sIdx, {
      questions: s.questions.filter((_, i) => i !== qIdx),
    });
  };

  const updateQuestion = (
    sIdx: number,
    qIdx: number,
    patch: Partial<Question>,
  ) => {
    const s = sections[sIdx];
    updateSection(sIdx, {
      questions: s.questions.map((q, i) =>
        i === qIdx ? { ...q, ...patch } : q,
      ),
    });
  };

  // ---- Band helpers ----
  const updateBand = (idx: number, patch: Partial<LevelBand>) => {
    setLevelBands((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={theme.accent.mid} />
      </ThemedView>
    );
  }

  const activeSec = sections[activeSection] ?? sections[0];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <IconSymbol
                name="chevron.left"
                size={24}
                color={theme.accent.mid}
              />
              <ThemedText style={styles.backText}>Admin</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="title" style={styles.screenTitle}>
              Level Test Editor
            </ThemedText>
            {existingExerciseId ? (
              <ThemedText style={styles.existingNote}>
                ✓ Editing existing level test (ID:{' '}
                {existingExerciseId.slice(0, 8)}…)
              </ThemedText>
            ) : (
              <ThemedText style={styles.newNote}>
                Creating new level test
              </ThemedText>
            )}

            {/* Exercise Metadata */}
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Exercise Details
              </ThemedText>
              <ThemedText style={styles.fieldLabel}>Title</ThemedText>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Exercise title"
                placeholderTextColor={theme.text.placeholder}
              />
              <ThemedText style={styles.fieldLabel}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Short description"
                placeholderTextColor={theme.text.placeholder}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Section Tabs */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  Sections ({sections.length}) — Total: {totalMaxPoints} pts
                </ThemedText>
                <TouchableOpacity style={styles.addBtn} onPress={addSection}>
                  <IconSymbol name="plus" size={16} color="#fff" />
                  <Text style={styles.addBtnText}>Add Section</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsScroll}
              >
                {sections.map((s, idx) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.tab,
                      activeSection === idx && styles.tabActive,
                    ]}
                    onPress={() => setActiveSection(idx)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeSection === idx && styles.tabTextActive,
                      ]}
                    >
                      {s.title || `Section ${idx + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Active Section Editor */}
              {activeSec && (
                <View style={styles.sectionBody}>
                  <View style={styles.sectionBodyHeader}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.fieldLabel}
                    >
                      Section Title
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => removeSection(activeSection)}
                    >
                      <IconSymbol
                        name="trash"
                        size={18}
                        color={theme.status.error ?? '#c00'}
                      />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={activeSec.title}
                    onChangeText={(v) =>
                      updateSection(activeSection, { title: v })
                    }
                    placeholder="Section name"
                    placeholderTextColor={theme.text.placeholder}
                  />

                  <View style={styles.rowGap}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.fieldLabel}>
                        Question Type
                      </ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        <View style={styles.chipRow}>
                          {SECTION_TYPES.map((t) => (
                            <TouchableOpacity
                              key={t}
                              style={[
                                styles.chip,
                                activeSec.type === t && styles.chipSelected,
                              ]}
                              onPress={() =>
                                updateSection(activeSection, {
                                  type: t,
                                  questions: activeSec.questions.map(() =>
                                    emptyQuestion(t),
                                  ),
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  activeSec.type === t &&
                                    styles.chipTextSelected,
                                ]}
                              >
                                {t.replace('-', ' ')}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    <View style={styles.maxPtsField}>
                      <ThemedText style={styles.fieldLabel}>Max pts</ThemedText>
                      <TextInput
                        style={styles.input}
                        value={String(activeSec.maxPoints)}
                        onChangeText={(v) =>
                          updateSection(activeSection, {
                            maxPoints: parseInt(v, 10) || 0,
                          })
                        }
                        keyboardType="numeric"
                        placeholderTextColor={theme.text.placeholder}
                      />
                    </View>
                  </View>

                  {/* Questions */}
                  <ThemedText
                    type="defaultSemiBold"
                    style={[styles.fieldLabel, styles.questionsLabel]}
                  >
                    Questions ({activeSec.questions.length})
                  </ThemedText>

                  {activeSec.questions.map((q, qIdx) => (
                    <View key={q.id} style={styles.questionCard}>
                      <View style={styles.questionCardHeader}>
                        <ThemedText style={styles.questionNum}>
                          Q{qIdx + 1}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={() => removeQuestion(activeSection, qIdx)}
                        >
                          <IconSymbol
                            name="xmark.circle.fill"
                            size={20}
                            color={theme.icons.secondary}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Passage for true-false */}
                      {activeSec.type === 'true-false' && (
                        <>
                          <ThemedText style={styles.fieldLabel}>
                            Passage (optional)
                          </ThemedText>
                          <TextInput
                            style={[styles.input, styles.textArea]}
                            value={q.passageText ?? ''}
                            onChangeText={(v) =>
                              updateQuestion(activeSection, qIdx, {
                                passageText: v,
                              })
                            }
                            placeholder="Reading passage…"
                            placeholderTextColor={theme.text.placeholder}
                            multiline
                          />
                        </>
                      )}

                      <ThemedText style={styles.fieldLabel}>
                        Question
                      </ThemedText>
                      <TextInput
                        style={styles.input}
                        value={q.question}
                        onChangeText={(v) =>
                          updateQuestion(activeSection, qIdx, { question: v })
                        }
                        placeholder={
                          activeSec.type === 'fill-blanks'
                            ? 'She ___ to school every day.'
                            : 'Question text'
                        }
                        placeholderTextColor={theme.text.placeholder}
                      />

                      {/* Options for multiple-choice */}
                      {activeSec.type === 'multiple-choice' && (
                        <>
                          <ThemedText style={styles.fieldLabel}>
                            Options
                          </ThemedText>
                          {(q.options ?? ['', '', '', '']).map((opt, oIdx) => (
                            <View key={oIdx} style={styles.optionInputRow}>
                              <Text style={styles.optionLabel}>
                                {String.fromCharCode(65 + oIdx)}.
                              </Text>
                              <TextInput
                                style={[styles.input, styles.optionInput]}
                                value={opt}
                                onChangeText={(v) => {
                                  const opts = [
                                    ...(q.options ?? ['', '', '', '']),
                                  ];
                                  opts[oIdx] = v;
                                  updateQuestion(activeSection, qIdx, {
                                    options: opts,
                                  });
                                }}
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                placeholderTextColor={theme.text.placeholder}
                              />
                            </View>
                          ))}
                        </>
                      )}

                      {/* Matching columns */}
                      {activeSec.type === 'matching' && (
                        <>
                          <View style={styles.matchingColumns}>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={styles.fieldLabel}>
                                Column A
                              </ThemedText>
                              {(q.leftItems ?? ['', '']).map((item, iIdx) => (
                                <TextInput
                                  key={iIdx}
                                  style={styles.input}
                                  value={item}
                                  onChangeText={(v) => {
                                    const left = [...(q.leftItems ?? ['', ''])];
                                    left[iIdx] = v;
                                    updateQuestion(activeSection, qIdx, {
                                      leftItems: left,
                                    });
                                  }}
                                  placeholder={`A${iIdx + 1}`}
                                  placeholderTextColor={theme.text.placeholder}
                                />
                              ))}
                              <TouchableOpacity
                                onPress={() =>
                                  updateQuestion(activeSection, qIdx, {
                                    leftItems: [...(q.leftItems ?? []), ''],
                                  })
                                }
                              >
                                <Text style={styles.addRowLink}>
                                  + Add item
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={styles.fieldLabel}>
                                Column B
                              </ThemedText>
                              {(q.rightItems ?? ['', '']).map((item, iIdx) => (
                                <TextInput
                                  key={iIdx}
                                  style={styles.input}
                                  value={item}
                                  onChangeText={(v) => {
                                    const right = [
                                      ...(q.rightItems ?? ['', '']),
                                    ];
                                    right[iIdx] = v;
                                    updateQuestion(activeSection, qIdx, {
                                      rightItems: right,
                                    });
                                  }}
                                  placeholder={`B${iIdx + 1}`}
                                  placeholderTextColor={theme.text.placeholder}
                                />
                              ))}
                              <TouchableOpacity
                                onPress={() =>
                                  updateQuestion(activeSection, qIdx, {
                                    rightItems: [...(q.rightItems ?? []), ''],
                                  })
                                }
                              >
                                <Text style={styles.addRowLink}>
                                  + Add item
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </>
                      )}

                      {/* Correct Answer */}
                      <ThemedText style={styles.fieldLabel}>
                        {activeSec.type === 'fill-blanks'
                          ? 'Correct Answer(s) (comma-separated)'
                          : activeSec.type === 'short-answer'
                            ? 'Acceptable Answer(s) (comma-separated)'
                            : activeSec.type === 'matching'
                              ? 'Correct Pairs (e.g. 1-A,2-B)'
                              : 'Correct Answer'}
                      </ThemedText>
                      {activeSec.type === 'true-false' ? (
                        <View style={styles.chipRow}>
                          {['True', 'False'].map((tf) => (
                            <TouchableOpacity
                              key={tf}
                              style={[
                                styles.chip,
                                q.correctAnswer === tf && styles.chipSelected,
                              ]}
                              onPress={() =>
                                updateQuestion(activeSection, qIdx, {
                                  correctAnswer: tf,
                                })
                              }
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  q.correctAnswer === tf &&
                                    styles.chipTextSelected,
                                ]}
                              >
                                {tf}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <TextInput
                          style={styles.input}
                          value={q.correctAnswer}
                          onChangeText={(v) =>
                            updateQuestion(activeSection, qIdx, {
                              correctAnswer: v,
                            })
                          }
                          placeholder="Correct answer"
                          placeholderTextColor={theme.text.placeholder}
                        />
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addQuestionBtn}
                    onPress={() => addQuestion(activeSection)}
                  >
                    <IconSymbol
                      name="plus.circle"
                      size={20}
                      color={theme.accent.mid}
                    />
                    <ThemedText style={styles.addQuestionText}>
                      Add Question
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Level Bands */}
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Level Bands (total max: {totalMaxPoints} pts)
              </ThemedText>
              {levelBands.map((band, idx) => (
                <View
                  key={band.level}
                  style={[
                    styles.bandRow,
                    {
                      borderLeftColor:
                        LEVEL_COLOURS[band.level] ?? theme.accent.mid,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.bandPill,
                      {
                        backgroundColor:
                          LEVEL_COLOURS[band.level] ?? theme.accent.mid,
                      },
                    ]}
                  >
                    <Text style={styles.bandPillText}>{band.level}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <TextInput
                      style={styles.inputSm}
                      value={band.label}
                      onChangeText={(v) => updateBand(idx, { label: v })}
                      placeholder="Label (e.g. Beginner)"
                      placeholderTextColor={theme.text.placeholder}
                    />
                    <View style={styles.bandScoreRow}>
                      <TextInput
                        style={[styles.inputSm, styles.scoreInput]}
                        value={String(band.minScore)}
                        onChangeText={(v) =>
                          updateBand(idx, { minScore: parseInt(v, 10) || 0 })
                        }
                        keyboardType="numeric"
                        placeholder="Min"
                        placeholderTextColor={theme.text.placeholder}
                      />
                      <Text style={styles.bandDash}>–</Text>
                      <TextInput
                        style={[styles.inputSm, styles.scoreInput]}
                        value={String(band.maxScore)}
                        onChangeText={(v) =>
                          updateBand(idx, { maxScore: parseInt(v, 10) || 0 })
                        }
                        keyboardType="numeric"
                        placeholder="Max"
                        placeholderTextColor={theme.text.placeholder}
                      />
                      <Text style={styles.bandPts}>%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Score Preview */}
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Score Preview
              </ThemedText>
              <ThemedText style={styles.previewNote}>
                Each band shows the score range that earns that level:
              </ThemedText>
              <View style={styles.previewGrid}>
                {levelBands.map((band) => (
                  <View
                    key={band.level}
                    style={[
                      styles.previewItem,
                      {
                        borderColor:
                          LEVEL_COLOURS[band.level] ?? theme.accent.mid,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.previewPill,
                        {
                          backgroundColor:
                            LEVEL_COLOURS[band.level] ?? theme.accent.mid,
                        },
                      ]}
                    >
                      <Text style={styles.previewPillText}>{band.level}</Text>
                    </View>
                    <View>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.previewLabel}
                      >
                        {band.label}
                      </ThemedText>
                      <ThemedText style={styles.previewRange}>
                        {band.minScore}–{band.maxScore}%
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
              <ThemedText style={styles.previewNote}>
                {assignLevel(
                  Math.floor(totalMaxPoints / 2),
                  levelBands,
                  totalMaxPoints,
                )
                  ? `Scoring half the points (${Math.floor(totalMaxPoints / 2)}) → ${assignLevel(Math.floor(totalMaxPoints / 2), levelBands, totalMaxPoints)?.label}`
                  : 'Check band ranges cover 0–100%'}
              </ThemedText>
            </View>

            <View style={{ height: 80 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      backgroundColor: theme.backgrounds.app,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 700,
      alignSelf: 'center',
      flex: 1,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backText: {
      marginLeft: 6,
      color: theme.accent.mid,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: theme.accent.mid,
      paddingHorizontal: 22,
      paddingVertical: 9,
      borderRadius: 22,
      minWidth: 72,
      alignItems: 'center',
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: 16,
    },
    screenTitle: {
      fontSize: 24,
      marginBottom: 4,
      marginTop: 8,
    },
    existingNote: {
      fontSize: 13,
      color: theme.status.success,
      marginBottom: 16,
    },
    newNote: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.backgrounds.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
      boxShadow: theme.shadow.level1,
    },
    cardTitle: {
      fontSize: 16,
      marginBottom: 14,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    fieldLabel: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 5,
      marginTop: 10,
    },
    questionsLabel: {
      marginTop: 16,
      fontSize: 14,
    },
    input: {
      backgroundColor: theme.backgrounds.tintedStrong,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: theme.text.primary,
      fontSize: 15,
      borderWidth: 1,
      borderColor: theme.borders.light,
      marginBottom: 4,
    },
    inputSm: {
      backgroundColor: theme.backgrounds.tintedStrong,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: theme.text.primary,
      fontSize: 14,
      borderWidth: 1,
      borderColor: theme.borders.light,
    },
    textArea: {
      minHeight: 70,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 4,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.backgrounds.tintedStrong,
      borderWidth: 1,
      borderColor: theme.borders.light,
    },
    chipSelected: {
      backgroundColor: theme.backgrounds.progressCircle,
      borderColor: theme.accent.mid,
    },
    chipText: {
      fontSize: 13,
      color: theme.text.secondary,
      textTransform: 'capitalize',
    },
    chipTextSelected: {
      color: theme.accent.mid,
      fontWeight: '600',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 34,
      paddingHorizontal: 14,
      borderRadius: 17,
      backgroundColor: theme.accent.mid,
      justifyContent: 'center',
    },
    addBtnText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    tabsScroll: {
      marginBottom: 14,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: theme.backgrounds.tintedStrong,
      borderWidth: 1,
      borderColor: theme.borders.light,
    },
    tabActive: {
      backgroundColor: theme.backgrounds.progressCircle,
      borderColor: theme.accent.mid,
    },
    tabText: {
      fontSize: 13,
      color: theme.text.secondary,
    },
    tabTextActive: {
      color: theme.accent.mid,
      fontWeight: '600',
    },
    sectionBody: {
      borderTopWidth: 1,
      borderTopColor: theme.borders.divider,
      paddingTop: 14,
    },
    sectionBodyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowGap: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
    },
    maxPtsField: {
      width: 90,
    },
    questionCard: {
      backgroundColor: theme.backgrounds.tinted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borders.subtle,
    },
    questionCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    questionNum: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.accent.mid,
    },
    optionInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    optionLabel: {
      fontSize: 14,
      color: theme.text.secondary,
      width: 20,
    },
    optionInput: {
      flex: 1,
      marginBottom: 0,
    },
    matchingColumns: {
      flexDirection: 'row',
      gap: 10,
    },
    addRowLink: {
      fontSize: 13,
      color: theme.accent.mid,
      marginTop: 4,
      marginBottom: 6,
    },
    addQuestionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      justifyContent: 'center',
    },
    addQuestionText: {
      color: theme.accent.mid,
      fontSize: 15,
    },
    bandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
      paddingLeft: 10,
      borderLeftWidth: 4,
    },
    bandPill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bandPillText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    bandScoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    scoreInput: {
      width: 70,
    },
    bandDash: {
      color: theme.text.secondary,
      fontSize: 16,
    },
    bandPts: {
      color: theme.text.secondary,
      fontSize: 13,
    },
    previewNote: {
      fontSize: 13,
      color: theme.text.secondary,
      marginBottom: 12,
    },
    previewGrid: {
      gap: 10,
      marginBottom: 12,
    },
    previewItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 12,
    },
    previewPill: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewPillText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    previewLabel: {
      fontSize: 15,
    },
    previewRange: {
      fontSize: 13,
      color: theme.text.secondary,
    },
  });
}
