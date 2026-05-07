import type { RouteRecordRaw } from 'vue-router';

/** لوحة الطالب والملف الشخصي — تتطلب تسجيل الدخول */
export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardPage.vue'),
    meta: { title: 'لوحة التحكم — إديو نور', requiresAuth: true }
  },
  {
    path: '/study-plan',
    name: 'study-plan',
    component: () => import('@/views/MyStudyPlanPage.vue'),
    meta: { title: 'خطتي الدراسية — إديو نور', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { title: 'ملفي الشخصي — إديو نور', requiresAuth: true }
  },
  {
    path: '/certificates/:certificateId',
    name: 'certificate',
    component: () => import('@/views/CertificatePage.vue'),
    meta: { title: 'شهادتي — إديو نور', requiresAuth: true }
  }
];
