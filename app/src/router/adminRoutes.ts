import type { RouteRecordRaw } from 'vue-router';

/** لوحة السوبر أدمن — مسار أب مع أطفال */
export const adminRoute: RouteRecordRaw = {
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
    },
    {
      path: 'security',
      name: 'admin-security',
      component: () => import('@/views/admin/AdminSecurity.vue'),
      meta: { title: 'الأمان والجلسات — إديو نور', requiresSuperAdmin: true }
    }
  ]
};
