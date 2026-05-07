import type { FastifyPluginAsync } from 'fastify';
import {
  bootstrapCatalogFromFixturesIfEmpty,
  getLearnerCatalogFromDatabase
} from '../lib/catalog-content.js';

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/catalog',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            description: 'شجرة الكتالوج للمتعلّم',
            additionalProperties: true
          }
        }
      }
    },
    async (_req, reply) => {
      await bootstrapCatalogFromFixturesIfEmpty();
      const body = await getLearnerCatalogFromDatabase();
      return reply.send(body);
    }
  );
};
