import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Exercise, UserProgress } from '@/types';

export const exportExerciseResults = async (
  exercise: Exercise,
  answers: { [questionId: string]: string },
  score: number
): Promise<void> => {
  try {
    // Generate a detailed results report
    const report = generateResultsReport(exercise, answers, score);

    // Create a file
    const fileName = `${exercise.title.replace(/[^a-zA-Z0-9]/g, '_')}_results.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, report);

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting results:', error);
    throw error;
  }
};

export const exportUserProgress = async (
  userProgress: UserProgress[],
  userName: string
): Promise<void> => {
  try {
    const report = generateProgressReport(userProgress, userName);

    const fileName = `${userName.replace(/[^a-zA-Z0-9]/g, '_')}_progress.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, report);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting progress:', error);
    throw error;
  }
};

const generateResultsReport = (
  exercise: Exercise,
  answers: { [questionId: string]: string },
  score: number
): string => {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  let report = `ESL EXERCISES - EXERCISE RESULTS\n`;
  report += `=====================================\n\n`;
  report += `Exercise: ${exercise.title}\n`;
  report += `Description: ${exercise.description}\n`;
  report += `Category: ${exercise.category}\n`;
  report += `Difficulty: ${exercise.difficulty}\n`;
  report += `Completed: ${date} at ${time}\n`;
  report += `Final Score: ${score}%\n\n`;

  report += `DETAILED RESULTS:\n`;
  report += `=================\n\n`;

  exercise.content.questions.forEach((question, index) => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer === question.correctAnswer;

    report += `Question ${index + 1}:\n`;
    report += `${question.question}\n\n`;

    if (question.options) {
      report += `Options:\n`;
      question.options.forEach((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        report += `  ${letter}) ${option}\n`;
      });
      report += `\n`;
    }

    report += `Your Answer: ${userAnswer}\n`;
    report += `Correct Answer: ${question.correctAnswer}\n`;
    report += `Result: ${isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}\n`;

    if (question.explanation) {
      report += `Explanation: ${question.explanation}\n`;
    }

    report += `\n${'─'.repeat(50)}\n\n`;
  });

  report += `SUMMARY:\n`;
  report += `========\n`;
  const correctCount = exercise.content.questions.filter(q =>
    answers[q.id] === q.correctAnswer
  ).length;
  const totalQuestions = exercise.content.questions.length;

  report += `Correct Answers: ${correctCount}/${totalQuestions}\n`;
  report += `Percentage: ${score}%\n`;

  if (score >= 80) {
    report += `Grade: Excellent! Keep up the great work!\n`;
  } else if (score >= 60) {
    report += `Grade: Good job! Continue practicing to improve.\n`;
  } else {
    report += `Grade: Keep studying and try again. You'll improve with practice!\n`;
  }

  return report;
};

const generateProgressReport = (
  userProgress: UserProgress[],
  userName: string
): string => {
  const date = new Date().toLocaleDateString();

  let report = `ESL EXERCISES - PROGRESS REPORT\n`;
  report += `===============================\n\n`;
  report += `Student: ${userName}\n`;
  report += `Report Generated: ${date}\n\n`;

  const completedExercises = userProgress.filter(p => p.completed);
  const totalAttempted = userProgress.length;
  const averageScore = completedExercises.length > 0
    ? Math.round(completedExercises.reduce((sum, p) => sum + (p.score || 0), 0) / completedExercises.length)
    : 0;

  report += `OVERVIEW:\n`;
  report += `=========\n`;
  report += `Total Exercises Attempted: ${totalAttempted}\n`;
  report += `Completed Exercises: ${completedExercises.length}\n`;
  report += `Average Score: ${averageScore}%\n\n`;

  report += `DETAILED PROGRESS:\n`;
  report += `==================\n\n`;

  completedExercises.forEach((progress, index) => {
    report += `${index + 1}. Exercise ID: ${progress.exerciseId}\n`;
    report += `   Score: ${progress.score}%\n`;
    if (progress.completedAt) {
      report += `   Completed: ${progress.completedAt.toLocaleDateString()}\n`;
    }
    report += `\n`;
  });

  return report;
};