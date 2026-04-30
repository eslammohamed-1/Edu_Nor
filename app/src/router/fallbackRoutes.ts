import type { RouteRecordRaw } from 'vue-router';

/** يجب أن يبقى آخر المصفوفة في index */
export const fallbackRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'الصفحة غير موجودة — إديو نور' }
  }
];
