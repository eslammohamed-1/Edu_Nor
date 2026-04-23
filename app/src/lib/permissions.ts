import type { User } from '@/types/auth';

/** وسم صلاحية لاستعمالها لاحقاً في الواجهات (السوبر أدمن عنده الجميع) */
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  CONTENT_DELETE: 'content:delete',
  ANALYTICS_READ: 'analytics:read',
  SETTINGS_WRITE: 'settings:write',
  BILLING_READ: 'billing:read',
  AUDIT_LOG: 'audit:read'
} as const;

export function isSuperAdminUser(user: User | null | undefined): boolean {
  return user?.role === 'super_admin';
}

/** للسوبر أدمن: دائماً true. لبقية الأدوار: فحص القائمة إن وُجدت */
export function can(user: User | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'admin') {
    return user.permissions?.includes(permission) ?? false;
  }
  return false;
}
