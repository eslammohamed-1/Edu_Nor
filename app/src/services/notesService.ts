import { apiFetch } from '@/services/http/client';

export interface BookmarkRow {
  lessonId: string;
  title: string;
  courseTitle: string;
  createdAt: string;
}

export interface NoteRow {
  lessonId: string;
  title: string;
  courseTitle: string;
  body: string;
  updatedAt: string;
}

export async function fetchBookmarks(): Promise<BookmarkRow[]> {
  const res = await apiFetch('/api/v1/me/bookmarks');
  if (!res.ok) throw new Error('bookmarks failed');
  const data = (await res.json()) as { items: BookmarkRow[] };
  return data.items ?? [];
}

export async function addBookmark(lessonId: string): Promise<void> {
  const res = await apiFetch('/api/v1/me/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ lessonId })
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'bookmark add failed');
  }
}

export async function removeBookmark(lessonId: string): Promise<void> {
  const res = await apiFetch(`/api/v1/me/bookmarks/${encodeURIComponent(lessonId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('bookmark remove failed');
}

export async function fetchNotes(): Promise<NoteRow[]> {
  const res = await apiFetch('/api/v1/me/notes');
  if (!res.ok) throw new Error('notes list failed');
  const data = (await res.json()) as { items: NoteRow[] };
  return data.items ?? [];
}

export async function upsertNote(lessonId: string, body: string): Promise<void> {
  const res = await apiFetch(`/api/v1/me/notes/${encodeURIComponent(lessonId)}`, {
    method: 'PUT',
    body: JSON.stringify({ body })
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'note save failed');
  }
}

export async function deleteNote(lessonId: string): Promise<void> {
  const res = await apiFetch(`/api/v1/me/notes/${encodeURIComponent(lessonId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('note delete failed');
}
