export type Stage = 'primary' | 'prep' | 'secondary';
export type LessonType = 'video' | 'reading' | 'quiz' | 'revision';
export type SessionType = 'Regular' | 'Revision';
export type SectionType = 'Regular' | 'Revision' | 'Exercise' | 'Quiz';

// ──────────────────────────────────────────────
// المنهج: Stage → Grade → Term → Subject → Lesson → Section
// كل ID عبارة عن 12 رقم عشوائي
// ──────────────────────────────────────────────

export interface StageInfo {
  id: string;
  name: string;       // ابتدائي / إعدادي / ثانوي
  slug: Stage;
  order: number;
  grades: GradeInfo[];
}

export interface GradeInfo {
  id: string;
  stageId: string;
  name: string;       // الصف الأول الابتدائي
  order: number;      // 1-6
  terms: TermInfo[];
}

export interface TermInfo {
  id: string;
  gradeId: string;
  name: string;       // الترم الأول / الترم الثاني
  order: number;      // 1 أو 2
  track?: string | null;
  subjects: SubjectInfo[];
}

export interface SubjectInfo {
  id: string;
  termId: string;
  name: string;       // اللغة العربية
  slug: string;       // arabic
  icon: string;
  color: string;
  order: number;
  lessons: LessonInfo[];
}

export interface LessonInfo {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  duration: number;
  type: string;
  videoUrl?: string | null;
  content: string;
  order: number;
  unitTitle?: string | null;
  sessionType: SessionType;
  sections: SectionInfo[];
}

export interface SectionInfo {
  id: string;
  lessonId: string;
  title: string;
  type: SectionType;
  content: string;
  duration: number;
  order: number;
  hasQuiz: boolean;
  hasWorksheet: boolean;
}

// ──────────────────────────────────────────────
// Filters
// ──────────────────────────────────────────────
export interface CurriculumFilters {
  stage: Stage | 'all';
  search: string;
}
