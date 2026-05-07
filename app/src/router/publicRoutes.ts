import type { RouteRecordRaw } from 'vue-router';

/** صفحات عامة، الهبوط، المصادقة كضيف */
export const publicRoutes: RouteRecordRaw[] = [
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
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordPage.vue'),
    meta: { title: 'استعادة كلمة المرور — إديو نور', requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: { title: 'تعيين كلمة مرور جديدة — إديو نور', requiresGuest: true }
  },
  {
    path: '/two-factor',
    name: 'two-factor',
    component: () => import('@/views/TwoFactorPage.vue'),
    meta: { title: 'التحقق الثنائي — إديو نور', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { title: 'إنشاء حساب — إديو نور', requiresGuest: true }
  }
];
