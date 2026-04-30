import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadEnv } from './env.js';
import { prisma } from './db.js';
import { authPlugin } from './plugins/auth.js';
import { authRoutes } from './routes/auth.js';
import { adminUsersRoutes } from './routes/admin/users.js';
import { adminSystemRoutes } from './routes/admin/system.js';

const env = loadEnv();

const app = Fastify({ logger: true });

const origins = env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);

await app.register(cors, {
  origin: origins.length === 1 && origins[0] === '*' ? true : origins,
  credentials: true
});

await app.register(rateLimit, {
  global: true,
  max: 300,
  timeWindow: '1 minute'
});

await app.register(authPlugin, { jwtSecret: env.JWT_SECRET });

app.get('/health', async () => ({
  status: 'ok',
  time: new Date().toISOString()
}));

await app.register(authRoutes, { prefix: '/api/v1/auth', env });
await app.register(adminUsersRoutes, { prefix: '/api/v1/admin/users' });
await app.register(adminSystemRoutes, { prefix: '/api/v1/admin', env });

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
  console.log(`EduNor API http://localhost:${env.PORT}  (health: /health)`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
