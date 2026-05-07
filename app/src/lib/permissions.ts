import type { User, UserRole } from '@/types/auth';

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

/** مطابقة لمصفوفة RolePermission في البذرة؛ تُستعمل عندما لا يوجد permissionsJson على المستخدم */
const ROLE_DEFAULT_PERMISSIONS: Partial<Record<UserRole, readonly string[]>> = {
  admin: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_WRITE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.SETTINGS_WRITE,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.AUDIT_LOG
  ],
  teacher: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_WRITE, PERMISSIONS.ANALYTICS_READ]
};

export function isSuperAdminUser(user: User | null | undefined): boolean {
  return user?.role === 'super_admin';
}

/** قائمة الصلاحيات الفعّالة: المصفوفة المخزنة إن وُجدت، وإلا افتراضيات الدور من seed */
export function effectivePermissions(user: User | null | undefined): string[] {
  if (!user || user.role === 'student') return [];
  if (user.role === 'super_admin') return Object.values(PERMISSIONS);
  if (user.permissions !== undefined) return [...user.permissions];
  return [...(ROLE_DEFAULT_PERMISSIONS[user.role] ?? [])];
}

/** للسوبر أدمن: دائماً true. للطلاب: false. لمدير/معلم: القائمة الفعّالة (مخزّنة أو افتراضيات الدور) */
export function can(user: User | null | undefined, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return effectivePermissions(user).includes(permission);
}
