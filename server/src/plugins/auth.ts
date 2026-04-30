import type { FastifyPluginAsync } from 'fastify';
import type { Role } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: { id: string; role: Role };
  }
}

export const authPlugin: FastifyPluginAsync<{ jwtSecret: string }> = async (app, opts) => {
  app.addHook('onRequest', async (req) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return;
    const token = auth.slice('Bearer '.length).trim();
    if (!token) return;
    try {
      const { verifyAccessToken } = await import('../lib/tokens.js');
      const payload = verifyAccessToken(token, opts.jwtSecret);
      req.authUser = { id: payload.sub, role: payload.role };
    } catch {
      /* يترك authUser فارغاً */
    }
  });
};
