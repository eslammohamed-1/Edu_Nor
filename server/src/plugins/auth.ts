import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../lib/tokens.js';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: string; role: Role };
  }
}

const authPluginImpl: FastifyPluginAsync<{ jwtSecret: string }> = async (app, opts) => {
  app.addHook('onRequest', async (req) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return;
    const token = auth.slice('Bearer '.length).trim();
    if (!token) return;
    try {
      const payload = verifyAccessToken(token, opts.jwtSecret);
      req.authUser = { id: payload.sub, role: payload.role };
    } catch {
      /* يترك authUser فارغاً */
    }
  });
};

/** fastify-plugin: يطبّق الخطاف على كل المسارات المسجّلة لاحقاً (بدون حدود تغليف افتراضية). */
export const authPlugin = fp(authPluginImpl, {
  name: 'auth-jwt'
});
