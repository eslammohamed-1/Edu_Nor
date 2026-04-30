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

  app.get('/questions-bank', async (_req, reply) => {
    const ids = listQuestionIdsOnDisk(root);
    const questions: unknown[] = [];
    for (const id of ids) {
      const q = readQuestionPayload(root, id);
      if (q != null) questions.push(q);
    }
    return reply.send({ questions });
  });

  app.get('/questions/:id', async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const q = readQuestionPayload(root, id);
    if (!q) return reply.status(404).send({ error: 'السؤال غير موجود' });
    return reply.send(q);
  });
};
