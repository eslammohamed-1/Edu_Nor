import type { FastifyPluginAsync } from 'fastify';
import {
  bootstrapCatalogFromFixturesIfEmpty,
  getLearnerCatalogFromDatabase
} from '../lib/catalog-content.js';

export const catalogRoutes: FastifyPluginAsync = async (app) => {
  app.get('/catalog', async (_req, reply) => {
    await bootstrapCatalogFromFixturesIfEmpty();
    const body = await getLearnerCatalogFromDatabase();
    return reply.send(body);
  });
};
