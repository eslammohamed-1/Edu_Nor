import { apiFetch } from '@/services/http/client';

export interface LessonProgressItem {
  lessonId: string;
  status: string;
  watchedSeconds: number;
  completedAt: string | null;
}

export async function fetchMyLessonProgress(): Promise<LessonProgressItem[]> {
  const res = await apiFetch('/api/v1/me/progress');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `progress list failed: ${res.status}`);
  }
  const data = (await res.json()) as { items: LessonProgressItem[] };
  return data.items ?? [];
}

export async function postLessonProgress(body: {
  lessonId: string;
  watchedSeconds?: number;
  status?: 'in_progress' | 'completed';
}): Promise<void> {
  const res = await apiFetch('/api/v1/me/progress/lesson', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `progress save failed: ${res.status}`);
  }
}
