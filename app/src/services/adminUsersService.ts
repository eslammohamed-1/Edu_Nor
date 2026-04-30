import type { User, UserRole } from '@/types/auth';
import { apiFetch } from '@/services/http/client';

export interface AdminUser extends User {
  banned?: boolean;
}

export async function fetchAdminUsers(): Promise<AdminUser[] | null> {
  const res = await apiFetch('/api/v1/admin/users');
  if (!res.ok) return null;
  const data = (await res.json()) as { users: AdminUser[] };
  return data.users;
}

export async function createAdminUser(body: Record<string, unknown>): Promise<AdminUser | null> {
  const res = await apiFetch('/api/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  const raw = await res.text();
  if (!res.ok) {
    console.error(raw);
    return null;
  }
  const data = JSON.parse(raw) as { user: AdminUser };
  return data.user;
}

export async function patchAdminUser(
  id: string,
  body: Record<string, unknown>
): Promise<boolean> {
  const res = await apiFetch(`/api/v1/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
  if (!res.ok) console.error(await res.text());
  return res.ok;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const res = await apiFetch(`/api/v1/admin/users/${id}`, { method: 'DELETE' });
  const ok = res.ok || res.status === 204;
  if (!ok) console.error(await res.text());
  return ok;
}

export async function patchAdminUserRole(id: string, role: UserRole): Promise<boolean> {
  return patchAdminUser(id, { role });
}

export async function patchAdminUserPermissions(id: string, permissions: string[]): Promise<boolean> {
  return patchAdminUser(id, { permissions });
}

export async function patchAdminUserBanned(id: string, banned: boolean): Promise<boolean> {
  return patchAdminUser(id, { banned });
}

export async function patchAdminUserPassword(id: string, password: string): Promise<boolean> {
  return patchAdminUser(id, { password });
}
