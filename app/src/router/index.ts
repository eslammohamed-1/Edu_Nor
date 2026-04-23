import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'إديو نور — منصتك التعليمية' }
  },
  {
    path: '/design-system',
    name: 'design-system',
    component: () => import('@/views/DesignSystem.vue'),
    meta: { title: 'نظام التصميم — إديو نور' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { title: 'تسجيل الدخول — إديو نور', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { title: 'إنشاء حساب — إديو نور', requiresGuest: true }
  },
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
    meta: { title: 'كورسات المادة — إديو نور' }
  },
  {
    path: '/courses/:courseId',
    name: 'course',
    component: () => import('@/views/CoursePage.vue'),
    meta: { title: 'تفاصيل الكورس — إديو نور' }
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
  },
  {
    path: '/admin',
    component: () => import('@/components/admin/layout/AdminLayout.vue'),
    meta: { requiresSuperAdmin: true },
    children: [
      {
        path: '',
        name: 'admin',
        component: () => import('@/views/admin/AdminDashboard.vue'),
        meta: { title: 'لوحة التحكم — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/AdminUsers.vue'),
        meta: { title: 'إدارة المستخدمين — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'users/:id',
        name: 'admin-user-detail',
        component: () => import('@/views/admin/AdminUserDetail.vue'),
        meta: { title: 'تفاصيل المستخدم — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'subjects',
        name: 'admin-subjects',
        component: () => import('@/views/admin/AdminSubjects.vue'),
        meta: { title: 'المواد الدراسية — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('@/views/admin/AdminCourses.vue'),
        meta: { title: 'الكورسات — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'lessons',
        name: 'admin-lessons',
        component: () => import('@/views/admin/AdminLessons.vue'),
        meta: { title: 'الدروس — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'quizzes',
        name: 'admin-quizzes',
        component: () => import('@/views/admin/AdminQuizzes.vue'),
        meta: { title: 'الاختبارات — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'quizzes/:id/edit',
        name: 'admin-quiz-builder',
        component: () => import('@/views/admin/AdminQuizBuilder.vue'),
        meta: { title: 'محرر الاختبار — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/views/admin/AdminAnalytics.vue'),
        meta: { title: 'الإحصائيات — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('@/views/admin/AdminSettings.vue'),
        meta: { title: 'الإعدادات — إديو نور', requiresSuperAdmin: true }
      },
      {
        path: 'audit',
        name: 'admin-audit',
        component: () => import('@/views/admin/AdminAudit.vue'),
        meta: { title: 'سجل التدقيق — إديو نور', requiresSuperAdmin: true }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { title: 'لوحة التحكم — إديو نور', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { title: 'ملفي الشخصي — إديو نور', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'الصفحة غير موجودة — إديو نور' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.hydrate();

  if (to.meta.requiresSuperAdmin) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (!auth.isSuperAdmin) {
      return { name: 'home' };
    }
  } else if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return { name: auth.isSuperAdmin ? 'admin' : 'dashboard' };
  }

  return true;
});

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'إديو نور';
  document.title = title;
});

export default router;
