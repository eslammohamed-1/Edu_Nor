import type { Quiz } from '@/types/quiz';
import { getApiBase } from '@/services/http/client';

/** اختبارات منشورة من الخادم (تتطابق مع لوحة السوبر أدمن عند المزامنة). */
export async function fetchPublicQuizzes(): Promise<Quiz[] | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/quizzes`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { quizzes?: Quiz[] };
    return body.quizzes ?? [];
  } catch {
    return null;
  }
}
