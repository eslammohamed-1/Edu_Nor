import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db.js';
import { getStatsPayload, isoWeekKey } from '../../lib/gamification.js';

function requireUser(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meStatsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/me/stats',
    {
      schema: {
        description: 'إحصائيات تلعيب الطالب',
        response: {
          200: {
            type: 'object',
            properties: {
              totalPoints: { type: 'number' },
              weeklyPoints: { type: 'number' },
              weekKey: { type: 'string', nullable: true },
              currentStreak: { type: 'number' },
              bestStreak: { type: 'number' },
              lastStreakUtcDate: { type: 'string', nullable: true },
              badges: { type: 'array', items: { type: 'string' } }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;
      const stats = await getStatsPayload(user.id);
      return reply.send(stats);
    }
  );

  app.get(
    '/me/leaderboard',
    {
      schema: {
        description: 'لوحة المتصدرين الأسبوعية لنفس الصف',
        response: {
          200: {
            type: 'object',
            properties: {
              weekKey: { type: 'string' },
              grade: { type: 'string', nullable: true },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    rank: { type: 'number' },
                    userId: { type: 'string' },
                    name: { type: 'string' },
                    weeklyPoints: { type: 'number' }
                  }
                }
              },
              myRank: { type: 'number', nullable: true }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const me = await prisma.user.findUnique({
        where: { id: user.id },
        select: { grade: true }
      });
      const grade = me?.grade ?? null;
      const wk = isoWeekKey(new Date());

      const whereGrade =
        grade && grade.length > 0
          ? { user: { grade } as const }
          : { user: { role: 'student' as const } };

      const rows = await prisma.userStats.findMany({
        where: {
          weekKey: wk,
          ...whereGrade
        },
        orderBy: [{ weeklyPoints: 'desc' }, { userId: 'asc' }],
        take: 50,
        select: {
          weeklyPoints: true,
          userId: true,
          user: { select: { id: true, name: true } }
        }
      });

      const items = rows.map((r, i) => ({
        rank: i + 1,
        userId: r.userId,
        name: r.user.name,
        weeklyPoints: r.weeklyPoints
      }));

      const idx = rows.findIndex((r) => r.userId === user.id);
      const myRank = idx >= 0 ? idx + 1 : null;

      return reply.send({
        weekKey: wk,
        grade,
        items,
        myRank
      });
    }
  );
};
