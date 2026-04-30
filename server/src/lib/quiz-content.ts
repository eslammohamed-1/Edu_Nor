import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import { prisma } from '../db.js';
import {
  bootstrapCatalogFromFixturesIfEmpty,
  getLearnerPublishedLessonRows,
  repoRootFromLib,
  ensureLessonSourceLessonKeysBackfilled
} from './catalog-content.js';

/** مصفوفة الاختبارات كما تحفظ في AdminSnapshot (حقول سوبر إضافية اختيارية). */
export const adminQuizzesArraySchema = z.array(z.record(z.unknown()));

export function assertValidAdminQuizzesPayload(data: unknown): void {
  try {
    adminQuizzesArraySchema.parse(data);
  } catch {
    throw new Error('قائمة اختبارات غير صالحة');
  }
}

function stripLearnerQuiz(q: Record<string, unknown>): Record<string, unknown> {
  const { status: _st, tags: _tg, createdAt: _c, updatedAt: _u, ...rest } = q;
  return rest;
}

/** يُنشَر للمتعلّم: مسودّات ومؤرشفة مخفية. */
export function filterQuizzesForLearner(admin: Record<string, unknown>[]): Record<string, unknown>[] {
  return admin
    .filter((item) => {
      const status = item.status as string | undefined;
      return status !== 'draft' && status !== 'archived';
    })
    .map(stripLearnerQuiz);
}

/**
 * - يعرّف quiz.lessonId على معرف الصف المنشور (يُستخدم في مسار الدرس بعد الهيدريت).
 * - يُسقط الاختبار إذا بقي مرجعه لدرس غير موجود (toc قديم دون مطابقة).
 */
export function normalizeLessonRefsInLearnerQuizzes(
  quizzes: Record<string, unknown>[],
  lessonRows: Array<{ id: string; sourceLessonKey: string | null }>
): Record<string, unknown>[] {
  const ids = new Set(lessonRows.map((r) => r.id));

  const bySourceKeyFirst = new Map<string, string>();
  const sorted = [...lessonRows].sort((a, b) => a.id.localeCompare(b.id));
  for (const r of sorted) {
    const sk = r.sourceLessonKey;
    if (sk && !bySourceKeyFirst.has(sk)) {
      bySourceKeyFirst.set(sk, r.id);
    }
  }

  const out: Record<string, unknown>[] = [];
  for (const q of quizzes) {
    const lid = q.lessonId;
    if (lid == null || lid === '' || typeof lid !== 'string') {
      out.push(q);
      continue;
    }
    if (ids.has(lid)) {
      out.push({ ...q, lessonId: lid });
      continue;
    }
    const mapped = bySourceKeyFirst.get(lid);
    if (mapped) {
      out.push({ ...q, lessonId: mapped });
      continue;
    }
  }
  return out;
}

export async function bootstrapQuizzesSnapshotIfEmpty(): Promise<boolean> {
  const row = await prisma.adminSnapshot.findUnique({ where: { key: 'quizzes' } });
  let already: unknown;
  try {
    already = row?.dataJson ? JSON.parse(row.dataJson) : null;
  } catch {
    already = null;
  }
  if (Array.isArray(already) && already.length > 0) return false;

  const snapshotPath = join(
    repoRootFromLib(),
    'app/src/fixtures/demo-catalog/generated/quizzes.snapshot.json'
  );
  const raw = await readFile(snapshotPath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  adminQuizzesArraySchema.parse(parsed);

  await prisma.adminSnapshot.upsert({
    where: { key: 'quizzes' },
    create: { key: 'quizzes', dataJson: JSON.stringify(parsed) },
    update: { dataJson: JSON.stringify(parsed) }
  });
  return true;
}

export async function getLearnerQuizzesPayload(): Promise<{ quizzes: unknown[] }> {
  await bootstrapCatalogFromFixturesIfEmpty();
  await ensureLessonSourceLessonKeysBackfilled();
  await bootstrapQuizzesSnapshotIfEmpty();
  const row = await prisma.adminSnapshot.findUnique({ where: { key: 'quizzes' } });
  if (!row?.dataJson) return { quizzes: [] };
  try {
    const data = JSON.parse(row.dataJson) as unknown;
    const parsed = adminQuizzesArraySchema.safeParse(data);
    if (!parsed.success || !parsed.data.length) return { quizzes: [] };
    let out = filterQuizzesForLearner(parsed.data as Record<string, unknown>[]);
    const lessonRows = await getLearnerPublishedLessonRows();
    out = normalizeLessonRefsInLearnerQuizzes(out, lessonRows);
    return { quizzes: out };
  } catch {
    return { quizzes: [] };
  }
}
