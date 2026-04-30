/**
 * بيانات دخول السوبر أدمن تستخدم فقط في وضع الـ mock المحلي.
 * في الإنتاج لا يجب أن تعتمد الواجهة على أي كلمة مرور مضمّنة داخل الـ bundle.
 */
export const SUPER_ADMIN_EMAIL =
  (import.meta.env.VITE_SUPER_ADMIN_EMAIL as string | undefined)?.trim() ||
  'superadmin@edunor.local';

export const SUPER_ADMIN_PASSWORD =
  (import.meta.env.VITE_SUPER_ADMIN_PASSWORD as string | undefined) ||
  (import.meta.env.DEV ? 'EduNorSuper2026!' : '');

export const ENABLE_MOCK_AUTH =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true';

export function isSuperAdminCredentials(email: string, password: string): boolean {
  if (!ENABLE_MOCK_AUTH || !SUPER_ADMIN_PASSWORD) return false;
  return (
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() &&
    password === SUPER_ADMIN_PASSWORD
  );
}
