import type { FastifyReply, FastifyRequest } from 'fastify';

export async function preRequireSuperAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!req.authUser) {
    await reply.status(401).send({ error: 'غير مصرح', code: 'UNAUTHORIZED' });
    return;
  }
  if (req.authUser.role !== 'super_admin') {
    await reply.status(403).send({ error: 'ممنوع — سوبر أدمن فقط', code: 'FORBIDDEN' });
    return;
  }
}
