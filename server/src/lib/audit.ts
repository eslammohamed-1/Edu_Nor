import type { FastifyRequest } from 'fastify';
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

function clientIp(req: FastifyRequest): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim();
  }
  return req.ip;
}

export async function writeAuditLog(
  req: FastifyRequest,
  action: string,
  actor: AuditActor,
  target?: AuditTarget,
  meta?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: actor.id ?? null,
      actorName: actor.name ?? 'system',
      actorRole: actor.role ?? 'system',
      action,
      targetJson: target ? JSON.stringify(target) : null,
      metaJson: meta ? JSON.stringify(meta) : null,
      ip: clientIp(req) ?? null,
      userAgent: req.headers['user-agent'] ?? null
    }
  });
}
