import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { assertValidAdminQuizzesPayload } from './quiz-content.js';

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function choiceOptionTypes(type: string): boolean {
  return type === 'mcq' || type === 'mrq' || type === 'opinion' || type === 'ordering' || type === 'gap';
}

function buildPayload(q: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  const {
    id: _i,
    type: _t,
    stem: _s,
    points: _p,
    choices: _c,
    ...rest
  } = q;
  if (Object.keys(rest).length === 0) return undefined;
  return rest as Prisma.InputJsonValue;
}

function extractOptions(
  q: Record<string, unknown>
): Array<{ id: string; label: string; isCorrect: boolean; position: number }> {
  const type = String(q.type ?? '');
  if (!choiceOptionTypes(type)) return [];
  const choices = q.choices;
  if (!Array.isArray(choices)) return [];
  return choices.map((raw, i) => {
    const ch = asRecord(raw);
    const idBase = String(q.id ?? 'q');
    const id = String(ch?.id ?? `${idBase}-opt-${i}`);
    const label = String(ch?.label ?? '');
    const isCorrect = Boolean(ch?.isCorrect);
    return { id, label, isCorrect, position: i };
  });
}

/**
 * نسخ اختبارات من `AdminSnapshot.quizzes` إلى جداول `Quiz` / `QuizQuestion` / `QuizQuestionOption`.
 * مسار للمرة الواحدة بعد U1 — يُعاد تشغيله بأمان (يستبدل أسئلة كل اختبار).
 */
export async function migrateQuizzesFromAdminSnapshot(): Promise<{
  quizzes: number;
  questions: number;
}> {
  const row = await prisma.adminSnapshot.findUnique({ where: { key: 'quizzes' } });
  if (!row?.dataJson) {
    console.warn('لا يوجد لقطة quizzes في AdminSnapshot');
    return { quizzes: 0, questions: 0 };
  }
  let data: unknown;
  try {
    data = JSON.parse(row.dataJson);
  } catch {
    console.warn('JSON غير صالح في AdminSnapshot.quizzes');
    return { quizzes: 0, questions: 0 };
  }
  assertValidAdminQuizzesPayload(data);
  const arr = data as unknown[];

  let quizCount = 0;
  let questionCount = 0;

  for (const raw of arr) {
    const quiz = asRecord(raw);
    if (!quiz) continue;
    const id = String(quiz.id ?? '');
    if (!id) continue;

    const title = String(quiz.title ?? '');
    const description = String(quiz.description ?? '');
    const subjectId = String(quiz.subjectId ?? '');
    const grade = String(quiz.grade ?? '');
    const lessonId = quiz.lessonId != null && quiz.lessonId !== '' ? String(quiz.lessonId) : null;
    const duration = Number(quiz.duration ?? 30) || 30;
    const passingScore = Number(quiz.passingScore ?? 60) || 60;
    const status = quiz.status != null ? String(quiz.status) : 'published';

    const questions = quiz.questions;
    if (!Array.isArray(questions)) continue;

    await prisma.$transaction(async (tx) => {
      await tx.quiz.upsert({
        where: { id },
        create: {
          id,
          title,
          description,
          subjectId,
          grade,
          lessonId,
          duration,
          passingScore,
          status
        },
        update: {
          title,
          description,
          subjectId,
          grade,
          lessonId,
          duration,
          passingScore,
          status
        }
      });

      await tx.quizQuestion.deleteMany({ where: { quizId: id } });

      for (let i = 0; i < questions.length; i++) {
        const qr = asRecord(questions[i]);
        if (!qr) continue;
        const qid = String(qr.id ?? `${id}-q-${i}`);
        const qtype = String(qr.type ?? 'mcq');
        const stem = String(qr.stem ?? '');
        const pts = qr.points != null ? Number(qr.points) : 1;
        const points = Number.isFinite(pts) ? pts : 1;
        const payload = buildPayload(qr);
        const options = extractOptions(qr);

        await tx.quizQuestion.create({
          data: {
            id: qid,
            quizId: id,
            position: i,
            type: qtype,
            stem,
            payload: payload ?? undefined,
            points,
            ...(options.length
              ? {
                  options: {
                    create: options.map((o) => ({
                      id: o.id,
                      label: o.label,
                      isCorrect: o.isCorrect,
                      position: o.position
                    }))
                  }
                }
              : {})
          }
        });
        questionCount += 1;
      }
    });

    quizCount += 1;
  }

  return { quizzes: quizCount, questions: questionCount };
}
