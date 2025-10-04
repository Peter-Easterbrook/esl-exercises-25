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

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  content: ExerciseContent;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  downloadableFiles?: string[]; // array of file IDs
}

export interface ExerciseContent {
  type: 'multiple-choice' | 'fill-blanks' | 'true-false' | 'matching' | 'essay';
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  explanation?: string;
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
}

export interface UserProgress {
  exerciseId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
}
