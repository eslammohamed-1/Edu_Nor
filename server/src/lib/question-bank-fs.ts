/**
 * قراءة بنك الأسئلة من القرص: `QUESTION_BANK_ROOT/<id>/<id>.json`.
 * جذر المستودع مُشتق من `repoRootFromLib` عند تعطيل المتغير.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

import { repoRootFromLib } from './catalog-content.js';

export function resolveQuestionBankRoot(envValue?: string): string {
  const v = envValue?.trim();
  const defaultAbs = join(repoRootFromLib(), 'data', 'question-bank');
  if (!v) return defaultAbs;
  if (isAbsolute(v)) return v;
  return join(repoRootFromLib(), v);
}

/** معرفات المجلّدات التي تحوي ملف `id/id.json` صالحاً. */
export function listQuestionIdsOnDisk(root: string): string[] {
  try {
    if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) return [];
  } catch {
    return [];
  }
  const names = readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const out: string[] = [];
  for (const id of names) {
    const file = join(root, id, `${id}.json`);
    try {
      if (!statSync(file).isFile()) continue;
      const raw = readFileSync(file, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (
        parsed &&
        typeof parsed === 'object' &&
        'id' in parsed &&
        typeof (parsed as { id: unknown }).id === 'string' &&
        (parsed as { id: string }).id === id
      ) {
        out.push(id);
      }
    } catch {
      /* تجاهل ملف أو JSON تالف */
    }
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

/** يقرأ وسيطاً واحداً أو يرجع `null`. */
export function readQuestionPayload(root: string, id: string): unknown | null {
  try {
    const file = join(root, id, `${id}.json`);
    if (!statSync(file).isFile()) return null;
    const raw = readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'id' in parsed &&
      typeof (parsed as { id: unknown }).id === 'string' &&
      (parsed as { id: string }).id === id
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
