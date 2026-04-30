#!/usr/bin/env node
/** يولّد `app/src/fixtures/demo-catalog/generated/quizzes.snapshot.json` من `quizzes.ts` لاستخدام الخادم والـseed.
 * تشغيل من جذر المشروع: `./server/node_modules/.bin/tsx scripts/export-quizzes-snapshot.ts`
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, '..');

  const mod = await import('../app/src/fixtures/demo-catalog/quizzes.ts');
  const { quizzes } = mod;

  const outPath = join(
    root,
    'app/src/fixtures/demo-catalog/generated/quizzes.snapshot.json'
  );
  mkdirSync(dirname(outPath), { recursive: true });

  const adminQs = quizzes.map((q) => ({
    ...q,
    status: 'published' as const,
    tags: [] as string[],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  writeFileSync(outPath, JSON.stringify(adminQs));
  console.log('Wrote', outPath, '(' + adminQs.length + ' quizzes)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
