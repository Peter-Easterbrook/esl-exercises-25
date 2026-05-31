import { LevelBand } from '@/types';

export const DEFAULT_LEVEL_BANDS: LevelBand[] = [
  {
    level: 'A1',
    label: 'Beginner',
    minScore: 0,
    maxScore: 25,
    description:
      'Can handle basic isolated phrases. Scores in this range mean the student only managed a few correct answers in basic present tenses or simple prepositions.',
  },
  {
    level: 'A2',
    label: 'Elementary',
    minScore: 26,
    maxScore: 50,
    description:
      'Understands sentences of immediate relevance. The student can successfully navigate fundamental tenses (Present Simple, Past Simple), some/any, and simple text negation.',
  },
  {
    level: 'B1',
    label: 'Intermediate',
    minScore: 51,
    maxScore: 75,
    description:
      'Understands standard input on familiar matters. At this tier, the student secures a solid grasp of Section A (Tenses), correctly manages Much/Many, basic Comparatives, and First Conditionals.',
  },
  {
    level: 'B2',
    label: 'Upper-Intermediate',
    minScore: 76,
    maxScore: 100,
    description:
      'Understands complex text and abstract topics. The student commands advanced tenses (Present Perfect, Past Perfect), modals (Must/Have to), Linkers, and structural Question Tags.',
  },
];

export const LEVEL_COLOURS: Record<string, string> = {
  A1: '#6f0202', // danger red
  A2: '#ff9500', // warning amber
  B1: '#004c6d', // primary blue
  B2: '#07b524', // success green
};

export const DEFAULT_LEVEL_TEST_SECTIONS = [
  { title: 'Pronouns / Verbs', type: 'multiple-choice' as const },
  { title: 'Plural Nouns', type: 'multiple-choice' as const },
  { title: 'Articles', type: 'multiple-choice' as const },
  { title: 'Comparative Adjectives', type: 'multiple-choice' as const },
  { title: 'Place Prepositions', type: 'multiple-choice' as const },
  { title: 'Time Prepositions', type: 'multiple-choice' as const },
  { title: 'Conjunctions', type: 'multiple-choice' as const },
  {
    title: 'Simple Present / Present Progressive',
    type: 'multiple-choice' as const,
  },
  {
    title: 'Simple Past / Past Progressive',
    type: 'multiple-choice' as const,
  },
  {
    title: 'Simple Past / Present Perfect',
    type: 'multiple-choice' as const,
  },
  { title: 'Mixed Tenses', type: 'multiple-choice' as const },
  { title: 'Yes / No Questions', type: 'multiple-choice' as const },
  { title: 'WH Questions', type: 'multiple-choice' as const },
  { title: 'Tag Questions', type: 'multiple-choice' as const },
  { title: 'Negative Sentences', type: 'multiple-choice' as const },
  { title: 'Compound Sentences', type: 'multiple-choice' as const },
];

/**
 * Returns the matching LevelBand for a given score.
 * When `totalMaxPoints` is provided the score is normalised to a 0–100
 * percentage before comparison, so bands can always be defined in that range.
 */
export function assignLevel(
  totalPoints: number,
  bands: LevelBand[],
  totalMaxPoints?: number,
): LevelBand | null {
  if (!bands || bands.length === 0) return null;
  const score =
    totalMaxPoints && totalMaxPoints > 0
      ? Math.round((totalPoints / totalMaxPoints) * 100)
      : totalPoints;
  return (
    bands.find((band) => score >= band.minScore && score <= band.maxScore) ??
    null
  );
}
