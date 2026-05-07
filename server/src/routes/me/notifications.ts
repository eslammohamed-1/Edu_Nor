import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { prisma } from '../../db.js';
import type { Env } from '../../env.js';
import { verifyAccessToken } from '../../lib/tokens.js';
import { sseSubscribe } from '../../lib/sse-notify.js';

function resolveSseUserId(req: FastifyRequest, jwtSecret: string): string | null {
  if (req.authUser) return req.authUser.id;
  const q = req.query as { accessToken?: string };
  if (!q.accessToken || typeof q.accessToken !== 'string') return null;
  try {
    const p = verifyAccessToken(q.accessToken, jwtSecret);
    return p.sub;
  } catch {
    return null;
  }
}

function requireUser(req: FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meNotificationsRoutes: FastifyPluginAsync<{ env: Env }> = async (app, { env }) => {
  app.get(
    '/me/notifications',
    {
      schema: {
        description: 'قائمة الإشعارات',
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string' },
            unreadOnly: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    body: { type: 'string' },
                    kind: { type: 'string' },
                    href: { type: 'string', nullable: true },
                    readAt: { type: 'string', nullable: true },
                    createdAt: { type: 'string' }
                  }
                }
              },
              unreadCount: { type: 'number' }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const q = req.query as { limit?: string; unreadOnly?: string };
      const limit = Math.min(100, Math.max(1, Number(q.limit ?? '30') || 30));
      const unreadOnly = q.unreadOnly === '1' || q.unreadOnly === 'true';

      const where = {
        userId: user.id,
        ...(unreadOnly ? { readAt: null } : {})
      };

      const [items, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit
        }),
        prisma.notification.count({
          where: { userId: user.id, readAt: null }
        })
      ]);

      return reply.send({
        items: items.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          kind: n.kind,
          href: n.href,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString()
        })),
        unreadCount
      });
    }
  );

  app.patch(
    '/me/notifications/:id/read',
    {
      schema: {
        description: 'تعليم إشعار كمقروء',
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string' } }
        },
        response: {
          200: { type: 'object', properties: { ok: { type: 'boolean' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const id = (req.params as { id: string }).id;
      const res = await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { readAt: new Date() }
      });
      if (res.count === 0) {
        return reply.status(404).send({ error: 'غير موجود' });
      }
      return reply.send({ ok: true });
    }
  );

  app.patch(
    '/me/notifications/read-all',
    {
      schema: {
        description: 'تعليم كل الإشعارات كمقروءة',
        response: {
          200: { type: 'object', properties: { ok: { type: 'boolean' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      await prisma.notification.updateMany({
        where: { userId: user.id, readAt: null },
        data: { readAt: new Date() }
      });
      return reply.send({ ok: true });
    }
  );

  /** SSE — يدعم `?accessToken=` لأن EventSource لا يرسل رؤوس التفويض */
  app.get(
    '/me/notifications/stream',
    {
      schema: {
        description: 'بث إشعارات لحظي (SSE)',
        querystring: {
          type: 'object',
          properties: { accessToken: { type: 'string' } }
        }
      }
    },
    async (req, reply) => {
      const userId = resolveSseUserId(req, env.JWT_SECRET);
      if (!userId) {
        return reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
      }

      reply.hijack();
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      const unsubscribe = sseSubscribe(userId, (chunk) => {
        reply.raw.write(chunk);
      });

      const ping = setInterval(() => {
        try {
          reply.raw.write(': ping\n\n');
        } catch {
          clearInterval(ping);
        }
      }, 25000);

      reply.raw.write('event: ready\ndata: {"ok":true}\n\n');

      const close = () => {
        clearInterval(ping);
        unsubscribe();
      };

      req.raw.on('close', close);
      reply.raw.on('close', close);
    }
  );
};
