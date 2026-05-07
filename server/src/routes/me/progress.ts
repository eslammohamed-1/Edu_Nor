import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { loadEnv } from '../../env.js';
import { tryIssueSubjectCompletionCertificate } from '../../lib/certificates.js';
import { awardLessonComplete, awardSubjectCompletion } from '../../lib/gamification.js';

const env = loadEnv();

const postBodySchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().int().min(0).max(24 * 3600 * 30).optional(),
  status: z.enum(['in_progress', 'completed']).optional()
});

function requireUser(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meProgressRoutes: FastifyPluginAsync = async (app) => {
  /** تجميع تقدّم الدروس للمستخدم الحالي */
  app.get(
    '/me/progress',
    {
      schema: {
        description: 'قائمة تقدّم الدروس للمستخدم',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lessonId: { type: 'string' },
                    status: { type: 'string' },
                    watchedSeconds: { type: 'number' },
                    completedAt: { type: 'string', nullable: true }
                  }
                }
              }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const rows = await prisma.lessonProgress.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      });

      return reply.send({
        items: rows.map((r: (typeof rows)[number]) => ({
          lessonId: r.lessonId,
          status: r.status,
          watchedSeconds: r.watchedSeconds,
          completedAt: r.completedAt?.toISOString() ?? null
        }))
      });
    }
  );

  /** حفظ / تحديث تقدّم درس (idempotent عبر upsert) */
  app.post(
    '/me/progress/lesson',
    {
      schema: {
        description: 'تحديث تقدّم درس واحد',
        body: {
          type: 'object',
          required: ['lessonId'],
          properties: {
            lessonId: { type: 'string' },
            watchedSeconds: { type: 'number' },
            status: { type: 'string', enum: ['in_progress', 'completed'] }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              lessonId: { type: 'string' },
              status: { type: 'string' },
              watchedSeconds: { type: 'number' },
              completedAt: { type: 'string', nullable: true }
            }
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } },
          403: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const parsed = postBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'جسم الطلب غير صالح' });
      }

      const u = await prisma.user.findUnique({
        where: { id: user.id },
        select: { banned: true, role: true }
      });
      if (!u || u.banned) {
        return reply.status(403).send({ error: 'الحساب غير مصرّح له' });
      }

      const { lessonId, watchedSeconds: wsIn, status: stIn } = parsed.data;
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
      if (!lesson) {
        return reply.status(400).send({ error: 'الدرس غير موجود' });
      }

      const existing = await prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId } }
      });

      let watchedSeconds = existing?.watchedSeconds ?? 0;
      if (wsIn != null) {
        watchedSeconds = Math.max(watchedSeconds, wsIn);
      }

      let status: string;
      let completedAt: Date | null;

      if (stIn === 'completed') {
        status = 'completed';
        completedAt = new Date();
      } else if (stIn === 'in_progress') {
        status = 'in_progress';
        completedAt = null;
      } else if (existing?.status === 'completed') {
        status = 'completed';
        completedAt = existing.completedAt;
      } else {
        status = existing?.status ?? 'in_progress';
        completedAt = null;
      }

      const row = await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        create: {
          userId: user.id,
          lessonId,
          status,
          watchedSeconds,
          completedAt: status === 'completed' ? (completedAt ?? new Date()) : null
        },
        update: {
          status,
          watchedSeconds,
          completedAt
        }
      });

      const becameCompleted =
        row.status === 'completed' && (!existing || existing.status !== 'completed');
      if (becameCompleted) {
        const hints = {
          clientDateHeader:
            typeof req.headers['x-client-date'] === 'string' ? req.headers['x-client-date'] : undefined
        };
        void awardLessonComplete(user.id, hints).catch((err) => {
          req.log.warn({ err }, 'gamification lesson award failed');
        });
        void tryIssueSubjectCompletionCertificate(env, user.id, lessonId)
          .then((issued) => {
            if (issued) {
              return awardSubjectCompletion(user.id, hints);
            }
          })
          .catch((err) => {
            req.log.warn({ err }, 'issue subject certificate failed');
          });
      }

      return reply.send({
        ok: true,
        lessonId: row.lessonId,
        status: row.status,
        watchedSeconds: row.watchedSeconds,
        completedAt: row.completedAt?.toISOString() ?? null
      });
    }
  );
};
