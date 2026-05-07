import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db.js';
import { loadEnv } from '../../env.js';
import { verifyCertificateSignature } from '../../lib/certificates.js';

const env = loadEnv();

function requireUser(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  if (!req.authUser) {
    void reply.status(401).send({ error: 'مطلوب تسجيل الدخول' });
    return null;
  }
  return req.authUser;
}

export const meCertificatesRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/me/certificates',
    {
      schema: {
        description: 'قائمة شهادات المستخدم الحالي',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    kind: { type: 'string' },
                    title: { type: 'string' },
                    issuedAt: { type: 'string' },
                    subjectId: { type: 'string' },
                    subjectName: { type: 'string' },
                    quizId: { type: 'string', nullable: true },
                    signatureValid: { type: 'boolean' }
                  }
                }
              }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const rows = await prisma.certificate.findMany({
        where: { userId: user.id },
        orderBy: { issuedAt: 'desc' },
        include: { subject: { select: { name: true } } }
      });

      return reply.send({
        items: rows.map((r) => ({
          id: r.id,
          kind: r.kind,
          title: r.title,
          issuedAt: r.issuedAt.toISOString(),
          subjectId: r.subjectId,
          subjectName: r.subject.name,
          quizId: r.quizId,
          signatureValid: verifyCertificateSignature(env, r)
        }))
      });
    }
  );

  app.get(
    '/me/certificates/:certificateId',
    {
      schema: {
        description: 'تفاصيل شهادة للمالك',
        params: {
          type: 'object',
          required: ['certificateId'],
          properties: { certificateId: { type: 'string' } }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              kind: { type: 'string' },
              title: { type: 'string' },
              issuedAt: { type: 'string' },
              subjectId: { type: 'string' },
              subjectName: { type: 'string' },
              quizId: { type: 'string', nullable: true },
              recipientName: { type: 'string' },
              signatureValid: { type: 'boolean' }
            }
          },
          401: { type: 'object', properties: { error: { type: 'string' } } },
          404: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const user = requireUser(req, reply);
      if (!user) return;

      const certificateId = (req.params as { certificateId: string }).certificateId;

      const row = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: {
          subject: { select: { name: true } },
          user: { select: { name: true } }
        }
      });

      if (!row || row.userId !== user.id) {
        return reply.status(404).send({ error: 'الشهادة غير موجودة' });
      }

      return reply.send({
        id: row.id,
        kind: row.kind,
        title: row.title,
        issuedAt: row.issuedAt.toISOString(),
        subjectId: row.subjectId,
        subjectName: row.subject.name,
        quizId: row.quizId,
        recipientName: row.user.name,
        signatureValid: verifyCertificateSignature(env, row)
      });
    }
  );
};
