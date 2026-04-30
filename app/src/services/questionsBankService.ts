import type { AnyQuestion } from '@/types/quiz';
import { getApiBase } from '@/services/http/client';

/** أسئلة من بنك الخادم (صف لكل سوال)، مفهرسة بالمعرف. */
export async function fetchPublicQuestionsBank(): Promise<Map<string, AnyQuestion> | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/questions-bank`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { questions?: unknown };
    const arr = Array.isArray(body.questions) ? body.questions : [];
    const map = new Map<string, AnyQuestion>();
    for (const item of arr) {
      if (item && typeof item === 'object' && 'id' in item && typeof (item as { id: unknown }).id === 'string') {
        map.set((item as { id: string }).id, item as AnyQuestion);
      }
    }
    return map;
  } catch {
    return null;
  }
}
