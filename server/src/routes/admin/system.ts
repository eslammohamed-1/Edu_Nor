import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';
import type { Env } from '../../env.js';
import { preRequireSuperAdmin } from '../../lib/guards.js';
import { hashRefreshToken, signAccessToken } from '../../lib/tokens.js';
import { readRefreshCookie } from '../../lib/refreshCookie.js';
import { toPublicUser } from '../../lib/user-mapper.js';
import { writeAuditLog } from '../../lib/audit.js';

const snapshotKeys = new Set(['content', 'quizzes', 'settings']);

function parseJsonMaybe<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function actorFromRequest(req: { authUser?: { id: string; role: string } }) {
  if (!req.authUser) return { id: undefined, name: 'system', role: 'system' };
  const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
  return {
    id: req.authUser.id,
    name: user?.name ?? req.authUser.id,
    role: req.authUser.role
  };
}

export const adminSystemRoutes: FastifyPluginAsync<{ env: Env }> = async (app, { env }) => {
  app.addHook('preHandler', preRequireSuperAdmin);

  app.get('/snapshots/:key', async (req, reply) => {
    const key = (req.params as { key: string }).key;
    if (!snapshotKeys.has(key)) return reply.status(404).send({ error: 'snapshot غير معروف' });
    const row = await prisma.adminSnapshot.findUnique({ where: { key } });
    return reply.send({
      key,
      data: parseJsonMaybe(row?.dataJson, null),
      updatedAt: row?.updatedAt.toISOString() ?? null
    });
  });

  app.put('/snapshots/:key', async (req, reply) => {
    const key = (req.params as { key: string }).key;
    if (!snapshotKeys.has(key)) return reply.status(404).send({ error: 'snapshot غير معروف' });
    const parsed = z.object({ data: z.unknown() }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'بيانات غير صالحة' });

    const row = await prisma.adminSnapshot.upsert({
      where: { key },
      create: { key, dataJson: JSON.stringify(parsed.data.data) },
      update: { dataJson: JSON.stringify(parsed.data.data) }
    });
    const actor = await actorFromRequest(req);
    await writeAuditLog(req, `snapshot.${key}.update`, actor, { type: 'snapshot', id: key });
    return reply.send({ ok: true, updatedAt: row.updatedAt.toISOString() });
  });

  app.get('/audit', async (_req, reply) => {
    const rows = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000
    });
    return reply.send({
      logs: rows.map((row) => ({
        id: row.id,
        actor: {
          id: row.actorId ?? 'system',
          name: row.actorName,
          role: row.actorRole
        },
        action: row.action,
        target: parseJsonMaybe(row.targetJson, undefined),
        meta: parseJsonMaybe(row.metaJson, undefined),
        ip: row.ip ?? undefined,
        userAgent: row.userAgent ?? undefined,
        createdAt: row.createdAt.toISOString()
      }))
    });
  });

  app.post('/audit', async (req, reply) => {
    const parsed = z.object({
      action: z.string().min(1),
      target: z.object({
        type: z.string(),
        id: z.string(),
        label: z.string().optional()
      }).optional(),
      meta: z.record(z.unknown()).optional()
    }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'بيانات غير صالحة' });
    const actor = await actorFromRequest(req);
    await writeAuditLog(req, parsed.data.action, actor, parsed.data.target, parsed.data.meta);
    return reply.status(201).send({ ok: true });
  });

  app.delete('/audit', async (req, reply) => {
    await prisma.auditLog.deleteMany();
    const actor = await actorFromRequest(req);
    await writeAuditLog(req, 'audit.clear', actor, { type: 'audit', id: 'all' });
    return reply.status(204).send();
  });

  app.get('/sessions', async (req, reply) => {
    const currentRefresh = readRefreshCookie(req);
    const currentHash = currentRefresh ? hashRefreshToken(currentRefresh) : null;
    const rows = await prisma.refreshToken.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
    return reply.send({
      sessions: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userName: row.user.name,
        deviceLabel: row.userAgent?.split(') ')[0]?.replace('(', '') || 'متصفح غير معروف',
        ip: row.ip ?? '—',
        lastSeen: row.createdAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
        current: currentHash === row.tokenHash
      }))
    });
  });

  app.delete('/sessions/:id', async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const currentRefresh = readRefreshCookie(req);
    const currentHash = currentRefresh ? hashRefreshToken(currentRefresh) : null;
    const row = await prisma.refreshToken.findUnique({ where: { id } });
    if (!row) return reply.status(404).send({ error: 'جلسة غير موجودة' });
    if (currentHash === row.tokenHash) {
      return reply.status(400).send({ error: 'لا يمكن إنهاء الجلسة الحالية من هنا' });
    }
    await prisma.refreshToken.delete({ where: { id } });
    const actor = await actorFromRequest(req);
    await writeAuditLog(req, 'security.session.revoked', actor, { type: 'session', id });
    return reply.status(204).send();
  });

  app.post('/impersonate', async (req, reply) => {
    const parsed = z.object({ userId: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'userId مطلوب' });
    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
    if (!target || target.banned) return reply.status(404).send({ error: 'المستخدم غير متاح' });
    const accessToken = signAccessToken(
      { sub: target.id, role: target.role },
      env.JWT_SECRET,
      Math.min(env.JWT_ACCESS_EXPIRES_SEC, 600)
    );
    const actor = await actorFromRequest(req);
    await writeAuditLog(
      req,
      'impersonate.start',
      actor,
      { type: 'user', id: target.id, label: target.name },
      { expiresInSec: Math.min(env.JWT_ACCESS_EXPIRES_SEC, 600) }
    );
    return reply.send({
      user: toPublicUser(target),
      accessToken,
      impersonatedBy: actor.id
    });
  });
};
