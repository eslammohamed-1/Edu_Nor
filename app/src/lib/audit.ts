import { useAdminAuditStore } from '@/stores/admin/adminAudit';
import { useAuthStore } from '@/stores/auth';

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
      ip: '127.0.0.1'
    });
  } catch {}
}
