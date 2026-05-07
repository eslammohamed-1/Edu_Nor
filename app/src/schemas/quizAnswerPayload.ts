import { z } from 'zod';

/** إصدار غلاف الإجابة المخزَّن في `QuizAttemptAnswer.answerPayload` وواجهات الـ API. */
export const QUIZ_ANSWER_ENVELOPE_VERSION = 1 as const;

/**
 * غلاف موحّد: `value` هي نفس السلسلة المستخدمة في العميل (`Pinia` / `QuizQuestion`)
 * وقد تكون JSON داخل نص (mrq، ترتيب، مركّب، …).
 */
export const quizAnswerEnvelopeV1Schema = z.object({
  v: z.literal(1),
  kind: z.enum(['raw']),
  value: z.string().max(600_000)
});

export type QuizAnswerEnvelopeV1 = z.infer<typeof quizAnswerEnvelopeV1Schema>;

export function parseQuizAnswerEnvelope(raw: unknown): QuizAnswerEnvelopeV1 {
  return quizAnswerEnvelopeV1Schema.parse(raw);
}

/** تحويل من قيمة السؤال الواحد في المتجر إلى غلاف للـ API. */
export function toAnswerEnvelope(value: string | null | undefined): QuizAnswerEnvelopeV1 {
  return { v: 1, kind: 'raw', value: value ?? '' };
}

/** استخراج السلسلة للتصحيح كما في `gradeAnswer` المحلي. */
export function envelopeToRawString(e: QuizAnswerEnvelopeV1): string | null {
  const t = e.value.trim();
  return t === '' ? null : e.value;
}
