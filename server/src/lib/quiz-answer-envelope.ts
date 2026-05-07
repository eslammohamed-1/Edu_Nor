import { z } from 'zod';

export const QUIZ_ANSWER_ENVELOPE_VERSION = 1 as const;

export const quizAnswerEnvelopeV1Schema = z.object({
  v: z.literal(1),
  kind: z.enum(['raw']),
  value: z.string().max(600_000)
});

export type QuizAnswerEnvelopeV1 = z.infer<typeof quizAnswerEnvelopeV1Schema>;

export function parseQuizAnswerEnvelope(raw: unknown): QuizAnswerEnvelopeV1 {
  return quizAnswerEnvelopeV1Schema.parse(raw);
}

export function envelopeToRawString(e: QuizAnswerEnvelopeV1): string | null {
  const t = e.value.trim();
  return t === '' ? null : e.value;
}
