import { downloadCSV } from './csv';

const EDUNOR_KEYS_PREFIX = 'edunor';

export function exportAll(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(EDUNOR_KEYS_PREFIX) || key === 'edunor_auth' || key === 'edunor_theme')) {
      try {
        const raw = localStorage.getItem(key);
        data[key] = raw ? JSON.parse(raw) : null;
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function downloadBackup() {
  const content = exportAll();
  const filename = `edunor-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface RestoreResult {
  ok: boolean;
  keysRestored: number;
  error?: string;
}

export function importAll(jsonString: string): RestoreResult {
  try {
    const parsed = JSON.parse(jsonString) as { version: number; data: Record<string, unknown> };
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { ok: false, keysRestored: 0, error: 'صيغة الملف غير صحيحة' };
    }
    let count = 0;
    for (const [key, value] of Object.entries(parsed.data)) {
      if (key.startsWith(EDUNOR_KEYS_PREFIX) || key === 'edunor_auth' || key === 'edunor_theme') {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        count++;
      }
    }
    return { ok: true, keysRestored: count };
  } catch (e) {
    return { ok: false, keysRestored: 0, error: 'فشل تحليل الملف' };
  }
}

// Keep CSV import for type safety — re-export for convenience
export { downloadCSV };
