import type { FastifyReply, FastifyRequest } from 'fastify';

const COOKIE_NAME = 'edunor_refresh';

function encodeCookieValue(value: string): string {
  return encodeURIComponent(value);
}

function parseCookieHeader(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  return raw.split(';').reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) return acc;
    try {
      acc[key] = decodeURIComponent(value);
    } catch {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function readRefreshCookie(req: FastifyRequest): string | undefined {
  return parseCookieHeader(req.headers.cookie)[COOKIE_NAME];
}

export function setRefreshCookie(
  reply: FastifyReply,
  token: string,
  maxAgeDays: number,
  secure: boolean
): void {
  const maxAge = Math.max(1, Math.floor(maxAgeDays * 24 * 60 * 60));
  const parts = [
    `${COOKIE_NAME}=${encodeCookieValue(token)}`,
    'Path=/api/v1/auth',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`
  ];
  if (secure) parts.push('Secure');
  reply.header('Set-Cookie', parts.join('; '));
}

export function clearRefreshCookie(reply: FastifyReply, secure: boolean): void {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/api/v1/auth',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (secure) parts.push('Secure');
  reply.header('Set-Cookie', parts.join('; '));
}
