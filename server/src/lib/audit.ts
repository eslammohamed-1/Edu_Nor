import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db.js';

interface AuditActor {
  id?: string;
  name?: string;
  role?: string;
}

interface AuditTarget {
  type: string;
  id: string;
  label?: string;
}

const MAX_BODY_JSON_CHARS = 20_000;

function clientIp(req: FastifyRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim();
  }
  return req.ip;
}

function redactSensitiveKeys(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[max-depth]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length > 2000) return `${value.slice(0, 2000)}…`;
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((v) => redactSensitiveKeys(v, depth + 1));
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      const sensitive =
        /password|passwd|pwd|token|secret|refresh|csrf|authorization|otp|totp|recovery|credit|card|cvv|pin/i.test(
          k
        ) || k.toLowerCase() === 'code';
      if (sensitive) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redactSensitiveKeys(v, depth + 1);
      }
    }
    return out;
  }
  return String(value);
}

function summarizeAuditBody(body: unknown): unknown {
  const isBuf = typeof Buffer !== 'undefined' && Buffer.isBuffer(body);
  if (isBuf) return '[binary]';
  if (body === undefined) return undefined;
  try {
    const redacted = redactSensitiveKeys(body);
    const s = JSON.stringify(redacted);
    if (s.length > MAX_BODY_JSON_CHARS) return '[body too large]';
    return redacted;
  } catch {
    return '[unserializable body]';
  }
}

/** بعد الاستجابة: يسجّل طلبات POST/PATCH/PUT/DELETE تحت /api/v1 مع جسم مُنقّى من الأسرار */
export async function recordHttpMutationAudit(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const urlPath = req.url.split('?')[0] ?? '';
  if (!urlPath.startsWith('/api/v1')) return;
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) return;

  const actorName = req.authUser ? 'user' : 'guest';
  const actorRole = req.authUser ? String(req.authUser.role) : 'guest';

  const category = urlPath.startsWith('/api/v1/auth')
    ? 'auth'
    : urlPath.startsWith('/api/v1/admin')
      ? 'admin'
      : 'api';

  const status = reply.statusCode;
  const severity = status >= 500 ? 'error' : status >= 400 ? 'warning' : 'info';

  const bodySummary = summarizeAuditBody(req.body);

  await prisma.auditLog.create({
    data: {
      actorId: req.authUser?.id ?? null,
      actorName,
      actorRole,
      action: `http.${req.method.toLowerCase()}`,
      targetJson: JSON.stringify({
        type: 'http',
        path: urlPath,
        method: req.method
      }),
      metaJson: JSON.stringify({
        statusCode: status,
        body: bodySummary
      }),
      severity,
      category,
      ip: clientIp(req) ?? null,
      userAgent:
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null
    }
  });
}

export async function writeAuditLog(
  req: FastifyRequest,
  action: string,
  actor: AuditActor,
  target?: AuditTarget,
  meta?: Record<string, unknown>,
  opts?: { severity?: string; category?: string }
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: actor.id ?? null,
      actorName: actor.name ?? 'system',
      actorRole: actor.role ?? 'system',
      action,
      targetJson: target ? JSON.stringify(target) : null,
      metaJson: meta ? JSON.stringify(meta) : null,
      severity: opts?.severity ?? 'info',
      category: opts?.category ?? 'admin',
      ip: clientIp(req) ?? null,
      userAgent: req.headers['user-agent'] ?? null
    }
  });
}
