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
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { title: 'ملفي الشخصي — إديو نور', requiresAuth: true }
  }
];
