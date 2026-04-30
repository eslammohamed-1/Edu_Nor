/**
 * استيراد ملفات *.json من مجلد الأسئلة إلى SQLite (صف واحد لكل سؤال).
 * تشغيل من مجلد server/: npx tsx questions-database/import-from-json.ts
 */
import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../src/generated/questionsDb/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const questionsDbUrl =
  process.env.QUESTIONS_DATABASE_URL ?? 'file:./data/question_database.sqlite';
const prisma = new PrismaClient({
  datasources: { db: { url: questionsDbUrl } }
});

const questionsDir = join(__dirname, '../../app/src/fixtures/demo-catalog/questions');

async function main(): Promise<void> {
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('لا توجد ملفات json في', questionsDir);
    process.exit(1);
  }
  let n = 0;
  for (const file of files) {
    const raw = readFileSync(join(questionsDir, file), 'utf-8').trim();
    const parsed = JSON.parse(raw) as { id?: string };
    if (!parsed.id || typeof parsed.id !== 'string') {
      throw new Error(`ملف بدون معرف صالح: ${file}`);
    }
    const slug = file.replace(/\.json$/i, '');
    await prisma.questionBankEntry.upsert({
      where: { id: parsed.id },
      create: {
        id: parsed.id,
        slug,
        payloadJson: raw
      },
      update: {
        slug,
        payloadJson: raw
      }
    });
    n++;
    console.log('OK', file, '→ id', parsed.id);
  }
  console.log(`تم استيراد ${n} سؤال إلى بنك الأسئلة.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
