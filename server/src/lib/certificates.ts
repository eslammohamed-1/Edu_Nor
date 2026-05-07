import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { Certificate } from '@prisma/client';
import type { Env } from '../env.js';
import { prisma } from '../db.js';

export const CERT_KIND_SUBJECT_COMPLETION = 'subject_completion';
export const CERT_KIND_QUIZ_PASS = 'quiz_pass';

export function certificateSigningSecret(env: Env): string {
  return env.CERTIFICATE_HMAC_SECRET ?? env.JWT_SECRET;
}

type MetaJson = { v?: number; nonce?: string };

function canonicalSigningPayload(input: {
  userId: string;
  subjectId: string;
  quizId: string | null;
  kind: string;
  title: string;
  issuedAtIso: string;
  nonce: string;
}): string {
  return JSON.stringify({
    issuedAt: input.issuedAtIso,
    kind: input.kind,
    nonce: input.nonce,
    quizId: input.quizId,
    subjectId: input.subjectId,
    title: input.title,
    userId: input.userId
  });
}

export function signCertificatePayload(env: Env, input: Parameters<typeof canonicalSigningPayload>[0]): string {
  const secret = certificateSigningSecret(env);
  return createHmac('sha256', secret).update(canonicalSigningPayload(input)).digest('hex');
}

function timingSafeHexEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function verifyCertificateSignature(env: Env, cert: Certificate): boolean {
  const meta = cert.metaJson as MetaJson | null;
  const nonce = meta?.nonce;
  if (typeof nonce !== 'string' || nonce.length < 8) return false;

  const expected = signCertificatePayload(env, {
    userId: cert.userId,
    subjectId: cert.subjectId,
    quizId: cert.quizId,
    kind: cert.kind,
    title: cert.title,
    issuedAtIso: cert.issuedAt.toISOString(),
    nonce
  });

  return timingSafeHexEqual(expected, cert.hashSignature);
}

async function subjectLessonIds(subjectId: string): Promise<string[]> {
  const rows = await prisma.lesson.findMany({
    where: { chapter: { course: { subjectId } } },
    select: { id: true }
  });
  return rows.map((r) => r.id);
}

export async function resolveSubjectIdForLesson(lessonId: string): Promise<string | null> {
  const row = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { chapter: { select: { course: { select: { subjectId: true } } } } }
  });
  return row?.chapter.course.subjectId ?? null;
}

export async function tryIssueSubjectCompletionCertificate(
  env: Env,
  userId: string,
  lessonId: string
): Promise<boolean> {
  const subjectId = await resolveSubjectIdForLesson(lessonId);
  if (!subjectId) return false;

  const lessonIds = await subjectLessonIds(subjectId);
  if (lessonIds.length === 0) return false;

  const completed = await prisma.lessonProgress.count({
    where: { userId, lessonId: { in: lessonIds }, status: 'completed' }
  });
  if (completed < lessonIds.length) return false;

  const existing = await prisma.certificate.findFirst({
    where: {
      userId,
      subjectId,
      kind: CERT_KIND_SUBJECT_COMPLETION,
      quizId: null
    }
  });
  if (existing) return false;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true }
  });
  if (!subject) return false;

  const title = `إتمام جميع دروس مادة ${subject.name}`;
  const nonce = randomBytes(16).toString('hex');
  const issuedAt = new Date();
  const hashSignature = signCertificatePayload(env, {
    userId,
    subjectId,
    quizId: null,
    kind: CERT_KIND_SUBJECT_COMPLETION,
    title,
    issuedAtIso: issuedAt.toISOString(),
    nonce
  });

  await prisma.certificate.create({
    data: {
      userId,
      subjectId,
      quizId: null,
      kind: CERT_KIND_SUBJECT_COMPLETION,
      title,
      hashSignature,
      issuedAt,
      metaJson: { v: 1, nonce }
    }
  });
  return true;
}

export async function tryIssueQuizPassCertificate(env: Env, userId: string, quizId: string): Promise<void> {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, subjectId: true, title: true }
  });
  if (!quiz) return;

  const existing = await prisma.certificate.findFirst({
    where: { userId, quizId, kind: CERT_KIND_QUIZ_PASS }
  });
  if (existing) return;

  const title = `اجتياز اختبار: ${quiz.title}`;
  const nonce = randomBytes(16).toString('hex');
  const issuedAt = new Date();
  const hashSignature = signCertificatePayload(env, {
    userId,
    subjectId: quiz.subjectId,
    quizId: quiz.id,
    kind: CERT_KIND_QUIZ_PASS,
    title,
    issuedAtIso: issuedAt.toISOString(),
    nonce
  });

  await prisma.certificate.create({
    data: {
      userId,
      subjectId: quiz.subjectId,
      quizId: quiz.id,
      kind: CERT_KIND_QUIZ_PASS,
      title,
      hashSignature,
      issuedAt,
      metaJson: { v: 1, nonce }
    }
  });
}
