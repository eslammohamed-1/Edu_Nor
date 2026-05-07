import type { User } from '@/types/auth';
import {
  currentAuthStorageMode,
  readStoredAuth,
  writeStoredAuth,
  type StoredAuthPayload
} from '@/lib/authStorage';

export function getApiBase(): string | null {
  const u = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  return u || null;
}

export function useRemoteApi(): boolean {
  return !!getApiBase();
}

let csrfCache: string | null = null;

/** يستدعى مرة عند التشغيل مع واجهة بعيدة؛ يحدّث كوكي csrf_token */
export async function ensureCsrfToken(): Promise<void> {
  const base = getApiBase();
  if (!base) return;
  try {
    const res = await fetch(`${base}/api/v1/auth/csrf`, { credentials: 'include' });
    if (!res.ok) return;
    const j = (await res.json()) as { csrfToken?: string };
    if (j.csrfToken) csrfCache = j.csrfToken;
  } catch {
    /* تجاهل */
  }
}

async function tryRefresh(base: string): Promise<StoredAuthPayload | null> {
  const stored = readStoredAuth();
  if (!stored?.token) return null;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({})
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
  const next: StoredAuthPayload = {
    user: data.user,
    token: data.accessToken
  };
  writeStoredAuth(next, currentAuthStorageMode() === 'local');
  return next;
}

function needsCsrf(path: string, method: string): boolean {
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return false;
  return path.startsWith('/api/v1/admin');
}

/**
 * طلبات API مع Bearer؛ عند 401 يُجرَّب refresh مرة واحدة ثم إعادة المحاولة.
 * يحقن X-CSRF-Token لمسارات الإدارة بعد ensureCsrfToken.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getApiBase();
  if (!base) throw new Error('VITE_API_BASE_URL غير معرّف');

  const method = (init.method ?? 'GET').toUpperCase();
  if (needsCsrf(path, method) && !csrfCache) {
    await ensureCsrfToken();
  }

  const run = async (token: string | undefined) => {
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (needsCsrf(path, method) && csrfCache) {
      headers.set('X-CSRF-Token', csrfCache);
    }
    return fetch(`${base}${path}`, { ...init, headers, credentials: 'include' });
  };

  let stored = readStoredAuth();
  let res = await run(stored?.token);

  if (res.status === 401 && stored?.token) {
    const next = await tryRefresh(base);
    if (next) res = await run(next.token);
  }

  return res;
}

export async function apiLogoutRefresh(): Promise<void> {
  const base = getApiBase();
  if (!base) return;
  try {
    await fetch(`${base}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    });
  } catch {
    /* تجاهل */
  }
}

export function currentAccessToken(): string | null {
  return readStoredAuth()?.token ?? null;
}
