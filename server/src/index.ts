import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { loadEnv } from './env.js';
import cookie from '@fastify/cookie';
import { prisma } from './db.js';
import { authPlugin } from './plugins/auth.js';
import { helmetPlugin } from './plugins/helmet.js';
import { authRoutes } from './routes/auth.js';
import { adminUsersRoutes } from './routes/admin/users.js';
import { adminSystemRoutes } from './routes/admin/system.js';
import { catalogRoutes } from './routes/catalog.js';
import { quizzesPublicRoutes } from './routes/quizzes-public.js';
import { adminCatalogContentRoutes } from './routes/admin/content-catalog.js';
import { questionsBankPublicRoutes } from './routes/questions-bank-public.js';
import { quizAttemptsRoutes } from './routes/quiz-attempts.js';
import { meProgressRoutes } from './routes/me/progress.js';
import { meStudyPlanRoutes } from './routes/me/study-plan.js';
import { recordHttpMutationAudit } from './lib/audit.js';

const env = loadEnv();

const app = Fastify({ logger: true });

await app.register(cookie);

const origins = env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);

await app.register(cors, {
  origin: origins.length === 1 && origins[0] === '*' ? true : origins,
  credentials: true
});

await app.register(helmetPlugin, { env });

await app.register(rateLimit, {
  global: true,
  max: 300,
  timeWindow: '1 minute'
});

if (env.ENABLE_API_DOCS) {
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'EduNor API',
        description: 'REST API لمنصة إديو نور',
        version: '0.2.0'
      },
      servers: [{ url: `http://127.0.0.1:${env.PORT}` }]
    }
  });
}

await app.register(authPlugin, { jwtSecret: env.JWT_SECRET });

app.addHook('preHandler', async (req, reply) => {
  const path = req.url.split('?')[0] ?? '';
  if (!path.startsWith('/api/v1/admin')) return;
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) return;
  const token = req.cookies?.csrf_token;
  const header = req.headers['x-csrf-token'];
  if (!token || !header || token !== String(header)) {
    return reply.status(403).send({ error: 'رمز CSRF غير صالح — GET /api/v1/auth/csrf أولاً' });
  }
});

app.get(
  '/health',
  {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'ok' },
            time: { type: 'string' }
          },
          required: ['status', 'time']
        }
      }
    }
  },
  async () => ({
    status: 'ok',
    time: new Date().toISOString()
  })
);

app.get(
  '/ready',
  {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'ready' },
            db: { type: 'string', const: 'ok' }
          },
          required: ['status', 'db']
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string', const: 'not_ready' },
            db: { type: 'string', const: 'error' }
          },
          required: ['status', 'db']
        }
      }
    }
  },
  async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', db: 'ok' };
    } catch {
      return reply.status(503).send({ status: 'not_ready', db: 'error' });
    }
  }
);

await app.register(authRoutes, { prefix: '/api/v1/auth', env });
await app.register(catalogRoutes, { prefix: '/api/v1' });
await app.register(quizzesPublicRoutes, { prefix: '/api/v1' });
await app.register(questionsBankPublicRoutes, { prefix: '/api/v1', env });
await app.register(quizAttemptsRoutes, { prefix: '/api/v1' });
await app.register(meProgressRoutes, { prefix: '/api/v1' });
await app.register(meStudyPlanRoutes, { prefix: '/api/v1' });
await app.register(adminUsersRoutes, { prefix: '/api/v1/admin/users' });
await app.register(adminCatalogContentRoutes, { prefix: '/api/v1/admin/catalog' });
await app.register(adminSystemRoutes, { prefix: '/api/v1/admin', env });

if (env.ENABLE_API_DOCS) {
  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: { docExpansion: 'list', deepLinking: true }
  });
}

app.addHook('onResponse', async (req, reply) => {
  try {
    await recordHttpMutationAudit(req, reply);
  } catch (err) {
    req.log.warn({ err }, 'audit mutation record failed');
  }
});

const close = async () => {
  await app.close();
  await prisma.$disconnect();
};

process.on('SIGINT', () => {
  void close().then(() => process.exit(0));
});
process.on('SIGTERM', () => {
  void close().then(() => process.exit(0));
});

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  const base = `http://localhost:${env.PORT}`;
  console.log(`EduNor API ${base}  (health: /health  ready: /ready)`);
  if (env.ENABLE_API_DOCS) {
    console.log(`OpenAPI UI: ${base}/documentation   JSON: ${base}/documentation/json`);
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
