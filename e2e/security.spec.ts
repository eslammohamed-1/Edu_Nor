import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'http://127.0.0.1:3001';

async function apiHealthy(): Promise<boolean> {
  try {
    const r = await fetch(`${API}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

test.describe('Security API (U2)', () => {
  test.beforeAll(async () => {
    test.skip(!(await apiHealthy()), `تشغيل السيرفر مطلوب على ${API} (أو عيّن E2E_API_URL)`);
  });

  test('forgot-password يعيد ok دون كشف وجود المستخدم', async ({ request }) => {
    const r = await request.post(`${API}/api/v1/auth/forgot`, {
      data: { email: 'nonexistent-user@example.invalid' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(r.ok()).toBeTruthy();
    const j = (await r.json()) as { ok?: boolean };
    expect(j.ok).toBe(true);
  });

  test('تسجيل دخول خاطئ متكرر ينتج 423 بعد عتبة القفل', async ({ request }) => {
    const email = `lockout-${Date.now()}@e2e.test`;

    for (let i = 0; i < 5; i++) {
      const r = await request.post(`${API}/api/v1/auth/login`, {
        data: { email, password: 'WrongPassword!999' },
        headers: { 'Content-Type': 'application/json' }
      });
      expect(r.status()).toBe(401);
    }

    const locked = await request.post(`${API}/api/v1/auth/login`, {
      data: { email, password: 'WrongPassword!999' },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(locked.status()).toBe(423);
    const body = (await locked.json()) as { error?: string; lockedUntil?: string };
    expect(body.error).toBeTruthy();
    expect(body.lockedUntil).toBeTruthy();
  });

  test('إعادة التعيين برمز غير صالح ترجع 400', async ({ request }) => {
    const r = await request.post(`${API}/api/v1/auth/reset`, {
      data: {
        token: 'invalid-token-xxxxxxxxxxxxxxxxxx',
        password: 'NewSecure9#Pass',
        confirmPassword: 'NewSecure9#Pass'
      },
      headers: { 'Content-Type': 'application/json' }
    });
    expect(r.status()).toBe(400);
  });
});

test.describe('Forgot password page (UI)', () => {
  test('صفحة نسيت كلمة المرور تُحمَّل', async ({ page, baseURL }) => {
    test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL غير مضبوط');

    let appUp = false;
    try {
      const r = await fetch(baseURL);
      appUp = r.ok;
    } catch {
      appUp = false;
    }
    test.skip(!appUp, `شغّل الواجهة على ${baseURL} لهذا الاختبار`);

    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"], input[inputmode="email"]').first()).toBeVisible();
  });
});
