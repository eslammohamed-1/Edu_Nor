import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { publicRoutes } from '@/router/publicRoutes';
import { learningRoutes } from '@/router/learningRoutes';
import { studentRoutes } from '@/router/studentRoutes';
import { adminRoute } from '@/router/adminRoutes';
import { fallbackRoutes } from '@/router/fallbackRoutes';

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...learningRoutes,
  adminRoute,
  ...studentRoutes,
  ...fallbackRoutes
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  // إعادة قراءة الجلسة من التخزين فقط عند الحاجة (صفحات محمية أو ضيوف فقط)
  const needsAuthCheck = !!(to.meta.requiresAuth || to.meta.requiresSuperAdmin || to.meta.requiresGuest);
  if (needsAuthCheck) {
    auth.hydrate();
  }

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
