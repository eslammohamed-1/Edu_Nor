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
  CSV_DATA_DIR: z.string().optional()
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
