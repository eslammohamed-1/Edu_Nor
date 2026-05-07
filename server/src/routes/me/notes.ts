import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';

const lessonIdBody = z.object({ lessonId: z.string().min(1) });
const noteBody = z.object({ body: z.string().max(20000) });

function requireUser(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meNotesRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/me/bookmarks',
    {
      schema: {
        response: {
          200: { type: 'object', properties: { items: { type: 'array' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const rows = await prisma.userBookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          lesson: { select: { id: true, title: true, chapter: { select: { course: { select: { title: true } } } } } }
        }
      });

      return reply.send({
        items: rows.map((r) => ({
          lessonId: r.lessonId,
          title: r.lesson.title,
          courseTitle: r.lesson.chapter.course.title,
          createdAt: r.createdAt.toISOString()
        }))
      });
    }
  );

  app.post(
    '/me/bookmarks',
    {
      schema: {
        body: {
          type: 'object',
          required: ['lessonId'],
          properties: { lessonId: { type: 'string' } }
        },
        response: {
          200: { type: 'object', properties: { ok: { type: 'boolean' } } },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const parsed = lessonIdBody.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'معرّف الدرس غير صالح' });
      }

      const { lessonId } = parsed.data;
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
      if (!lesson) {
        return reply.status(400).send({ error: 'الدرس غير موجود' });
      }

      await prisma.userBookmark.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        create: { userId: user.id, lessonId },
        update: {}
      });
      return reply.send({ ok: true });
    }
  );

  app.delete(
    '/me/bookmarks/:lessonId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['lessonId'],
          properties: { lessonId: { type: 'string' } }
        },
        response: {
          200: { type: 'object', properties: { ok: { type: 'boolean' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const lessonId = (req.params as { lessonId: string }).lessonId;
      await prisma.userBookmark.deleteMany({
        where: { userId: user.id, lessonId }
      });
      return reply.send({ ok: true });
    }
  );

  app.get(
    '/me/notes',
    {
      schema: {
        response: {
          200: { type: 'object', properties: { items: { type: 'array' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const rows = await prisma.userNote.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          lesson: { select: { id: true, title: true, chapter: { select: { course: { select: { title: true } } } } } }
        }
      });

      return reply.send({
        items: rows.map((r) => ({
          lessonId: r.lessonId,
          title: r.lesson.title,
          courseTitle: r.lesson.chapter.course.title,
          body: r.body,
          updatedAt: r.updatedAt.toISOString()
        }))
      });
    }
  );

  app.put(
    '/me/notes/:lessonId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['lessonId'],
          properties: { lessonId: { type: 'string' } }
        },
        body: {
          type: 'object',
          required: ['body'],
          properties: { body: { type: 'string' } }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              lessonId: { type: 'string' },
              body: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const lessonId = (req.params as { lessonId: string }).lessonId;
      const parsed = noteBody.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'نص غير صالح' });
      }

      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
      if (!lesson) {
        return reply.status(400).send({ error: 'الدرس غير موجود' });
      }

      const row = await prisma.userNote.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        create: {
          userId: user.id,
          lessonId,
          body: parsed.data.body
        },
        update: {
          body: parsed.data.body
        }
      });

      return reply.send({
        lessonId: row.lessonId,
        body: row.body,
        updatedAt: row.updatedAt.toISOString()
      });
    }
  );

  app.delete(
    '/me/notes/:lessonId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['lessonId'],
          properties: { lessonId: { type: 'string' } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const lessonId = (req.params as { lessonId: string }).lessonId;
      await prisma.userNote.deleteMany({
        where: { userId: user.id, lessonId }
      });
      return reply.send({ ok: true });
    }
  );
};
