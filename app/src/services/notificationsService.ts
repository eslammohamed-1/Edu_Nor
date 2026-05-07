import { apiFetch, currentAccessToken, getApiBase } from '@/services/http/client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export async function fetchMyNotifications(opts?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const q = new URLSearchParams();
  if (opts?.limit) q.set('limit', String(opts.limit));
  if (opts?.unreadOnly) q.set('unreadOnly', '1');
  const res = await apiFetch(`/api/v1/me/notifications?${q}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'notifications list failed');
  }
  return (await res.json()) as { items: NotificationItem[]; unreadCount: number };
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await apiFetch(`/api/v1/me/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH'
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'mark read failed');
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await apiFetch('/api/v1/me/notifications/read-all', { method: 'PATCH' });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'mark all failed');
  }
}

export function connectNotificationSse(onData: (payload: unknown) => void): () => void {
  const base = getApiBase();
  const token = currentAccessToken();
  if (!base || !token) {
    return () => {};
  }
  const url = `${base}/api/v1/me/notifications/stream?accessToken=${encodeURIComponent(token)}`;
  const es = new EventSource(url);
  es.onmessage = (ev) => {
    try {
      onData(JSON.parse(ev.data) as unknown);
    } catch {
      /* تجاهل */
    }
  };
  es.onerror = () => {
    /* أغلق عند الخطأ؛ الواجهة تعيد المحاولة عند الحاجة */
    es.close();
  };
  return () => es.close();
}
