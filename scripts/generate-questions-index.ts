#!/usr/bin/env node
/**
 * يولّد `app/src/fixtures/demo-catalog/questions/index.ts` من `data/question-bank/<id>/<id>.json`.
 * تشغيل من `app/`: `npm run generate:questions-index`
 * أو من جذر المستودع: `node --experimental-strip-types scripts/generate-questions-index.ts`
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** ترتيب عرض تجريبي «اختبار الأنواع الـ13» (كما كان في الباريل القديم). */
const KNOWN_ORDER: string[] = [
  'h6BUdTq8mlZF',
  'ez4qZIee1JRJ',
  'sN60JSqrR7gs',
  'rydFhoRMss7i',
  'rsnXPsuAAIwj',
  'xhmJJ96Ok9GL',
  'NhhTGeu6t143',
  'cbR4YFjjX9bv',
  'OrC3aNLdxGfr',
  'fR6EgHDrG7rT',
  'NZ1sSA2uCiVI',
  'xvbZAePtnbLe',
  '55IE8sM9yJrr'
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bankRoot = join(root, 'data', 'question-bank');
const outFile = join(
  root,
  'app',
  'src',
  'fixtures',
  'demo-catalog',
  'questions',
  'index.ts'
);

function idsOnDisk(): string[] {
  if (!existsSync(bankRoot)) return [];
  return readdirSync(bankRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((id) => existsSync(join(bankRoot, id, `${id}.json`)));
}

function main(): void {
  const onDisk = new Set(idsOnDisk());
  const ordered: string[] = [];
  for (const id of KNOWN_ORDER) {
    if (onDisk.has(id)) ordered.push(id);
  }
  const rest = [...onDisk].filter((id) => !ordered.includes(id)).sort((a, b) => a.localeCompare(b));
  ordered.push(...rest);

  if (ordered.length === 0) {
    console.warn('لا توجد أسئلة في', bankRoot);
  }

  const lines: string[] = [
    '// مُولَّد تلقائياً بواسطة scripts/generate-questions-index.ts — لا تُحرَّر يدوياً.',
    "import type { AnyQuestion } from '../../../types/quiz';",
    ''
  ];

  function importName(id: string): string {
    return `q_${id.replace(/\W/g, '_')}`;
  }

  for (const id of ordered) {
    lines.push(`import ${importName(id)} from '@questionBank/${id}/${id}.json';`);
  }

  lines.push('');
  lines.push('export const allQuestions: AnyQuestion[] = [');
  for (const id of ordered) {
    lines.push(`  ${importName(id)} as AnyQuestion,`);
  }
  lines.push('];');
  lines.push('');

  writeFileSync(outFile, lines.join('\n'), 'utf-8');
  console.log('Wrote', outFile, `(${ordered.length} questions)`);
}

main();
