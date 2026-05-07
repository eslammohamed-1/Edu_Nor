import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';
import type { FastifyInstance } from 'fastify';
import type { QuizAttempt, QuizAttemptAnswer } from '@prisma/client';
import { signAccessToken } from '../lib/tokens.js';
import { findLearnerQuizById } from '../lib/quiz-content.js';
import { awardQuizPass } from '../lib/gamification.js';
import { tryIssueQuizPassCertificate } from '../lib/certificates.js';
import { prismaMock, resetPrismaMock } from './utils/prismaMock.js';
import { buildTestApp } from './helpers/testApp.js';

vi.mock('../db.js', () => ({
  prisma: prismaMock
}));

vi.mock('../lib/quiz-content.js', () => ({
  findLearnerQuizById: vi.fn()
}));

vi.mock('../lib/gamification.js', () => ({
  awardQuizPass: vi.fn(() => Promise.resolve()),
  reconcileAllUserStreaks: vi.fn(() => Promise.resolve())
}));

vi.mock('../lib/certificates.js', () => ({
  tryIssueQuizPassCertificate: vi.fn(() => Promise.resolve(false))
}));

const QUIZ_ID = 'quiz-test-1';
const STUDENT_ID = 'student-u1';

function snapOneMcq() {
  return {
    id: QUIZ_ID,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        choices: [
          { id: 'wrong', isCorrect: false },
          { id: 'right', isCorrect: true }
        ]
      }
    ]
  };
}

function baseAttempt(overrides: Partial<QuizAttempt> & { answers?: QuizAttemptAnswer[] } = {}): QuizAttempt & {
  answers: QuizAttemptAnswer[];
} {
  const { answers: ans, ...rest } = overrides;
  return {
    id: 'att-1',
    userId: STUDENT_ID,
    quizId: QUIZ_ID,
    startedAt: new Date('2026-01-01T12:00:00.000Z'),
    finishedAt: null,
    score: null,
    total: null,
    percentage: null,
    passed: null,
    metaJson: { v: 1, snapshot: snapOneMcq() },
    createdAt: new Date('2026-01-01T12:00:00.000Z'),
    ...rest,
    answers: ans ?? []
  } as QuizAttempt & { answers: QuizAttemptAnswer[] };
}

describe('quiz attempts routes (supertest)', () => {
  let app: FastifyInstance;
  let bearer: string;

  beforeEach(async () => {
    resetPrismaMock();
    vi.mocked(findLearnerQuizById).mockReset();
    vi.mocked(awardQuizPass).mockClear();
    vi.mocked(tryIssueQuizPassCertificate).mockClear();

    const built = await buildTestApp();
    app = built.app;
    bearer = signAccessToken(
      { sub: STUDENT_ID, role: 'student' },
      built.env.JWT_SECRET,
      900
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /quiz-attempts returns 401 without auth', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts')
      .send({ quizId: QUIZ_ID });
    expect(res.status).toBe(401);
  });

  it('POST /quiz-attempts returns 400 for invalid body', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts')
      .set('Authorization', `Bearer ${bearer}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('POST /quiz-attempts returns 403 when user banned', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ banned: true });
    vi.mocked(findLearnerQuizById).mockResolvedValue(snapOneMcq() as Record<string, unknown>);

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts')
      .set('Authorization', `Bearer ${bearer}`)
      .send({ quizId: QUIZ_ID });

    expect(res.status).toBe(403);
  });

  it('POST /quiz-attempts returns 404 when quiz not published', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ banned: false });
    vi.mocked(findLearnerQuizById).mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts')
      .set('Authorization', `Bearer ${bearer}`)
      .send({ quizId: QUIZ_ID });

    expect(res.status).toBe(404);
  });

  it('POST /quiz-attempts returns 201 and attempt id', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ banned: false });
    vi.mocked(findLearnerQuizById).mockResolvedValue(snapOneMcq() as Record<string, unknown>);
    prismaMock.quizAttempt.create.mockResolvedValue({
      id: 'new-att',
      userId: STUDENT_ID,
      quizId: QUIZ_ID,
      startedAt: new Date('2026-01-01T12:00:00.000Z'),
      finishedAt: null,
      score: null,
      total: null,
      percentage: null,
      passed: null,
      metaJson: {},
      createdAt: new Date()
    });

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts')
      .set('Authorization', `Bearer ${bearer}`)
      .send({ quizId: QUIZ_ID });

    expect(res.status).toBe(201);
    expect(res.body.attemptId).toBe('new-att');
    expect(res.body.quizId).toBe(QUIZ_ID);
  });

  it('PATCH .../answer returns 404 for wrong owner', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(
      baseAttempt({ id: 'att-x', userId: 'other-user' })
    );

    const res = await supertest(app.server)
      .patch('/api/v1/quiz-attempts/att-x/answer')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        questionId: 'q1',
        payload: { v: 1, kind: 'raw', value: 'right' }
      });

    expect(res.status).toBe(404);
  });

  it('PATCH .../answer returns 400 for invalid answer envelope', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(baseAttempt());

    const res = await supertest(app.server)
      .patch('/api/v1/quiz-attempts/att-1/answer')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        questionId: 'q1',
        payload: { v: 2, kind: 'raw', value: 'x' }
      });

    expect(res.status).toBe(400);
  });

  it('PATCH .../answer returns 400 when question not in snapshot', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(baseAttempt());

    const res = await supertest(app.server)
      .patch('/api/v1/quiz-attempts/att-1/answer')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        questionId: 'unknown-q',
        payload: { v: 1, kind: 'raw', value: 'right' }
      });

    expect(res.status).toBe(400);
  });

  it('PATCH .../answer returns 409 when attempt already submitted', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(
      baseAttempt({ finishedAt: new Date('2026-01-02T00:00:00.000Z') })
    );

    const res = await supertest(app.server)
      .patch('/api/v1/quiz-attempts/att-1/answer')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        questionId: 'q1',
        payload: { v: 1, kind: 'raw', value: 'right' }
      });

    expect(res.status).toBe(409);
  });

  it('PATCH .../answer returns 200 and stores answer', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(baseAttempt());
    prismaMock.quizAttemptAnswer.findFirst.mockResolvedValue(null);
    prismaMock.quizAttemptAnswer.create.mockResolvedValue({} as QuizAttemptAnswer);

    const res = await supertest(app.server)
      .patch('/api/v1/quiz-attempts/att-1/answer')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        questionId: 'q1',
        payload: { v: 1, kind: 'raw', value: 'right' }
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(prismaMock.quizAttemptAnswer.create).toHaveBeenCalled();
  });

  it('POST .../submit returns 404 when attempt missing', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts/missing-att/submit')
      .set('Authorization', `Bearer ${bearer}`);

    expect(res.status).toBe(404);
  });

  it('POST .../submit returns 409 when already finished', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(
      baseAttempt({ finishedAt: new Date('2026-01-03T00:00:00.000Z') })
    );

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts/att-1/submit')
      .set('Authorization', `Bearer ${bearer}`);

    expect(res.status).toBe(409);
  });

  it('POST .../submit scores failed attempt without calling gamification', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue(baseAttempt({ answers: [] }));
    prismaMock.quizAttemptAnswer.findFirst.mockResolvedValue(null);
    prismaMock.quizAttemptAnswer.create.mockResolvedValue({} as QuizAttemptAnswer);
    prismaMock.quizAttempt.update.mockResolvedValue(baseAttempt({ finishedAt: new Date(), passed: false }));

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts/att-1/submit')
      .set('Authorization', `Bearer ${bearer}`);

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(false);
    expect(res.body.percentage).toBe(0);
    expect(vi.mocked(awardQuizPass)).not.toHaveBeenCalled();
  });

  it('POST .../submit passes and triggers certificate + gamification hooks', async () => {
    const ans: QuizAttemptAnswer = {
      id: 'ans-1',
      attemptId: 'att-1',
      questionId: 'q1',
      answerPayload: { v: 1, kind: 'raw', value: 'right' },
      isCorrect: null,
      pointsAwarded: null
    };
    prismaMock.quizAttempt.findUnique.mockResolvedValue(baseAttempt({ answers: [ans] }));
    prismaMock.quizAttemptAnswer.findFirst.mockResolvedValue({ id: 'ans-1' } as QuizAttemptAnswer);
    prismaMock.quizAttemptAnswer.update.mockResolvedValue(ans);
    prismaMock.quizAttempt.update.mockResolvedValue(
      baseAttempt({
        finishedAt: new Date(),
        passed: true,
        score: 1,
        total: 1,
        percentage: 100
      })
    );

    const res = await supertest(app.server)
      .post('/api/v1/quiz-attempts/att-1/submit')
      .set('Authorization', `Bearer ${bearer}`)
      .set('X-Client-Date', '2026-05-08');

    expect(res.status).toBe(200);
    expect(res.body.passed).toBe(true);
    expect(res.body.percentage).toBe(100);

    await vi.waitFor(() => {
      expect(vi.mocked(awardQuizPass)).toHaveBeenCalled();
    });
    expect(vi.mocked(tryIssueQuizPassCertificate)).toHaveBeenCalled();
  });
});
