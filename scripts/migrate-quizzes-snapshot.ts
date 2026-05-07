#!/usr/bin/env node
/**
 * يملأ جداول Quiz / من لقطة `AdminSnapshot.quizzes`.
 * من جذر المستودع: `npm run migrate:quizzes --prefix server`
 * أو: `cd server && npx tsx ../scripts/migrate-quizzes-snapshot.ts`
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, '../server/.env') });

const { migrateQuizzesFromAdminSnapshot } = await import(
  '../server/src/lib/sync-quizzes-relational.js'
);
const { prisma } = await import('../server/src/db.js');

try {
  const summary = await migrateQuizzesFromAdminSnapshot();
  console.log('تمت المزامنة:', summary);
} finally {
  await prisma.$disconnect();
}
