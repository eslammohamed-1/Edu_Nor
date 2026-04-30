import fs from 'fs';
import path from 'path';
import type { User } from '@prisma/client';

const HEADER = 'id,email,name,phone,stage,grade,secondary_track,registered_at\n';

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function resolveCsvDir(csvDataDir?: string): string {
  if (csvDataDir?.trim()) return path.resolve(csvDataDir.trim());
  return path.resolve(process.cwd(), '..', 'data', 'csv');
}

/**
 * إلحاق صف بمسجّل جديد في learners_export.csv (بدون كلمة مرور).
 * يُستخدم مع مصدر CSV المؤقت؛ الأخطاء تُسجَّل ولا تُفشل الطلب.
 */
export function appendLearnerExportCsv(csvDataDir: string | undefined, user: User): void {
  try {
    const dir = resolveCsvDir(csvDataDir);
    const file = path.join(dir, 'learners_export.csv');
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      fs.writeFileSync(file, HEADER, 'utf-8');
    }
    const row = [
      csvCell(user.id),
      csvCell(user.email),
      csvCell(user.name),
      csvCell(user.phone ?? ''),
      csvCell(user.stage ?? ''),
      csvCell(user.grade ?? ''),
      csvCell(user.secondaryTrack ?? ''),
      csvCell(user.createdAt.toISOString())
    ].join(',');
    fs.appendFileSync(file, `${row}\n`, 'utf-8');
  } catch (e) {
    console.error('[learnersCsv] append failed', e);
  }
}
