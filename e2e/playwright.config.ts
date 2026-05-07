import { defineConfig, devices } from '@playwright/test';

/**
 * إعداد Playwright (U7-009). الملف يعيش تحت `e2e/` ليعمل `testDir` كمجلد الاختبارات.
 *
 * تشغيل يدوي:
 * 1) قاعدة البيانات + ترحيلات + seed (`docker-compose.staging` أو PostgreSQL محلي)
 * 2) `npm run dev:server`
 * 3) `npm run dev:app`
 * 4) `npm run test:e2e`
 *
 * متغيرات:
 * - `PLAYWRIGHT_BASE_URL` — الواجهة (افتراضي http://127.0.0.1:5173)
 * - `E2E_API_URL` — الـ API لاختبارات الطلبات (افتراضي http://127.0.0.1:3001)
 * - `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` — اختبار الدخول الكامل (أو الافتراضيات التالية محلياً دون CI)
 * - `E2E_SUPER_ADMIN_EMAIL` / `E2E_SUPER_ADMIN_PASSWORD` — مسار الإدارة (افتراضي seed: superadmin@edunor.local / EduNorSuper2026!)
 *
 * تثبيت المتصفح: `npm run test:e2e:install`
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    locale: 'ar',
    actionTimeout: 15_000
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
