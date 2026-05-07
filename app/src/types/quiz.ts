export interface QuizOption {
  id: string;
  label: string;
}

export type QuestionType = 'ordering' | 'mcq' | 'mrq' | 'matching' | 'gap' | 'string' | 'input' | 'frq' | 'counting' | 'puzzle' | 'opinion' | 'gmrq' | 'multipart';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  stem: string;
  explanation?: string;
  points?: number;
}

export interface Choice {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface McqQuestion extends BaseQuestion {
  type: 'mcq' | 'mrq' | 'opinion';
  choices: Choice[];
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  choices: Choice[]; // مرتبة بالترتيب الصحيح
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface GapQuestion extends BaseQuestion {
  /** استخدم `@BLANK` في النص لكل فراغ. الإجابات الصحيحة تُعرّف بـ isCorrect في choices بنفس ترتيب ظهور الفراغات من اليسار لليمين (لعدة فراغات). */
  type: 'gap';
  choices: Choice[]; // الفراغات الصحيحة والخاطئة
}

export interface StringQuestion extends BaseQuestion {
  type: 'string' | 'frq';
  answer: string;
}

export interface InputQuestion extends BaseQuestion {
  type: 'input' | 'counting';
  answer: string;
  unit?: string;
}

export interface PuzzlePiece {
  id: string;
  url: string;
}

export interface PuzzleQuestion extends BaseQuestion {
  type: 'puzzle';
  pieces: PuzzlePiece[];
  solution: string[]; // ترتيب الـ IDs
  completeImage: string;
}

export interface GmrqQuestion extends BaseQuestion {
  type: 'gmrq';
  groups: { name: string; choices: Choice[] }[];
}

export interface MultipartQuestion extends BaseQuestion {
  type: 'multipart';
  statement: string;
  parts: AnyQuestion[];
}

export type AnyQuestion = 
  | McqQuestion 
  | OrderingQuestion 
  | MatchingQuestion 
  | GapQuestion 
  | StringQuestion 
  | InputQuestion 
  | PuzzleQuestion 
  | GmrqQuestion 
  | MultipartQuestion;


export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  grade: string;
  lessonId?: string;
  duration: number;
  passingScore: number;
  questions: AnyQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string;
  arrayAnswer?: string[];
  isCorrect: boolean;
}

/** غلاف الإجابة للـ API والتخزين الموحّد — انظر `schemas/quizAnswerPayload.ts`. */
export type { QuizAnswerEnvelopeV1 } from '@/schemas/quizAnswerPayload';

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
