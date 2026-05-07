import type { FastifyPluginAsync } from 'fastify';
import { computeStudyPlanForUser } from '../../lib/study-plan.js';

export const meStudyPlanRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/me/study-plan',
    {
      schema: {
        description: 'خطة دراسية مرتّبة + الدرس المقترح التالي',
        response: {
          200: {
            type: 'object',
            properties: {
              nextLesson: {
                type: 'object',
                nullable: true,
                properties: {
                  lessonId: { type: 'string' },
                  title: { type: 'string' },
                  duration: { type: 'number' },
                  subjectId: { type: 'string' },
                  subjectName: { type: 'string' },
                  subjectSlug: { type: 'string' },
                  courseId: { type: 'string' },
                  chapterId: { type: 'string' }
                }
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true
                }
              }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      if (!req.authUser) {
        return reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
      }
      const plan = await computeStudyPlanForUser(req.authUser.id);
      return reply.send(plan);
    }
  );
};
