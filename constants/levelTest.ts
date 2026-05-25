import { LevelBand } from '@/types';

export const DEFAULT_LEVEL_BANDS: LevelBand[] = [
  {
    level: 'A1',
    label: 'Beginner',
    minScore: 0,
    maxScore: 40,
    description:
      'Can handle basic isolated phrases. Scores in this range mean the student only managed a few correct answers in basic present tenses or simple prepositions.',
  },
  {
    level: 'A2',
    label: 'Elementary',
    minScore: 41,
    maxScore: 80,
    description:
      'Understands sentences of immediate relevance. The student can successfully navigate fundamental tenses (Present Simple, Past Simple), some/any, and simple text negation.',
  },
  {
    level: 'B1',
    label: 'Intermediate',
    minScore: 81,
    maxScore: 120,
    description:
      'Understands standard input on familiar matters. At this tier, the student secures a solid grasp of Section A (Tenses), correctly manages Much/Many, basic Comparatives, and First Conditionals.',
  },
  {
    level: 'B2',
    label: 'Upper-Intermediate',
    minScore: 121,
    maxScore: 160,
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
  { title: 'Grammar', type: 'multiple-choice' as const },
  { title: 'Vocabulary', type: 'multiple-choice' as const },
  { title: 'Reading Comprehension', type: 'true-false' as const },
];

/** Returns the matching LevelBand for a given total score, or null if out of range. */
export function assignLevel(
  totalPoints: number,
  bands: LevelBand[],
): LevelBand | null {
  return (
    bands.find(
      (band) => totalPoints >= band.minScore && totalPoints <= band.maxScore,
    ) ?? null
  );
}
