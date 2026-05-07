import type { FastifyPluginAsync } from 'fastify';
import type { Env } from '../env.js';
import {
  readQuestionPayload,
  listQuestionIdsOnDisk,
  resolveQuestionBankRoot
} from '../lib/question-bank-fs.js';

export const questionsBankPublicRoutes: FastifyPluginAsync<{ env: Env }> = async (
  app,
  { env }
) => {
  const root = resolveQuestionBankRoot(env.QUESTION_BANK_ROOT);

  app.get(
    '/questions-bank',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { questions: { type: 'array', items: { type: 'object', additionalProperties: true } } },
            required: ['questions']
          }
        }
      }
    },
    async (_req, reply) => {
      const ids = listQuestionIdsOnDisk(root);
      const questions: unknown[] = [];
      for (const id of ids) {
        const q = readQuestionPayload(root, id);
        if (q != null) questions.push(q);
      }
      return reply.send({ questions });
    }
  );

  app.get(
    '/questions/:id',
    {
      schema: {
        params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        response: {
          200: { type: 'object', additionalProperties: true },
          404: {
            type: 'object',
            properties: { error: { type: 'string' } },
            required: ['error']
          }
        }
      }
    },
    async (req, reply) => {
      const id = (req.params as { id: string }).id;
      const q = readQuestionPayload(root, id);
      if (!q) return reply.status(404).send({ error: 'السؤال غير موجود' });
      return reply.send(q);
    }
  );
};
