export interface DownloadableFile {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  size: number; // in bytes
  categoryId: string;
  exerciseId?: string; // optional - can be linked to specific exercise
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
  content: ExerciseContent;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  downloadableFiles?: string[]; // array of file IDs
}

export interface ExerciseContent {
  type: 'multiple-choice' | 'fill-blanks' | 'true-false' | 'matching' | 'essay' | 'short-answer';
  questions: Question[];
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
  progress: UserProgress[];
  preferredLanguage?: string; // Language code: 'en', 'es', 'fr', 'de', 'it'
}

export interface UserProgress {
  exerciseId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
}
