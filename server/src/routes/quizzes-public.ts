import type { FastifyPluginAsync } from 'fastify';
import { bootstrapQuizzesSnapshotIfEmpty, getLearnerQuizzesPayload } from '../lib/quiz-content.js';

export const quizzesPublicRoutes: FastifyPluginAsync = async (app) => {
  /** اختبارات منشورة للمتعلّم (مزامنة مع سوبر الأدمن / الملف المُنشأ في الريبو). */
  app.get(
    '/quizzes',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { quizzes: { type: 'array', items: { type: 'object', additionalProperties: true } } },
            required: ['quizzes']
          }
        }
      }
    },
    async (_req, reply) => {
      await bootstrapQuizzesSnapshotIfEmpty();
      const body = await getLearnerQuizzesPayload();
      return reply.send(body);
    }
  );
};
