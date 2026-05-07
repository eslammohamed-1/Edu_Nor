import { apiFetch } from '@/services/http/client';

export type MyCertificateListItem = {
  id: string;
  kind: string;
  title: string;
  issuedAt: string;
  subjectId: string;
  subjectName: string;
  quizId: string | null;
  signatureValid: boolean;
};

export type MyCertificateDetail = {
  id: string;
  kind: string;
  title: string;
  issuedAt: string;
  subjectId: string;
  subjectName: string;
  quizId: string | null;
  recipientName: string;
  signatureValid: boolean;
};

export async function fetchMyCertificates(): Promise<MyCertificateListItem[]> {
  const res = await apiFetch('/api/v1/me/certificates');
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? 'تعذّر جلب الشهادات');
  }
  const data = (await res.json()) as { items: MyCertificateListItem[] };
  return data.items;
}

export async function fetchMyCertificate(certificateId: string): Promise<MyCertificateDetail> {
  const res = await apiFetch(`/api/v1/me/certificates/${encodeURIComponent(certificateId)}`);
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? 'تعذّر جلب الشهادة');
  }
  return (await res.json()) as MyCertificateDetail;
}

/** رابط صفحة التحقق العامة (للنسخ والمشاركة). */
export function publicVerifyUrl(certificateId: string): string {
  const rawBase = (import.meta.env.BASE_URL as string) || '/';
  const prefix = rawBase.replace(/\/$/, '');
  const path = `${prefix}/cert/verify/${encodeURIComponent(certificateId)}`;
  return `${window.location.origin}${path}`;
}
