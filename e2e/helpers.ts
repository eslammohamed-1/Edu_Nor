/** مساعدة مشتركة لاختبارات Playwright (U7) */

export const DEFAULT_API = process.env.E2E_API_URL ?? 'http://127.0.0.1:3001';

export async function appReachable(baseURL: string | undefined): Promise<boolean> {
  if (!baseURL) return false;
  try {
    const r = await fetch(baseURL);
    return r.ok;
  } catch {
    return false;
  }
}

export async function apiReachable(api: string = DEFAULT_API): Promise<boolean> {
  try {
    const r = await fetch(`${api}/health`);
    return r.ok;
  } catch {
    return false;
  }
}
