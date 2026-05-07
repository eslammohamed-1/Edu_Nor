import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_SEC: z.coerce.number().default(900),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  PORT: z.coerce.number().default(3001),
  SUPER_ADMIN_EMAIL: z.string().email(),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  /** مجلد ملفات CSV في المستودع؛ افتراضيًا ../data/csv من مجلد تشغيل السيرفر */
  CSV_DATA_DIR: z.string().optional(),
  /** جذر بنك الأسئلة: `<repo>/data/question-bank` إن وُجد؛ أو مسار نسبي لمستودع المشروع */
  QUESTION_BANK_ROOT: z.string().optional(),
  /** في الإنتاج اضبطها false — غالبًا true للتطوير المحلي عبر .env */
  ENABLE_API_DOCS: z.coerce.boolean().default(false),
  /** رابط الواجهة العام لروابط استعادة كلمة المرور */
  APP_PUBLIC_URL: z.string().url().default('http://localhost:5173'),
  /** تعطيل فحص haveibeenpwned (مفيد محلياً بدون شبكة) */
  SKIP_BREACH_CHECK: z.coerce.boolean().default(false),
  /** CSP: يسمح بالاتصال بهذه الأصول بالإضافة لـ self (مفصول بفواصل) */
  CSP_EXTRA_CONNECT_SRC: z.string().optional(),
  /** S3-compatible (MinIO محليًا) — كلها اختيارية حتى تفعيل الرفع */
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_USE_PATH_STYLE: z.coerce.boolean().default(true)
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment');
  }
  return parsed.data;
}
