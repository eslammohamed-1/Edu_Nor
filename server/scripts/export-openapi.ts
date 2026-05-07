/**
 * يحمّل وثيقة OpenAPI من سيرفر يعمل. شغّل السيرفر مع ENABLE_API_DOCS=true ثم:
 *
 *   cd server && ENABLE_API_DOCS=true npm run dev
 *   npm run docs:export
 *
 * أو: OPENAPI_URL=http://127.0.0.1:3001/documentation/json npm run docs:export
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const outPath = join(root, '..', 'openapi.json');
const url = process.env.OPENAPI_URL ?? 'http://127.0.0.1:3001/documentation/json';

const res = await fetch(url);
if (!res.ok) {
  console.error(`فشل الجلب ${res.status} من ${url}`);
  console.error('شغّل السيرفر مع ENABLE_API_DOCS=true في .env');
  process.exit(1);
}

const json = await res.json();
writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');
console.log('Wrote', outPath);
