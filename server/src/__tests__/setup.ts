import { afterEach, vi } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://edunor:edunor@localhost:5432/edunor_test';
process.env.JWT_SECRET ??= 'test-jwt-secret-with-enough-length';
process.env.SUPER_ADMIN_EMAIL ??= 'superadmin@edunor.test';
process.env.SUPER_ADMIN_PASSWORD ??= 'EduNorSuper2026!';
process.env.CORS_ORIGINS ??= 'http://localhost:5173';
process.env.SKIP_BREACH_CHECK ??= '1';

afterEach(() => {
  vi.restoreAllMocks();
});
