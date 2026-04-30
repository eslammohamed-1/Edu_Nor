import type { FastifyPluginAsync } from 'fastify';
import { getPrismaQuestionsBank } from '../questionsDb.js';

/** قراءة عامة لبنك الأسئلة (SQLite منفصل)، صف واحد لكل سوال بحسب المعرف الداخلي. */
export const questionsBankPublicRoutes: FastifyPluginAsync = async (app) => {
  app.get('/questions-bank', async (_req, reply) => {
    const db = getPrismaQuestionsBank();
    const rows = await db.questionBankEntry.findMany({
      orderBy: { id: 'asc' }
    });
    const questions = rows.map((r) => JSON.parse(r.payloadJson) as unknown);
    return reply.send({ questions });
  });

  app.get('/questions/:id', async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const db = getPrismaQuestionsBank();
    const row = await db.questionBankEntry.findUnique({ where: { id } });
    if (!row) return reply.status(404).send({ error: 'السؤال غير موجود' });
    return reply.send(JSON.parse(row.payloadJson) as unknown);
  });
};
