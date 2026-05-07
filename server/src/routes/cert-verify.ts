import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db.js';
import { loadEnv } from '../env.js';
import { verifyCertificateSignature } from '../lib/certificates.js';

const env = loadEnv();

export const certVerifyRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/cert/verify/:certificateId',
    {
      schema: {
        description: 'التحقق العام من صلاحية شهادة (دون تسجيل)',
        params: {
          type: 'object',
          required: ['certificateId'],
          properties: { certificateId: { type: 'string' } }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              signatureValid: { type: 'boolean' },
              certificate: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  kind: { type: 'string' },
                  title: { type: 'string' },
                  issuedAt: { type: 'string' },
                  subjectName: { type: 'string' }
                }
              }
            }
          },
          404: { type: 'object', properties: { error: { type: 'string' } } }
        }
      }
    },
    async (req, reply) => {
      const certificateId = (req.params as { certificateId: string }).certificateId;

      const row = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: { subject: { select: { name: true } } }
      });

      if (!row) {
        return reply.status(404).send({ error: 'الشهادة غير موجودة' });
      }

      const signatureValid = verifyCertificateSignature(env, row);

      return reply.send({
        valid: signatureValid,
        signatureValid,
        certificate: {
          id: row.id,
          kind: row.kind,
          title: row.title,
          issuedAt: row.issuedAt.toISOString(),
          subjectName: row.subject.name
        }
      });
    }
  );
};
