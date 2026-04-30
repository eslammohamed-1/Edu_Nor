import type { RouteRecordRaw } from 'vue-router';

/** تصفّح المحتوى التعليمي (مواد، دروس، اختبارات) */
export const learningRoutes: RouteRecordRaw[] = [
  {
    path: '/subjects',
    name: 'subjects',
    component: () => import('@/views/SubjectsPage.vue'),
    meta: { title: 'المواد الدراسية — إديو نور' }
  },
  {
    path: '/subjects/:subjectSlug',
    name: 'subject',
    component: () => import('@/views/CoursePage.vue'),
    meta: { title: 'المادة — إديو نور' }
  },
  {
    path: '/lessons/:lessonId',
    name: 'lesson',
    component: () => import('@/views/LessonPage.vue'),
    meta: { title: 'الدرس — إديو نور' }
  },
  {
    path: '/quiz',
    name: 'quiz-list',
    component: () => import('@/views/QuizPage.vue'),
    meta: { title: 'الاختبارات — إديو نور' }
  },
  {
    path: '/quiz/:quizId',
    name: 'quiz',
    component: () => import('@/views/QuizPage.vue'),
    meta: { title: 'اختبار — إديو نور' }
  }
];
