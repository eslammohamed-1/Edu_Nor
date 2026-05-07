import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { hashPassword } from '../../lib/password.js';
import { preRequireSuperAdmin } from '../../lib/guards.js';
import { toPublicUser } from '../../lib/user-mapper.js';
import { errorSchema, publicUserSchema } from '../../lib/openapi-schemas.js';

import { evaluatePasswordPolicy } from '../../lib/passwordPolicy.js';

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(['student', 'admin', 'teacher', 'super_admin']),
  grade: z.string().optional(),
  phone: z.string().optional(),
  stage: z.enum(['primary', 'prep', 'secondary']).optional(),
  secondaryTrack: z.enum(['scientific_ar', 'scientific_languages', 'literary']).optional(),
  permissions: z.array(z.string()).optional(),
  banned: z.boolean().optional()
});

const patchSchema = createSchema.partial();

export const adminUsersRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', preRequireSuperAdmin);

  app.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { users: { type: 'array', items: publicUserSchema } },
            required: ['users']
          }
        }
      }
    },
    async (_req, reply) => {
      const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      return reply.send({ users: rows.map(toPublicUser) });
    }
  );

  app.post(
    '/',
    {
      schema: {
        response: {
          201: {
            type: 'object',
            properties: { user: publicUserSchema },
            required: ['user']
          },
          400: errorSchema,
          409: errorSchema
        }
      }
    },
    async (req, reply) => {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
      }
      const email = parsed.data.email.trim().toLowerCase();
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return reply.status(409).send({ error: 'البريد مستخدم' });
      const pol = await evaluatePasswordPolicy(parsed.data.password, {
        email,
        name: parsed.data.name.trim()
      });
      if (!pol.ok) {
        return reply.status(400).send({ error: pol.errors[0] ?? 'كلمة مرور ضعيفة', details: pol.errors });
      }
      const passwordHash = await hashPassword(parsed.data.password);
      const permissionsJson =
        parsed.data.permissions && parsed.data.permissions.length
          ? JSON.stringify(parsed.data.permissions)
          : null;
      const user = await prisma.user.create({
        data: {
          email,
          name: parsed.data.name.trim(),
          passwordHash,
          role: parsed.data.role,
          grade: parsed.data.grade ?? null,
          phone: parsed.data.phone ?? null,
          stage: parsed.data.stage ?? null,
          secondaryTrack: parsed.data.secondaryTrack ?? null,
          permissionsJson,
          banned: parsed.data.banned ?? false
        }
      });
      return reply.status(201).send({ user: toPublicUser(user) });
    }
  );

  app.patch(
    '/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: {
            type: 'object',
            properties: { user: publicUserSchema },
            required: ['user']
          },
          400: errorSchema,
          404: errorSchema,
          409: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      const parsed = patchSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
      }
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: 'غير موجود' });

      const body = parsed.data;
      if (body.role && body.role !== 'super_admin' && existing.role === 'super_admin') {
        const others = await prisma.user.count({
          where: { role: 'super_admin', banned: false, NOT: { id } }
        });
        if (others === 0) {
          return reply.status(400).send({ error: 'يجب أن يبقى سوبر أدمن واحد على الأقل' });
        }
      }

      const updates: import('@prisma/client').Prisma.UserUpdateInput = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.email !== undefined) updates.email = body.email.trim().toLowerCase();
      if (body.password !== undefined) {
        const pol = await evaluatePasswordPolicy(body.password, {
          email: body.email !== undefined ? body.email.trim().toLowerCase() : existing.email,
          name: body.name !== undefined ? body.name.trim() : existing.name
        });
        if (!pol.ok) {
          return reply.status(400).send({ error: pol.errors[0], details: pol.errors });
        }
        updates.passwordHash = await hashPassword(body.password);
      }
      if (body.role !== undefined) updates.role = body.role;
      if (body.grade !== undefined) updates.grade = body.grade;
      if (body.phone !== undefined) updates.phone = body.phone;
      if (body.stage !== undefined) updates.stage = body.stage;
      if (body.secondaryTrack !== undefined) updates.secondaryTrack = body.secondaryTrack;
      if (body.banned !== undefined) updates.banned = body.banned;
      if (body.permissions !== undefined) {
        updates.permissionsJson =
          body.permissions.length > 0 ? JSON.stringify(body.permissions) : null;
      }

      try {
        const user = await prisma.user.update({ where: { id }, data: updates });
        return reply.send({ user: toPublicUser(user) });
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('Unique constraint')) {
          return reply.status(409).send({ error: 'البريد مستخدم' });
        }
        throw e;
      }
    }
  );

  app.delete(
    '/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          204: { type: 'null' },
          400: errorSchema,
          404: errorSchema
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: 'غير موجود' });
      if (existing.role === 'super_admin') {
        const count = await prisma.user.count({ where: { role: 'super_admin', banned: false } });
        if (count <= 1) {
          return reply.status(400).send({ error: 'لا يمكن حذف آخر سوبر أدمن' });
        }
      }
      if (req.authUser?.id === id) {
        return reply.status(400).send({ error: 'لا يمكن حذف حسابك وأنت مسجل الدخول' });
      }
      await prisma.user.delete({ where: { id } });
      return reply.status(204).send();
    }
  );
};
