import { ExerciseContent, Question } from '@/types';

const letterFor = (index: number) => String.fromCharCode(65 + index);

// Fisher-Yates shuffle of 0..length-1
const shuffledIndexes = (length: number): number[] => {
  const indexes = Array.from({ length }, (_, i) => i);
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  return indexes;
};

const isInOrder = (answers: string[]) =>
  answers.every((answer, i) => answer === letterFor(i));

/**
 * Shuffles a matching question's right column (`options`) and remaps its
 * letter answer key to the new positions. Questions whose key isn't a list of
 * single letters pointing into `options` are returned unchanged.
 */
export const shuffleMatchingQuestion = (question: Question): Question => {
  const { options, correctAnswer } = question;
  if (!options || options.length < 2 || !Array.isArray(correctAnswer)) {
    return question;
  }

  const letters = correctAnswer.map((answer) => answer.trim().toUpperCase());
  const originalIndexes = letters.map((letter) => letter.charCodeAt(0) - 65);
  const keyIsValid = letters.every(
    (letter, i) =>
      /^[A-Z]$/.test(letter) && originalIndexes[i] < options.length,
  );
  if (!keyIsValid) return question;

  // Re-roll a few times so the shuffle doesn't land back on A, B, C...
  let order: number[] = [];
  let remapped: string[] = [];
  for (let attempt = 0; attempt < 5; attempt++) {
    order = shuffledIndexes(options.length);
    remapped = originalIndexes.map((original) =>
      letterFor(order.indexOf(original)),
    );
    if (!isInOrder(remapped)) break;
  }

  return {
    ...question,
    options: order.map((i) => options[i]),
    correctAnswer: remapped,
  };
};

export const shuffleMatchingQuestions = (
  content: ExerciseContent,
): Question[] =>
  content.type === 'matching'
    ? content.questions.map(shuffleMatchingQuestion)
    : content.questions;
