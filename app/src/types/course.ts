export type Stage = 'primary' | 'prep' | 'secondary';
export type LessonType = 'video' | 'reading' | 'quiz';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  stages: Stage[];
  description: string;
  lessonsCount: number;
  coursesCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: LessonType;
  videoUrl?: string;
  content: string;
  keyPoints?: string[];
  order: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  subjectId: string;
  /** يربط الكورس بعرض منهج (معرف 12 رقم) من curriculumOfferings */
  offeringId?: string;
  title: string;
  description: string;
  stage: Stage;
  grade: string;
  /** ثانوي: المسار إن وُجد */
  secondaryTrack?: 'scientific_ar' | 'scientific_languages' | 'literary';
  /** من استيراد ToC (Excel) */
  academicYear?: string;
  term?: number;
  season?: number;
  instructor: string;
  thumbnail?: string;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  progress?: number;
  chapters: Chapter[];
}

export interface CourseFilters {
  stage: Stage | 'all';
  search: string;
}
