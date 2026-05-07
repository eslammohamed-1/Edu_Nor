import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';
import type { User } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { signAccessToken } from '../lib/tokens.js';
import { prismaMock, resetPrismaMock } from './utils/prismaMock.js';
import { buildTestApp } from './helpers/testApp.js';

vi.mock('../db.js', () => ({
  prisma: prismaMock
}));

const ADMIN_PASSWORD = 'Aa1!aaaaaaaa';

function dbUser(overrides: Partial<User> = {}): User {
  return {
    id: 'sa-1',
    email: 'super@test.com',
    passwordHash: 'x',
    name: 'Super',
    role: 'super_admin',
    banned: false,
    grade: null,
    phone: null,
    stage: null,
    secondaryTrack: null,
    permissionsJson: null,
    onboardingCompletedAt: null,
    favoriteSubjectsJson: '[]',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  };
}

async function csrfAgent(app: FastifyInstance) {
  const agent = supertest.agent(app.server);
  const csrfRes = await agent.get('/api/v1/auth/csrf');
  expect(csrfRes.status).toBe(200);
  const csrfToken = csrfRes.body.csrfToken as string;
  return { agent, csrfToken };
}

describe('admin users routes (supertest)', () => {
  let app: FastifyInstance;
  let bearer: string;

  beforeEach(async () => {
    resetPrismaMock();
    ({ app } = await buildTestApp());
    bearer = signAccessToken(
      { sub: 'sa-1', role: 'super_admin' },
      process.env.JWT_SECRET!,
      900
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / returns 401 without Authorization', async () => {
    const res = await supertest(app.server).get('/api/v1/admin/users/');
    expect(res.status).toBe(401);
  });

  it('GET / returns 403 for student token', async () => {
    const token = signAccessToken(
      { sub: 'st-1', role: 'student' },
      process.env.JWT_SECRET!,
      900
    );
    const res = await supertest(app.server)
      .get('/api/v1/admin/users/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('GET / lists users for super_admin', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      dbUser({ id: 'a', email: 'a@test.com' }),
      dbUser({ id: 'b', email: 'b@test.com', role: 'student' })
    ]);

    const res = await supertest(app.server)
      .get('/api/v1/admin/users/')
      .set('Authorization', `Bearer ${bearer}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users).toHaveLength(2);
  });

  it('POST / returns 403 without CSRF on mutations', async () => {
    const res = await supertest(app.server)
      .post('/api/v1/admin/users/')
      .set('Authorization', `Bearer ${bearer}`)
      .send({
        name: 'Teacher',
        email: 'teacher@test.com',
        password: ADMIN_PASSWORD,
        role: 'teacher'
      });

    expect(res.status).toBe(403);
  });

  it('POST / creates user with CSRF + super_admin', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(
      dbUser({
        id: 't1',
        email: 'teacher@test.com',
        name: 'Teacher',
        role: 'teacher'
      })
    );

    const { agent, csrfToken } = await csrfAgent(app);
    const res = await agent
      .post('/api/v1/admin/users/')
      .set('Authorization', `Bearer ${bearer}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Teacher',
        email: 'teacher@test.com',
        password: ADMIN_PASSWORD,
        role: 'teacher'
      });

    expect(res.status).toBe(201);
    expect(res.body.user?.email).toBe('teacher@test.com');
    expect(res.body.user?.role).toBe('teacher');
  });

  it('PATCH /:id updates user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      dbUser({ id: 'u2', email: 'u2@test.com', role: 'student' })
    );
    prismaMock.user.update.mockResolvedValue(
      dbUser({ id: 'u2', email: 'u2@test.com', name: 'Renamed', role: 'student' })
    );

    const { agent, csrfToken } = await csrfAgent(app);
    const res = await agent
      .patch('/api/v1/admin/users/u2')
      .set('Authorization', `Bearer ${bearer}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Renamed' });

    expect(res.status).toBe(200);
    expect(res.body.user?.name).toBe('Renamed');
  });

  it('DELETE /:id removes user', async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      dbUser({ id: 'u3', email: 'u3@test.com', role: 'student' })
    );
    prismaMock.user.delete.mockResolvedValue(
      dbUser({ id: 'u3', email: 'u3@test.com', role: 'student' })
    );

    const { agent, csrfToken } = await csrfAgent(app);
    const res = await agent
      .delete('/api/v1/admin/users/u3')
      .set('Authorization', `Bearer ${bearer}`)
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(204);
  });
});
