import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadEnv } from '../../env.js';
import { authPlugin } from '../../plugins/auth.js';
import { authRoutes } from '../../routes/auth.js';
import { adminUsersRoutes } from '../../routes/admin/users.js';
import { quizAttemptsRoutes } from '../../routes/quiz-attempts.js';
import type { Env } from '../../env.js';
import type { FastifyInstance } from 'fastify';

/**
 * تطبيق Fastify للاختبارات (بدون listen) — نفس خطاف CSRF للمسارات الإدارية تقريبًا.
 */
export async function buildTestApp(): Promise<{ app: FastifyInstance; env: Env }> {
  const env = loadEnv();
  const app = Fastify({ logger: false });

  await app.register(cookie);
  await app.register(cors, { origin: true, credentials: true });
  await app.register(rateLimit, {
    global: true,
    max: 50_000,
    timeWindow: '1 minute'
  });
  await app.register(authPlugin, { jwtSecret: env.JWT_SECRET });

  app.addHook('preHandler', async (req, reply) => {
    const path = req.url.split('?')[0] ?? '';
    if (!path.startsWith('/api/v1/admin')) return;
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) return;
    const token = req.cookies?.csrf_token;
    const header = req.headers['x-csrf-token'];
    if (!token || !header || token !== String(header)) {
      return reply
        .status(403)
        .send({ error: 'رمز CSRF غير صالح — GET /api/v1/auth/csrf أولاً' });
    }
  });

  await app.register(authRoutes, { prefix: '/api/v1/auth', env });
  await app.register(adminUsersRoutes, { prefix: '/api/v1/admin/users' });
  await app.register(quizAttemptsRoutes, { prefix: '/api/v1' });

  await app.ready();
  return { app, env };
}
