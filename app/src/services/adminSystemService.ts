import { apiFetch, getApiBase } from '@/services/http/client';
import type { AuditEntry } from '@/stores/admin/adminAudit';
import type { AdminSessionRow } from '@/types/adminSession';
import type { StoredAuthPayload } from '@/lib/authStorage';
import type { User } from '@/types/auth';

export async function fetchAdminSnapshot<T>(key: string): Promise<T | null> {
  if (!getApiBase()) return null;
  const res = await apiFetch(`/api/v1/admin/snapshots/${key}`);
  if (!res.ok) return null;
  const body = (await res.json()) as { data: T | null };
  return body.data;
}

export async function saveAdminSnapshot<T>(key: string, data: T): Promise<boolean> {
  if (!getApiBase()) return false;
  const res = await apiFetch(`/api/v1/admin/snapshots/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ data })
  });
  return res.ok;
}

export async function fetchAuditLogs(): Promise<AuditEntry[] | null> {
  if (!getApiBase()) return null;
  const res = await apiFetch('/api/v1/admin/audit');
  if (!res.ok) return null;
  const body = (await res.json()) as { logs: AuditEntry[] };
  return body.logs;
}

export async function postAuditLog(
  action: string,
  target?: { type: string; id: string; label?: string },
  meta?: Record<string, unknown>
): Promise<boolean> {
  if (!getApiBase()) return false;
  const res = await apiFetch('/api/v1/admin/audit', {
    method: 'POST',
    body: JSON.stringify({ action, target, meta })
  });
  return res.ok;
}

export async function clearRemoteAuditLogs(): Promise<boolean> {
  if (!getApiBase()) return false;
  const res = await apiFetch('/api/v1/admin/audit', { method: 'DELETE' });
  return res.ok || res.status === 204;
}

export async function fetchAdminSessions(): Promise<AdminSessionRow[] | null> {
  if (!getApiBase()) return null;
  const res = await apiFetch('/api/v1/admin/sessions');
  if (!res.ok) return null;
  const body = (await res.json()) as { sessions: AdminSessionRow[] };
  return body.sessions;
}

export async function revokeAdminSession(id: string): Promise<boolean> {
  if (!getApiBase()) return false;
  const res = await apiFetch(`/api/v1/admin/sessions/${id}`, { method: 'DELETE' });
  return res.ok || res.status === 204;
}

export async function impersonateRemote(userId: string): Promise<StoredAuthPayload | null> {
  if (!getApiBase()) return null;
  const res = await apiFetch('/api/v1/admin/impersonate', {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { user: User; accessToken: string };
  return { user: body.user, token: body.accessToken };
}
