import { apiFetch } from '@/services/http/client';
import { toAnswerEnvelope, type QuizAnswerEnvelopeV1 } from '@/schemas/quizAnswerPayload';

/** مستوى التجريد فوق مسار محاولات الاختبار — يُستخدم مع `VITE_API_BASE_URL` (U3-016). */

export async function startQuizAttempt(quizId: string): Promise<{
  attemptId: string;
  quizId: string;
  startedAt: string;
}> {
  const res = await apiFetch('/api/v1/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify({ quizId })
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `start attempt failed: ${res.status}`);
  }
  return res.json() as Promise<{ attemptId: string; quizId: string; startedAt: string }>;
}

export async function saveQuizAttemptAnswer(
  attemptId: string,
  questionId: string,
  rawValue: string | null
): Promise<void> {
  const payload: QuizAnswerEnvelopeV1 = toAnswerEnvelope(rawValue);
  const res = await apiFetch(`/api/v1/quiz-attempts/${attemptId}/answer`, {
    method: 'PATCH',
    body: JSON.stringify({ questionId, payload })
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `save answer failed: ${res.status}`);
  }
}

export async function submitQuizAttempt(attemptId: string): Promise<{
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  finishedAt: string;
}> {
  const res = await apiFetch(`/api/v1/quiz-attempts/${attemptId}/submit`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `submit failed: ${res.status}`);
  }
  return res.json() as Promise<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    finishedAt: string;
  }>;
}
