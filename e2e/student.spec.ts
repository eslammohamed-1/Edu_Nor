import { test, expect } from '@playwright/test';
import { apiReachable, appReachable, DEFAULT_API } from './helpers';

/**
 * مسار طالب سعيد (U7-010): تسجيل → إرشاد → درس من المنهج المحلي → اختبار تجريبي.
 * يتطلّب واجهة + API (تسجيل وإرشاد). الاختبار النهائي يعمل محلياً حتى لو فشل الـ sync مع الخادم.
 */
test.describe.configure({ mode: 'serial' });

test.describe('مسار الطالب (تسجيل — إرشاد — درس — نتيجة)', () => {
  test('من الحساب الجديد حتى نتيجة اختبار', async ({ page, baseURL }) => {
    test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL غير مضبوط');
    test.skip(!(await appReachable(baseURL)), `شغّل الواجهة على ${baseURL}`);
    test.skip(!(await apiReachable()), `شغّل الـ API على ${DEFAULT_API} (E2E_API_URL)`);

    const stamp = Date.now();
    const email = `e2e-stu-${stamp}@e2e.test`;
    const password = 'Aa1!e2eStudent';
    const name = 'طالب تجريبي E2E';
    const phone = '01234567890';

    await page.goto('/register');

    await page.getByRole('button', { name: 'ابتدائي' }).click();
    await page.getByRole('button', { name: 'الصف الأول الابتدائي' }).click();

    await page.getByRole('textbox', { name: /الاسم الكامل/i }).fill(name);
    await page.getByRole('textbox', { name: /البريد الإلكتروني/i }).fill(email);
    await page.getByRole('textbox', { name: /رقم التليفون/i }).fill(phone);
    await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
    await page.getByLabel('تأكيد كلمة المرور').fill(password);
    await page.getByRole('button', { name: 'إنشاء الحساب' }).click();

    await expect(page).toHaveURL(/\/onboarding/, { timeout: 60_000 });

    await page.getByRole('button', { name: 'التالي' }).click();

    const arabic = page.getByRole('button', { name: 'اللغة العربية' });
    await expect(arabic.first()).toBeVisible();
    await arabic.first().click();
    await page.getByRole('button', { name: 'التالي' }).click();

    await page.getByRole('button', { name: 'التالي' }).click();
    await page.getByRole('button', { name: 'التالي' }).click();
    await page.getByRole('button', { name: 'ابدأ التعلّم' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60_000 });

    await page.goto('/lessons/638013161698');
    await expect(page.locator('.lesson-title').first()).toContainText('التهيئة', {
      timeout: 30_000
    });

    await page.goto('/quiz/history-quiz-1');
    await expect(page.locator('.question-text').first()).toBeVisible({ timeout: 30_000 });

    await page
      .getByRole('button', { name: /قطع طريق التجارة على إنجلترا إلى الهند/i })
      .click();

    await page.getByRole('button', { name: 'تسليم الاختبار' }).click();

    await expect(page.getByRole('heading', { name: /تهانينا|نجحت/ })).toBeVisible({
      timeout: 30_000
    });
    await expect(page.locator('.ring-percentage')).toContainText('100');
  });
});
