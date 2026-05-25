export interface DownloadableFile {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  size: number; // in bytes
  categoryId: string;
  exerciseId?: string; // optional - can be linked to specific exercise
  level?: 'beginner' | 'intermediate' | 'advanced'; // optional - difficulty level
  uploadedAt: Date;
  uploadedBy: string; // admin user ID
}

export interface MultiLanguageInstructions {
  en: string;
  es: string;
  fr: string;
  de: string;
  it: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: MultiLanguageInstructions | string; // Support both old and new format
  content: ExerciseContent | LevelTestContent;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  downloadableFiles?: string[]; // array of file IDs
}

export interface ExerciseContent {
  type:
    | 'multiple-choice'
    | 'fill-blanks'
    | 'true-false'
    | 'matching'
    | 'essay'
    | 'short-answer';
  questions: Question[];
}

export interface LevelBand {
  level: string; // e.g. "A1"
  label: string; // e.g. "Beginner"
  minScore: number;
  maxScore: number;
  description?: string;
}

export interface LevelTestSection {
  id: string;
  title: string;
  type:
    | 'multiple-choice'
    | 'fill-blanks'
    | 'true-false'
    | 'matching'
    | 'short-answer';
  questions: Question[];
  maxPoints: number;
}

export interface LevelTestContent {
  type: 'level-test';
  sections: LevelTestSection[];
  levelBands: LevelBand[];
  totalMaxPoints: number;
}

export interface LevelTestSectionScore {
  sectionId: string;
  sectionTitle: string;
  points: number;
  maxPoints: number;
}

export interface LevelTestResult {
  totalPoints: number;
  assignedLevel: string;
  assignedLevelLabel: string;
  sectionScores: LevelTestSectionScore[];
}

export interface Question {
  id: string;
  question: string;
  options?: string[]; // For multiple choice and matching (right column)
  correctAnswer: string | string[];
  explanation?: string;
  // Additional fields for specific question types
  passageText?: string; // For true-false questions with reading passage
  leftColumn?: string[]; // For matching questions (left column items)
  blanksCount?: number; // For fill-blanks questions
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  exercises: Exercise[];
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt?: Date;
  progress: UserProgress[];
  preferredLanguage?: string; // Language code: 'en', 'es', 'fr', 'de', 'it'
  englishLevel?: string; // CEFR level from Level Test, e.g. 'B1'

  // Premium access fields
  hasPremiumAccess?: boolean;
  premiumPurchaseDate?: Date;
  premiumPurchaseToken?: string;
  premiumPurchaseOrderId?: string;
  premiumPurchaseReceipt?: string;
  premiumPlatform?: 'android' | 'ios' | 'web';
}

export interface UserProgress {
  id: string;
  userId: string;
  exerciseId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  levelTestResult?: LevelTestResult;
}
