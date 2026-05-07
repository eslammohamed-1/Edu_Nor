import { test, expect } from '@playwright/test';

function loginCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_LOGIN_EMAIL?.trim();
  const password = process.env.E2E_LOGIN_PASSWORD;
  if (email && password) return { email, password };
  if (process.env.CI) return null;
  return {
    email: 'admin@edunor.local',
    password: 'AdminDemo2026!'
  };
}

async function appReachable(baseURL: string | undefined): Promise<boolean> {
  if (!baseURL) return false;
  try {
    const r = await fetch(baseURL);
    return r.ok;
  } catch {
    return false;
  }
}

test.describe('تسجيل الدخول (عينة U7)', () => {
  test('صفحة الدخول تُعرض النموذج', async ({ page, baseURL }) => {
    test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL غير مضبوط');
    test.skip(!(await appReachable(baseURL)), `شغّل الواجهة على ${baseURL}`);

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'تسجيل الدخول' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /البريد الإلكتروني/i })).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /كلمة المرور/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
  });

  test('إرسال ناجح يغادر صفحة الدخول', async ({ page, baseURL }) => {
    const creds = loginCredentials();
    test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL غير مضبوط');
    test.skip(
      !creds,
      'في CI عيّن E2E_LOGIN_EMAIL و E2E_LOGIN_PASSWORD (مستخدم موجود بعد seed)'
    );
    test.skip(!(await appReachable(baseURL)), `شغّل الواجهة على ${baseURL}`);

    await page.goto('/login');
    await page.getByRole('textbox', { name: /البريد الإلكتروني/i }).fill(creds.email);
    await page.getByRole('textbox', { name: /كلمة المرور/i }).fill(creds.password);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

    await expect(page).not.toHaveURL(/\/login(\?|$)/, { timeout: 30_000 });
    const url = page.url();
    expect(
      url.includes('/dashboard') ||
        url.includes('/admin') ||
        url.includes('/onboarding') ||
        url.includes('/two-factor')
    ).toBeTruthy();
  });
});
