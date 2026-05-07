import { apiFetch } from '@/services/http/client';

export interface StudyPlanNext {
  lessonId: string;
  title: string;
  duration: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  courseId: string;
  chapterId: string;
}

export interface StudyPlanLessonItem {
  lessonId: string;
  title: string;
  duration: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  status: 'not_started' | 'in_progress' | 'completed';
  isNext: boolean;
}

export interface StudyPlanResponse {
  nextLesson: StudyPlanNext | null;
  items: StudyPlanLessonItem[];
}

export async function fetchStudyPlan(): Promise<StudyPlanResponse> {
  const res = await apiFetch('/api/v1/me/study-plan');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `study-plan failed: ${res.status}`);
  }
  return res.json() as Promise<StudyPlanResponse>;
}
