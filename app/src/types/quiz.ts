export interface QuizOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  grade: string;
  duration: number;
  passingScore: number;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

export interface QuizAttempt {
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  finishedAt: string;
}
