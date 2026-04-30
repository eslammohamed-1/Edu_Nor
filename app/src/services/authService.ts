import type { User, LoginPayload, RegisterPayload } from '@/types/auth';
import type { StoredAuthPayload } from '@/lib/authStorage';
import { getApiBase } from '@/services/http/client';

function parseAuthBody(raw: string): {
  error?: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
} {
  try {
    return JSON.parse(raw) as {
      error?: string;
      user?: User;
      accessToken?: string;
      refreshToken?: string;
    };
  } catch {
    throw new Error(raw || 'استجابة غير صالحة من الخادم');
  }
}

/** جلسة بعد نجاح login/register على الخادم */
export type RemoteAuthSession = StoredAuthPayload;

export async function loginRemote(payload: LoginPayload): Promise<RemoteAuthSession> {
  const base = getApiBase();
  if (!base) throw new Error('VITE_API_BASE_URL غير معرّف');

  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      password: payload.password
    })
  });
  const raw = await res.text();
  const data = parseAuthBody(raw);
  if (!res.ok) {
    throw new Error(data.error || 'فشل تسجيل الدخول');
  }
  if (!data.user || !data.accessToken) {
    throw new Error('استجابة غير متوقعة من الخادم');
  }
  return {
    user: data.user,
    token: data.accessToken
  };
}

export async function registerRemote(payload: RegisterPayload): Promise<RemoteAuthSession> {
  const base = getApiBase();
  if (!base) throw new Error('VITE_API_BASE_URL غير معرّف');

  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone,
    password: payload.password,
    confirmPassword: payload.confirmPassword,
    stage: payload.stage,
    grade: payload.grade,
    secondaryTrack: payload.stage === 'secondary' ? payload.secondaryTrack : undefined
  };
  const res = await fetch(`${base}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  const raw = await res.text();
  const data = parseAuthBody(raw);
  if (!res.ok) {
    throw new Error(data.error || 'فشل التسجيل');
  }
  if (!data.user || !data.accessToken) {
    throw new Error('استجابة غير متوقعة من الخادم');
  }
  return {
    user: data.user,
    token: data.accessToken
  };
}
