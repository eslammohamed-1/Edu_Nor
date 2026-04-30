import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  StageInfo,
  GradeInfo,
  TermInfo,
  SubjectInfo,
  LessonInfo,
  SectionInfo,
  Stage,
} from '@/types/course';
import type { User } from '@/types/auth';
import curriculumData from '@/fixtures/demo-catalog/generated/curriculum.json';

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

export const useCurriculumStore = defineStore('curriculum', () => {
  // ── State ──
  const stagesCatalog = ref<StageInfo[]>(curriculumData.stages as StageInfo[]);
  const stageFilter = ref<Stage | 'all'>('all');
  const searchQuery = ref('');
  const completedLessons = ref<Set<string>>(loadCompleted());
  const currentUser = ref<User | null>(null);

  // ── Computed: المراحل ──
  const stages = computed(() => stagesCatalog.value);

  // ── Computed: الصفوف (مفلترة حسب المرحلة) ──
  const grades = computed(() => {
    const allGrades: GradeInfo[] = [];
    for (const stage of stagesCatalog.value) {
      if (stageFilter.value !== 'all' && stage.slug !== stageFilter.value) continue;
      allGrades.push(...stage.grades);
    }
    return allGrades;
  });

  // ── Find helpers ──
  function findStageBySlug(slug: Stage): StageInfo | undefined {
    return stagesCatalog.value.find((s) => s.slug === slug);
  }

  function findStageById(id: string): StageInfo | undefined {
    return stagesCatalog.value.find((s) => s.id === id);
  }

  function findGradeById(gradeId: string): GradeInfo | undefined {
    for (const stage of stagesCatalog.value) {
      const g = stage.grades.find((g) => g.id === gradeId);
      if (g) return g;
    }
    return undefined;
  }

  function findTermById(termId: string): TermInfo | undefined {
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        const t = grade.terms.find((t) => t.id === termId);
        if (t) return t;
      }
    }
    return undefined;
  }

  function findSubjectById(subjectId: string): SubjectInfo | undefined {
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        for (const term of grade.terms) {
          const s = term.subjects.find((s) => s.id === subjectId);
          if (s) return s;
        }
      }
    }
    return undefined;
  }

  function findLessonById(lessonId: string): {
    lesson: LessonInfo;
    subject: SubjectInfo;
    term: TermInfo;
    grade: GradeInfo;
    stage: StageInfo;
  } | null {
    if (!lessonId) return null;
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        for (const term of grade.terms) {
          for (const subject of term.subjects) {
            const lesson = subject.lessons.find((l) => l.id === lessonId);
            if (lesson) return { lesson, subject, term, grade, stage };
          }
        }
      }
    }
    return null;
  }

  function findSectionById(sectionId: string): {
    section: SectionInfo;
    lesson: LessonInfo;
    subject: SubjectInfo;
  } | null {
    if (!sectionId) return null;
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        for (const term of grade.terms) {
          for (const subject of term.subjects) {
            for (const lesson of subject.lessons) {
              const section = lesson.sections.find((s) => s.id === sectionId);
              if (section) return { section, lesson, subject };
            }
          }
        }
      }
    }
    return null;
  }

  // ── المواد حسب الصف والترم ──
  function subjectsByGradeAndTerm(gradeId: string, termOrder: number): SubjectInfo[] {
    const grade = findGradeById(gradeId);
    if (!grade) return [];
    const term = grade.terms.find((t) => t.order === termOrder);
    return term?.subjects ?? [];
  }

  // ── المواد حسب المستخدم (الصف + المسار) ──
  function subjectsForUser(user: User | null): SubjectInfo[] {
    if (!user?.stage || !user?.grade) return [];
    const stage = findStageBySlug(user.stage);
    if (!stage) return [];
    const grade = stage.grades.find((g) => g.name === user.grade);
    if (!grade) return [];
    // الترم الأول افتراضياً
    const term = grade.terms.find((t) => t.order === 1);
    return term?.subjects ?? [];
  }

  // ── Navigation ──
  function getAdjacentLessons(lessonId: string): {
    prev: LessonInfo | null;
    next: LessonInfo | null;
  } {
    const found = findLessonById(lessonId);
    if (!found) return { prev: null, next: null };
    const lessons = found.subject.lessons;
    const idx = lessons.findIndex((l) => l.id === lessonId);
    return {
      prev: idx > 0 ? (lessons[idx - 1] ?? null) : null,
      next: idx < lessons.length - 1 ? (lessons[idx + 1] ?? null) : null,
    };
  }

  // ── Progress ──
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

  function subjectProgress(subjectId: string): number {
    const subj = findSubjectById(subjectId);
    if (!subj || subj.lessons.length === 0) return 0;
    const done = subj.lessons.filter((l) => completedLessons.value.has(l.id)).length;
    return Math.round((done / subj.lessons.length) * 100);
  }

  // ── Filters ──
  function setStageFilter(stage: Stage | 'all') {
    stageFilter.value = stage;
  }

  function setSearch(q: string) {
    searchQuery.value = q;
  }

  function applyUserCurriculumContext(user: User | null) {
    currentUser.value = user;
    if (user === null) {
      stageFilter.value = 'all';
      return;
    }
    if (user.role === 'student' && user.stage) {
      stageFilter.value = user.stage;
    }
  }

  // ── Stats ──
  const totalSubjects = computed(() => {
    let count = 0;
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        for (const term of grade.terms) {
          count += term.subjects.length;
        }
      }
    }
    return count;
  });

  const totalLessons = computed(() => {
    let count = 0;
    for (const stage of stagesCatalog.value) {
      for (const grade of stage.grades) {
        for (const term of grade.terms) {
          for (const subj of term.subjects) {
            count += subj.lessons.length;
          }
        }
      }
    }
    return count;
  });

  return {
    // State
    stagesCatalog,
    stageFilter,
    searchQuery,
    completedLessons,
    currentUser,

    // Computed
    stages,
    grades,
    totalSubjects,
    totalLessons,

    // Finders
    findStageBySlug,
    findStageById,
    findGradeById,
    findTermById,
    findSubjectById,
    findLessonById,
    findSectionById,

    // Queries
    subjectsByGradeAndTerm,
    subjectsForUser,
    getAdjacentLessons,

    // Progress
    markLessonComplete,
    unmarkLessonComplete,
    isLessonComplete,
    subjectProgress,

    // Filters
    setStageFilter,
    setSearch,
    applyUserCurriculumContext,
  };
});
