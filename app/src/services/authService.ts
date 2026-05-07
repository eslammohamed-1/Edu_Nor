import type { User, LoginPayload, RegisterPayload } from '@/types/auth';
import type { StoredAuthPayload } from '@/lib/authStorage';
import { getApiBase } from '@/services/http/client';

function parseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(raw || 'استجابة غير صالحة من الخادم');
  }
}

/** جلسة بعد نجاح login/register على الخادم */
export type RemoteAuthSession = StoredAuthPayload;

export type LoginOutcome =
  | { kind: 'session'; session: RemoteAuthSession }
  | { kind: 'twofa'; twoFactorTicket: string }
  | { kind: 'locked'; message: string; lockedUntil?: string };

export async function loginRemote(payload: LoginPayload): Promise<LoginOutcome> {
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
  const data = parseJson(raw);

  if (res.status === 423) {
    return {
      kind: 'locked',
      message: typeof data.error === 'string' ? data.error : 'الحساب مقفول مؤقتاً',
      lockedUntil:
        typeof data.lockedUntil === 'string' && data.lockedUntil ? data.lockedUntil : undefined
    };
  }

  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'فشل تسجيل الدخول');
  }

  if (data.requires2fa === true && typeof data.twoFactorTicket === 'string') {
    return { kind: 'twofa', twoFactorTicket: data.twoFactorTicket as string };
  }

  const user = data.user as User | undefined;
  const accessToken = data.accessToken as string | undefined;
  if (!user || !accessToken) {
    throw new Error('استجابة غير متوقعة من الخادم');
  }
  return {
    kind: 'session',
    session: {
      user,
      token: accessToken
    }
  };
}

export async function verifyTwoFactorRemote(twoFactorTicket: string, code: string): Promise<RemoteAuthSession> {
  const base = getApiBase();
  if (!base) throw new Error('VITE_API_BASE_URL غير معرّف');
  const res = await fetch(`${base}/api/v1/auth/2fa/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ twoFactorTicket, code })
  });
  const raw = await res.text();
  const data = parseJson(raw);
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'رمز غير صحيح');
  }
  const user = data.user as User | undefined;
  const accessToken = data.accessToken as string | undefined;
  if (!user || !accessToken) throw new Error('استجابة غير متوقعة');
  return { user, token: accessToken };
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
  const data = parseJson(raw);
  if (!res.ok) {
    const err = typeof data.error === 'string' ? data.error : 'فشل التسجيل';
    throw new Error(err);
  }
  const user = data.user as User | undefined;
  const accessToken = data.accessToken as string | undefined;
  if (!user || !accessToken) {
    throw new Error('استجابة غير متوقعة من الخادم');
  }
  return {
    user,
    token: accessToken
  };
}
