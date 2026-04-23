/**
 * بيانات دخول السوبر أدين (وضع التطوير + إمكانية تغييرها عبر .env)
 * في الإنتاج: عيّن VITE_SUPER_ADMIN_EMAIL و VITE_SUPER_ADMIN_PASSWORD ولا ترفع .env
 */
export const SUPER_ADMIN_EMAIL =
  (import.meta.env.VITE_SUPER_ADMIN_EMAIL as string | undefined)?.trim() ||
  'superadmin@edunor.local';

export const SUPER_ADMIN_PASSWORD =
  (import.meta.env.VITE_SUPER_ADMIN_PASSWORD as string | undefined) || 'EduNorSuper2026!';

export function isSuperAdminCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() &&
    password === SUPER_ADMIN_PASSWORD
  );
}
