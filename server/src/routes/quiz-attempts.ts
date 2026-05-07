import type { FastifyPluginAsync } from 'fastify';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db.js';
import { loadEnv } from '../env.js';
import { tryIssueQuizPassCertificate } from '../lib/certificates.js';
import { findLearnerQuizById } from '../lib/quiz-content.js';
import {
  parseQuizAnswerEnvelope,
  envelopeToRawString,
  type QuizAnswerEnvelopeV1
} from '../lib/quiz-answer-envelope.js';
import { gradeAnswerJson } from '../lib/quiz-scoring.js';

const certEnv = loadEnv();

const startBodySchema = z.object({
  quizId: z.string().min(1)
});

const patchAnswerBodySchema = z.object({
  questionId: z.string().min(1),
  payload: z.unknown()
});

type QuizSnapshot = Record<string, unknown>;

function arr(v: unknown): unknown[] | undefined {
  return Array.isArray(v) ? v : undefined;
}

export const quizAttemptsRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/quiz-attempts',
    {
      schema: {
        description: 'بدء محاولة اختبار (لقطة من الاختبار المنشور للمتعلّم)',
        body: {
          type: 'object',
          required: ['quizId'],
          properties: { quizId: { type: 'string' } }
        },
        response: {
          201: {
            type: 'object',
            properties: {
              attemptId: { type: 'string' },
              quizId: { type: 'string' },
              startedAt: { type: 'string' }
            }
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } },
          403: { type: 'object', properties: { error: { type: 'string' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = req.authUser;
      if (!user) return reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });

      const parsed = startBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'quizId غير صالح' });
      }

      const u = await prisma.user.findUnique({ where: { id: user.id }, select: { banned: true } });
      if (!u || u.banned) {
        return reply.status(403).send({ error: 'الحساب غير مصرّح له' });
      }

      const quizId = parsed.data.quizId;
      const snapshot = await findLearnerQuizById(quizId);
      if (!snapshot) {
        return reply.status(404).send({ error: 'الاختبار غير موجود أو غير متاح' });
      }

      const row = await prisma.quizAttempt.create({
        data: {
          userId: user.id,
          quizId,
          metaJson: { v: 1, snapshot } as Prisma.InputJsonValue
        }
      });

      return reply.status(201).send({
        attemptId: row.id,
        quizId: row.quizId,
        startedAt: row.startedAt.toISOString()
      });
    }
  );

  app.patch(
    '/quiz-attempts/:attemptId/answer',
    {
      schema: {
        description: 'حفظ إجابة وسيطة',
        params: {
          type: 'object',
          required: ['attemptId'],
          properties: { attemptId: { type: 'string' } }
        },
        body: {
          type: 'object',
          required: ['questionId', 'payload'],
          properties: {
            questionId: { type: 'string' },
            payload: { type: 'object', additionalProperties: true }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: { ok: { type: 'boolean' } }
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } },
          403: { type: 'object', properties: { error: { type: 'string' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } },
          409: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = req.authUser;
      if (!user) return reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });

      const attemptId = (req.params as { attemptId: string }).attemptId;
      const parsed = patchAnswerBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'جسم الطلب غير صالح' });
      }

      const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
      if (!attempt || attempt.userId !== user.id) {
        return reply.status(404).send({ error: 'المحاولة غير موجودة' });
      }
      if (attempt.finishedAt != null) {
        return reply.status(409).send({ error: 'المحاولة مُسلَّمة مسبقًا' });
      }

      let envelope: QuizAnswerEnvelopeV1;
      try {
        envelope = parseQuizAnswerEnvelope(parsed.data.payload);
      } catch {
        return reply.status(400).send({ error: 'صيغة الإجابة غير صالحة' });
      }

      const meta = attempt.metaJson as { v?: number; snapshot?: QuizSnapshot } | null;
      const snap = meta?.snapshot;
      const questions = snap != null ? arr(snap.questions) : undefined;
      if (!questions || !questions.length) {
        return reply.status(400).send({ error: 'لقطة الاختبار تالفة' });
      }

      const qid = parsed.data.questionId;
      const allowed = questions.some((q) => {
        const o = q as Record<string, unknown>;
        return String(o.id ?? '') === qid;
      });
      if (!allowed) {
        return reply.status(400).send({ error: 'معرّف السؤال لا ينتمي لهذا الاختبار' });
      }

      const payloadJson = envelope as unknown as Prisma.InputJsonValue;

      const existing = await prisma.quizAttemptAnswer.findFirst({
        where: { attemptId, questionId: qid }
      });

      if (existing) {
        await prisma.quizAttemptAnswer.update({
          where: { id: existing.id },
          data: {
            answerPayload: payloadJson,
            isCorrect: null,
            pointsAwarded: null
          }
        });
      } else {
        await prisma.quizAttemptAnswer.create({
          data: {
            attemptId,
            questionId: qid,
            answerPayload: payloadJson
          }
        });
      }

      return reply.send({ ok: true });
    }
  );

  app.post(
    '/quiz-attempts/:attemptId/submit',
    {
      schema: {
        description: 'تسليم نهائي مع تصحيح',
        params: {
          type: 'object',
          required: ['attemptId'],
          properties: { attemptId: { type: 'string' } }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              total: { type: 'number' },
              percentage: { type: 'number' },
              passed: { type: 'boolean' },
              finishedAt: { type: 'string' }
            }
          },
          400: { type: 'object', properties: { error: { type: 'string' } } },
          401: { type: 'object', properties: { error: { type: 'string' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } },
          409: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = req.authUser;
      if (!user) return reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });

      const attemptId = (req.params as { attemptId: string }).attemptId;

      const attempt = await prisma.quizAttempt.findUnique({
        where: { id: attemptId },
        include: { answers: true }
      });

      if (!attempt || attempt.userId !== user.id) {
        return reply.status(404).send({ error: 'المحاولة غير موجودة' });
      }
      if (attempt.finishedAt != null) {
        return reply.status(409).send({ error: 'المحاولة مُسلَّمة مسبقًا' });
      }

      const meta = attempt.metaJson as { v?: number; snapshot?: QuizSnapshot } | null;
      const snap = meta?.snapshot;
      const questions = snap != null ? arr(snap.questions) : undefined;
      if (!questions || !questions.length) {
        return reply.status(400).send({ error: 'لقطة الاختبار تالفة' });
      }

      const byQuestion = new Map<string, QuizAnswerEnvelopeV1>();
      for (const a of attempt.answers) {
        try {
          const env = parseQuizAnswerEnvelope(a.answerPayload);
          byQuestion.set(a.questionId, env);
        } catch {
          /* يُعدّ خطأ في التصحيح */
        }
      }

      let score = 0;
      const total = questions.length;
      const passingScore = Number(snap?.passingScore ?? 60);

      for (const item of questions) {
        const q = item as Record<string, unknown>;
        const qid = String(q.id ?? '');
        const env = byQuestion.get(qid);
        const raw = env != null ? envelopeToRawString(env) : null;
        const ok = gradeAnswerJson(q, raw);

        if (ok) score += 1;

        const row = await prisma.quizAttemptAnswer.findFirst({
          where: { attemptId, questionId: qid }
        });
        if (row) {
          await prisma.quizAttemptAnswer.update({
            where: { id: row.id },
            data: {
              isCorrect: ok,
              pointsAwarded: ok ? 1 : 0
            }
          });
        } else {
          await prisma.quizAttemptAnswer.create({
            data: {
              attemptId,
              questionId: qid,
              answerPayload: { v: 1, kind: 'raw', value: '' },
              isCorrect: ok,
              pointsAwarded: ok ? 1 : 0
            }
          });
        }
      }

      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = percentage >= passingScore;

      const finishedAt = new Date();
      await prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          finishedAt,
          score,
          total,
          percentage,
          passed
        }
      });

      if (passed) {
        void tryIssueQuizPassCertificate(certEnv, user.id, attempt.quizId).catch((err) => {
          req.log.warn({ err }, 'issue quiz certificate failed');
        });
      }

      return reply.send({
        score,
        total,
        percentage,
        passed,
        finishedAt: finishedAt.toISOString()
      });
    }
  );
};
