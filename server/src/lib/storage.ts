import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../env.js';

function optionalStorage(env: Env) {
  const { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY } = env;
  if (!S3_ENDPOINT || !S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) return null;
  return {
    bucket: S3_BUCKET,
    endpoint: S3_ENDPOINT,
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
    region: env.S3_REGION,
    usePathStyle: env.S3_USE_PATH_STYLE
  };
}

let client: S3Client | null = null;

function getS3(env: Env): S3Client {
  const cfg = optionalStorage(env);
  if (!cfg) {
    throw new Error('S3 غير مُعرّف — عرّف S3_ENDPOINT و S3_BUCKET و S3_ACCESS_KEY و S3_SECRET_KEY');
  }
  if (!client) {
    client = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKey,
        secretAccessKey: cfg.secretKey
      },
      forcePathStyle: cfg.usePathStyle
    });
  }
  return client;
}

export function isStorageConfigured(env: Env): boolean {
  return optionalStorage(env) !== null;
}

/** رفع عبر PUT مُوقّع مسبقاً (العميل يرفع مباشرة إلى MinIO/S3). */
export async function presignUpload(
  env: Env,
  key: string,
  contentType: string,
  expiresSec = 900
): Promise<string> {
  const cfg = optionalStorage(env);
  if (!cfg) {
    throw new Error('S3 غير مُعرّف — لا يمكن إنشاء رابط رفع');
  }
  const cmd = new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    ContentType: contentType
  });
  return getSignedUrl(getS3(env), cmd, { expiresIn: expiresSec });
}

/** تحميل/عرض عبر GET مُوقّع */
export async function presignDownload(env: Env, key: string, expiresSec = 900): Promise<string> {
  const cfg = optionalStorage(env);
  if (!cfg) {
    throw new Error('S3 غير مُعرّف — لا يمكن إنشاء رابط تحميل');
  }
  const cmd = new GetObjectCommand({
    Bucket: cfg.bucket,
    Key: key
  });
  return getSignedUrl(getS3(env), cmd, { expiresIn: expiresSec });
}

export async function deleteObject(env: Env, key: string): Promise<void> {
  const cfg = optionalStorage(env);
  if (!cfg) {
    throw new Error('S3 غير مُعرّف — لا يمكن الحذف');
  }
  await getS3(env).send(
    new DeleteObjectCommand({
      Bucket: cfg.bucket,
      Key: key
    })
  );
}
