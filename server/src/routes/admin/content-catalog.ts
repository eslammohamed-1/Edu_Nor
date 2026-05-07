import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';
import {
  buildContentSnapshotFromDatabase,
  persistAdminContentSnapshotFromDatabase
} from '../../lib/catalog-content.js';
import { writeAuditLog } from '../../lib/audit.js';
import { preRequireSuperAdmin } from '../../lib/guards.js';
import { errorSchema, okTrueSchema, unsafeJson } from '../../lib/openapi-schemas.js';

async function actorFromRequest(req: { authUser?: { id: string; role: string } }) {
  if (!req.authUser) return { id: undefined, name: 'system', role: 'system' };
  const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
  return {
    id: req.authUser.id,
    name: user?.name ?? req.authUser.id,
    role: req.authUser.role
  };
}

export const adminCatalogContentRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', preRequireSuperAdmin);

  /** Full content tree from relational rows (سوبر أدمن). */
  app.get(
    '/catalog-model',
    {
      schema: {
        response: { 200: unsafeJson }
      }
    },
    async (_req, reply) => {
      const data = await buildContentSnapshotFromDatabase();
      return reply.send(data);
    }
  );

  /** Rebuild `AdminSnapshot.content` من الجداول (بعد تعديل مباشر في DB خارج الواجهة). */
  app.post(
    '/snapshot-from-db',
    {
      schema: {
        response: {
          200: okTrueSchema
        }
      }
    },
    async (req, reply) => {
      await persistAdminContentSnapshotFromDatabase();
      const actor = await actorFromRequest(req);
      await writeAuditLog(req, 'catalog.snapshot.rebuilt', actor, { type: 'snapshot', id: 'content' });
      return reply.send({ ok: true });
    }
  );

  app.delete(
    '/subjects/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          204: { type: 'null' },
          404: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      try {
        await prisma.subject.delete({ where: { id } });
      } catch {
        return reply.status(404).send({ error: 'المادة غير موجودة' });
      }
      await persistAdminContentSnapshotFromDatabase();
      const actor = await actorFromRequest(req);
      await writeAuditLog(req, 'catalog.subject.delete', actor, { type: 'subject', id });
      return reply.status(204).send();
    }
  );

  app.delete(
    '/courses/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          204: { type: 'null' },
          404: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      try {
        await prisma.course.delete({ where: { id } });
      } catch {
        return reply.status(404).send({ error: 'الكورس غير موجود' });
      }
      await persistAdminContentSnapshotFromDatabase();
      const actor = await actorFromRequest(req);
      await writeAuditLog(req, 'catalog.course.delete', actor, { type: 'course', id });
      return reply.status(204).send();
    }
  );

  app.delete(
    '/lessons/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          204: { type: 'null' },
          404: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      try {
        await prisma.lesson.delete({ where: { id } });
      } catch {
        return reply.status(404).send({ error: 'الدرس غير موجود' });
      }
      await persistAdminContentSnapshotFromDatabase();
      const actor = await actorFromRequest(req);
      await writeAuditLog(req, 'catalog.lesson.delete', actor, { type: 'lesson', id });
      return reply.status(204).send();
    }
  );

  app.patch(
    '/courses/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        body: {
          type: 'object',
          properties: { published: { type: 'boolean' } }
        },
        response: {
          200: okTrueSchema,
          400: errorSchema,
          404: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      const parsed = z
        .object({
          published: z.boolean().optional()
        })
        .safeParse(req.body ?? {});
      if (!parsed.success) return reply.status(400).send({ error: 'بيانات غير صالحة' });
      try {
        await prisma.course.update({
          where: { id },
          data: {
            ...(parsed.data.published !== undefined ? { published: parsed.data.published } : {})
          }
        });
      } catch {
        return reply.status(404).send({ error: 'الكورس غير موجود' });
      }
      await persistAdminContentSnapshotFromDatabase();
      const actor = await actorFromRequest(req);
      await writeAuditLog(req, 'catalog.course.patch', actor, { type: 'course', id });
      return reply.send({ ok: true });
    }
  );
};
