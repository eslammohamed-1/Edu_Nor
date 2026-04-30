import type { User, UserRole } from '@/types/auth';

export const AUTH_STORAGE_KEY = 'edunor_auth';
const AUTH_STORAGE_MODE_KEY = 'edunor_auth_mode';
type AuthStorageMode = 'local' | 'session';

export interface StoredAuthPayload {
  user: User;
  token: string;
  refreshToken?: string;
}

export function normalizeStoredUser(raw: User): User {
  const role: UserRole = raw.role ?? 'student';
  return {
    ...raw,
    role,
    permissions: raw.permissions
  };
}

export function readStoredAuth(): StoredAuthPayload | null {
  try {
    const raw =
      localStorage.getItem(AUTH_STORAGE_KEY) ??
      sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuthPayload;
    data.user = normalizeStoredUser(data.user);
    return data;
  } catch {
    return null;
  }
}

export function writeStoredAuth(data: StoredAuthPayload | null, persistent = true): void {
  if (data) {
    const target = persistent ? localStorage : sessionStorage;
    const other = persistent ? sessionStorage : localStorage;
    const mode: AuthStorageMode = persistent ? 'local' : 'session';
    other.removeItem(AUTH_STORAGE_KEY);
    localStorage.setItem(AUTH_STORAGE_MODE_KEY, mode);
    target.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: normalizeStoredUser(data.user),
        token: data.token,
        ...(data.refreshToken ? { refreshToken: data.refreshToken } : {})
      })
    );
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  }
}

export function currentAuthStorageMode(): AuthStorageMode {
  return localStorage.getItem(AUTH_STORAGE_MODE_KEY) === 'session' ? 'session' : 'local';
}
