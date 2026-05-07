/**
 * ينشئ حاوية S3/MinIO إن لم تكن موجودة — اضبط نفس متغيرات `S3_*` كالتخزين.
 * التشغيل: `npm run bucket:ensure --prefix server`
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreateBucketCommand, HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';

const root = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(root, '../.env') });

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET;
const accessKey = process.env.S3_ACCESS_KEY;
const secretKey = process.env.S3_SECRET_KEY;
const region = process.env.S3_REGION ?? 'us-east-1';
const usePathStyle = process.env.S3_USE_PATH_STYLE !== 'false';

if (!endpoint || !bucket || !accessKey || !secretKey) {
  console.error('أكمل S3_ENDPOINT و S3_BUCKET و S3_ACCESS_KEY و S3_SECRET_KEY في server/.env');
  process.exit(1);
}

const client = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  forcePathStyle: usePathStyle
});

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log('الحاوية موجودة:', bucket);
} catch {
  await client.send(new CreateBucketCommand({ Bucket: bucket }));
  console.log('تم إنشاء الحاوية:', bucket);
}
