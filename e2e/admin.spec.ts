import { test, expect } from '@playwright/test';
import { apiReachable, appReachable, DEFAULT_API } from './helpers';

/**
 * مسار مشرف سعيد (U7-011): دخول سوبر أدمن → الدروس → تعديل عنوان → نشر/مسودة.
 * تحرير المحتوى يُخزَّن محلياً أو عبر لقطة الإدارة إن وُجد API؛ صفحة الدرس للزائر تبقى من منهج JSON الثابت.
 */
test.describe('مسار الإدارة (دخول — تعديل درس — حالة النشر)', () => {
  test('تعديل عنوان درس وإبراز حالة النشر، ثم التحقق من عرض الدرس للجميع', async ({
    page,
    baseURL
  }) => {
    test.skip(!baseURL, 'PLAYWRIGHT_BASE_URL غير مضبوط');
    test.skip(!(await appReachable(baseURL)), `شغّل الواجهة على ${baseURL}`);
    test.skip(!(await apiReachable()), `شغّل الـ API على ${DEFAULT_API} لتسجيل دخول السوبر أدمن`);

    const superEmail =
      process.env.E2E_SUPER_ADMIN_EMAIL?.trim() ?? 'superadmin@edunor.local';
    const superPassword =
      process.env.E2E_SUPER_ADMIN_PASSWORD ?? 'EduNorSuper2026!';

    await page.goto('/login');
    await page.getByRole('textbox', { name: /البريد الإلكتروني/i }).fill(superEmail);
    await page.getByRole('textbox', { name: /كلمة المرور/i }).fill(superPassword);
    await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 45_000 });

    await page.goto(`${baseURL?.replace(/\/$/, '')}/admin/lessons`);

    const subjectSelect = page.locator('.lesson-filters select.field-input').first();
    await expect(subjectSelect).toBeVisible({ timeout: 30_000 });

    const hasArabic = await subjectSelect
      .evaluate((el: HTMLSelectElement) =>
        [...el.options].some((o) => o.text.includes('اللغة العربية'))
      )
      .catch(() => false);

    if (hasArabic) {
      await subjectSelect.selectOption({ label: 'اللغة العربية' });
    } else {
      await subjectSelect.selectOption({ index: 1 });
    }

    await expect(page.locator('.lesson-row').first()).toBeVisible({ timeout: 30_000 });

    const firstRow = page.locator('.lesson-row').first();
    const pill = firstRow.locator('.status-pill');
    const initialText = (await pill.textContent())?.trim() ?? '';
    expect(initialText).toMatch(/منشور|مسودة/);

    await firstRow.locator('.lesson-actions .action-btn').nth(0).click();
    await expect(pill).not.toHaveText(initialText);

    await firstRow.locator('.lesson-actions .action-btn').nth(0).click();
    await expect(pill).toHaveText(initialText);

    const marker = ` [E2E-${Date.now()}]`;
    await firstRow.getByTitle('تعديل').click();
    const titleInput = page.locator('.modal-body .field-input').first();
    await expect(titleInput).toBeVisible();
    const prev = await titleInput.inputValue();
    await titleInput.fill(`${prev}${marker}`);
    await page.getByRole('button', { name: 'حفظ التغييرات' }).click();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    await expect(firstRow.locator('.lesson-title')).toContainText(marker.trim());

    await page.goto(`${baseURL?.replace(/\/$/, '')}/lessons/638013161698`);
    await expect(page.locator('.lesson-title').first()).toBeVisible({ timeout: 20_000 });
  });
});
