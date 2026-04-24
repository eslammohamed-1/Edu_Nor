import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Stage } from '@/types/course';
import type { User } from '@/types/auth';
import { subjects as subjectsData } from '@/data/subjects';
import { courses as coursesData } from '@/data/courses';

const COMPLETED_KEY = 'edunor_completed_lessons';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistCompleted(set: Set<string>) {
  localStorage.setItem(COMPLETED_KEY, JSON.stringify([...set]));
}

export const useCoursesStore = defineStore('courses', () => {
  const stageFilter = ref<Stage | 'all'>('all');
  const searchQuery = ref('');
  const completedLessons = ref<Set<string>>(loadCompleted());

  const subjects = computed(() => {
    let filtered = subjectsData;
    if (stageFilter.value !== 'all') {
      filtered = filtered.filter((s) => s.stages.includes(stageFilter.value as Stage));
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
    }
    return filtered;
  });

  const courses = computed(() => coursesData);

  function coursesBySubject(subjectId: string) {
    return coursesData.filter((c) => c.subjectId === subjectId);
  }

  function setStageFilter(stage: Stage | 'all') {
    stageFilter.value = stage;
  }

  /** مزامنة تبويب صفحة المواد مع `user.stage` للطالب (بعد التسجيل أو الـ hydrate) */
  function applyUserStageDefault(user: User | null) {
    if (user === null) {
      stageFilter.value = 'all';
      return;
    }
    if (user.role === 'student' && user.stage) {
      stageFilter.value = user.stage;
    }
  }

  function setSearch(q: string) {
    searchQuery.value = q;
  }

  function markLessonComplete(lessonId: string) {
    completedLessons.value.add(lessonId);
    persistCompleted(completedLessons.value);
  }

  function unmarkLessonComplete(lessonId: string) {
    completedLessons.value.delete(lessonId);
    persistCompleted(completedLessons.value);
  }

  function isLessonComplete(lessonId: string) {
    return completedLessons.value.has(lessonId);
  }

  function courseProgress(courseId: string): number {
    const course = coursesData.find((c) => c.id === courseId);
    if (!course) return 0;
    const allLessons = course.chapters.flatMap((ch) => ch.lessons);
    if (allLessons.length === 0) return 0;
    const done = allLessons.filter((l) => completedLessons.value.has(l.id)).length;
    return Math.round((done / allLessons.length) * 100);
  }

  return {
    stageFilter,
    searchQuery,
    subjects,
    courses,
    completedLessons,
    coursesBySubject,
    setStageFilter,
    applyUserStageDefault,
    setSearch,
    markLessonComplete,
    unmarkLessonComplete,
    isLessonComplete,
    courseProgress
  };
});
