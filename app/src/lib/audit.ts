import { useAdminAuditStore } from '@/stores/admin/adminAudit';
import { useAuthStore } from '@/stores/auth';
import type { UserRole } from '@/types/auth';

export function audit(
  action: string,
  target?: { type: string; id: string; label?: string },
  meta?: Record<string, unknown>
) {
  try {
    const authStore = useAuthStore();
    const auditStore = useAdminAuditStore();
    if (!authStore.user) return;

    auditStore.log({
      actor: {
        id: authStore.user.id,
        name: authStore.user.name,
        role: authStore.user.role
      },
      action,
      target,
      meta,
      ip: '127.0.0.1',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  } catch {}
}

/** Security events بدون مستخدم مسجّل (محاولات دخول فاشلة، إلخ) */
export function auditGuest(
  action: string,
  actor: { id: string; name: string; role: UserRole },
  meta?: Record<string, unknown>
) {
  try {
    const auditStore = useAdminAuditStore();
    auditStore.log({
      actor,
      action,
      meta,
      ip: '127.0.0.1',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    });
  } catch {}
}
