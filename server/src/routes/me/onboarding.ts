import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db.js';
import { toPublicUser } from '../../lib/user-mapper.js';

const patchBodySchema = z.object({
  favoriteSubjectIds: z.array(z.string().min(1)).min(1).max(3),
  stage: z.enum(['primary', 'prep', 'secondary']).optional(),
  grade: z.string().min(1).optional(),
  secondaryTrack: z
    .enum(['scientific_ar', 'scientific_languages', 'literary'])
    .optional()
});

function requireUser(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meOnboardingRoutes: FastifyPluginAsync = async (app) => {
  app.patch(
    '/me/onboarding',
    {
      schema: {
        description: 'إنهاء الإرشاد الأولي — مواد مفضّلة وتحديث صف',
        body: {
          type: 'object',
          required: ['favoriteSubjectIds'],
          properties: {
            favoriteSubjectIds: { type: 'array', items: { type: 'string' }, maxItems: 3 },
            stage: { type: 'string' },
            grade: { type: 'string' },
            secondaryTrack: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: { type: 'object', additionalProperties: true }
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

      const parsed = patchBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'جسم الطلب غير صالح' });
      }

      const b = parsed.data;
      const data: {
        onboardingCompletedAt: Date;
        favoriteSubjectsJson: string;
        stage?: string;
        grade?: string;
        secondaryTrack?: string | null;
      } = {
        onboardingCompletedAt: new Date(),
        favoriteSubjectsJson: JSON.stringify(b.favoriteSubjectIds)
      };
      if (b.stage != null) {
        data.stage = b.stage;
        if (b.stage === 'secondary' && b.secondaryTrack != null) {
          data.secondaryTrack = b.secondaryTrack;
        } else if (b.stage === 'primary' || b.stage === 'prep') {
          data.secondaryTrack = null;
        }
      }
      if (b.grade != null) data.grade = b.grade;

      const updated = await prisma.user.update({
        where: { id: user.id },
        data
      });

      return reply.send({ user: toPublicUser(updated) });
    }
  );
};
