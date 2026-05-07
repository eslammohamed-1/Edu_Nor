import { defineConfig, devices } from '@playwright/test';

/**
 * تشغيل الـ E2E:
 * 1) شغّل قاعدة البيانات والترحيلات (`npm run db:up && npm run db:migrate --prefix server`)
 * 2) شغّل السيرفر: `npm run dev:server`
 * 3) شغّل الواجهة (لاختبارات الصفحات): `npm run dev:app`
 * 4) `npm run test:e2e`
 *
 * متغيرات: E2E_API_URL (افتراضي http://127.0.0.1:3001), PLAYWRIGHT_BASE_URL (5173 للواجهة)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173',
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
