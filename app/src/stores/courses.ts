import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Stage } from '@/types/course';
import type { User } from '@/types/auth';
import { courses as coursesData } from '@/fixtures/demo-catalog/courses';
import { getDisplayedSubjects } from '@/lib/curriculumFilter';

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
  /** all = كتالوج كما في التبويب؛ my = مواد الصف/المسار حسب المنهج */
  const subjectsScope = ref<'all' | 'my'>('all');
  const completedLessons = ref<Set<string>>(loadCompleted());
  const subjectsFilterUser = ref<User | null>(null);

  const subjects = computed(() => {
    const list = getDisplayedSubjects({
      user: subjectsFilterUser.value,
      subjectsScope: subjectsScope.value,
      stageFilter: stageFilter.value,
      searchQuery: searchQuery.value
    });

    // 1. تصفية القائمة الأساسية للمواد
    const filteredList = list.map(s => {
      let filteredCourses = coursesData.filter(c => c.subjectId === s.id);

      if (subjectsScope.value === 'my' && subjectsFilterUser.value) {
        const user = subjectsFilterUser.value;
        filteredCourses = filteredCourses.filter(c => {
          const gradeMatch = c.stage === user.stage && c.grade === user.grade;
          if (!gradeMatch) return false;
          
          // فلترة المسار (علمي/أدبي) للمرحلة الثانوية
          if (user.stage === 'secondary' && user.secondaryTrack && c.secondaryTrack) {
            return c.secondaryTrack === user.secondaryTrack;
          }
          return true;
        });
      } else if (stageFilter.value !== 'all') {
        filteredCourses = filteredCourses.filter(c => c.stage === stageFilter.value);
      } else {
        return s;
      }

      const lessonsCount = filteredCourses.reduce((acc, c) => acc + (c.lessonsCount || 0), 0);
      
      return {
        ...s,
        coursesCount: filteredCourses.length,
        lessonsCount: lessonsCount
      };
    });

    // 2. إخفاء المواد التي ليس لها محتوى نهائياً لهذه السنة/المرحلة المفلترة
    // هذا يمنع ظهور "مواد ثانوي" لا تخص الصف الثالث مثلاً
    return filteredList.filter(s => s.coursesCount > 0);
  });

  const courses = computed(() => coursesData);

  function coursesBySubject(subjectId: string) {
    return coursesData.filter((c) => c.subjectId === subjectId);
  }

  function filteredCoursesBySubject(subjectId: string) {
    let list = coursesBySubject(subjectId);

    if (subjectsScope.value === 'my' && subjectsFilterUser.value) {
      const user = subjectsFilterUser.value;
      list = list.filter(c => {
        const gradeMatch = c.stage === user.stage && c.grade === user.grade;
        if (!gradeMatch) return false;
        
        // فلترة المسار (علمي/أدبي) للمرحلة الثانوية
        if (user.stage === 'secondary' && user.secondaryTrack && c.secondaryTrack) {
          return c.secondaryTrack === user.secondaryTrack;
        }
        return true;
      });
    } else if (stageFilter.value !== 'all') {
      list = list.filter(c => c.stage === stageFilter.value);
    }
    return list;
  }

  function setStageFilter(stage: Stage | 'all') {
    stageFilter.value = stage;
  }

  function setSubjectsScope(scope: 'all' | 'my') {
    subjectsScope.value = scope;
  }

  function setSubjectsFilterUser(user: User | null) {
    subjectsFilterUser.value = user;
  }

  /**
   * مزامنة صفحة المواد مع بيانات الطالب (تبويب + «موادي») بعد التسجيل أو الـ hydrate.
   * يفترض مناداتها دوماً مع `user` الحالي حتى تُفلتر «موادي» بشكل صحيح.
   */
  function applyUserCurriculumContext(user: User | null) {
    subjectsFilterUser.value = user;
    if (user === null) {
      stageFilter.value = 'all';
      subjectsScope.value = 'all';
      return;
    }
    if (user.role === 'student' && user.stage) {
      stageFilter.value = user.stage;
      subjectsScope.value = 'my';
    } else {
      subjectsScope.value = 'all';
    }
  }

  /** @deprecated استخدم applyUserCurriculumContext */
  function applyUserStageDefault(user: User | null) {
    applyUserCurriculumContext(user);
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
    subjectsScope,
    subjects,
    courses,
    completedLessons,
    coursesBySubject,
    filteredCoursesBySubject,
    setStageFilter,
    setSubjectsScope,
    setSubjectsFilterUser,
    applyUserCurriculumContext,
    applyUserStageDefault,
    setSearch,
    markLessonComplete,
    unmarkLessonComplete,
    isLessonComplete,
    courseProgress
  };
});
