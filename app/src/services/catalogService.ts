import type { StageInfo } from '@/types/course';
import { getApiBase } from '@/services/http/client';

export type CatalogPayload = { stages: StageInfo[] };

/** كتالوج المنصة المنشور (قراءة عامة؛ لا يتطلّب تسجيل دخول). */
export async function fetchPublicCatalog(): Promise<CatalogPayload | null> {
  const base = getApiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/v1/catalog`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    return (await res.json()) as CatalogPayload;
  } catch {
    return null;
  }
}
