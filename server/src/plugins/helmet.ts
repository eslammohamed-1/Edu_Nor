import helmet from '@fastify/helmet';
import type { FastifyPluginAsync } from 'fastify';
import type { Env } from '../env.js';

export const helmetPlugin: FastifyPluginAsync<{ env: Env }> = async (app, { env }) => {
  const connectExtra = (env.CSP_EXTRA_CONNECT_SRC ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  const connectSrc = ["'self'", ...origins, ...connectExtra];

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: env.ENABLE_API_DOCS ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc,
        fontSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  });
};
