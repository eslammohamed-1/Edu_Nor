import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import supertest from 'supertest';
import type { User } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { hashPassword } from '../lib/password.js';
import { hashRefreshToken, signAccessToken } from '../lib/tokens.js';
import { prismaMock, resetPrismaMock } from './utils/prismaMock.js';
import { buildTestApp } from './helpers/testApp.js';

vi.mock('../db.js', () => ({
  prisma: prismaMock
}));

const TEST_PASSWORD = 'Aa1!aaaaaaaa';

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'student@test.com',
    passwordHash: '',
    name: 'Student Test',
    role: 'student',
    banned: false,
    grade: 'الصف الأول الابتدائي',
    phone: '01234567890',
    stage: 'primary',
    secondaryTrack: null,
    permissionsJson: null,
    onboardingCompletedAt: null,
    favoriteSubjectsJson: '[]',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides
  };
}

function lockoutMocks() {
  prismaMock.accountLockout.findUnique.mockResolvedValue(null);
  prismaMock.loginAttempt.create.mockResolvedValue({} as never);
  prismaMock.loginAttempt.count.mockResolvedValue(0);
  prismaMock.accountLockout.deleteMany.mockResolvedValue({ count: 0 } as never);
  prismaMock.loginAttempt.deleteMany.mockResolvedValue({ count: 0 } as never);
}

describe('auth routes (supertest)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    resetPrismaMock();
    ({ app } = await buildTestApp());
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /login returns 401 for unknown user', async () => {
    lockoutMocks();
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: 'nope@test.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /login returns 401 for bad password', async () => {
    lockoutMocks();
    const hash = await hashPassword(TEST_PASSWORD);
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser({ passwordHash: hash }),
      twoFactor: null
    } as never);

    const res = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: 'WrongPass1!' });

    expect(res.status).toBe(401);
  });

  it('POST /login returns user and accessToken on success', async () => {
    lockoutMocks();
    const hash = await hashPassword(TEST_PASSWORD);
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser({ passwordHash: hash }),
      twoFactor: null
    } as never);
    prismaMock.refreshToken.create.mockResolvedValue({
      id: 'rt1',
      tokenHash: 'x',
      userId: 'user-1',
      expiresAt: new Date(),
      ip: null,
      userAgent: null,
      createdAt: new Date()
    } as never);

    const res = await supertest(app.server)
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user?.email).toBe('student@test.com');
    expect(res.body.user?.role).toBe('student');
  });

  it('POST /register returns 201 and session', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(mockUser({ id: 'new-u', email: 'new@test.com' }));
    prismaMock.refreshToken.create.mockResolvedValue({
      id: 'rt2',
      tokenHash: 'y',
      userId: 'new-u',
      expiresAt: new Date(),
      ip: null,
      userAgent: null,
      createdAt: new Date()
    } as never);

    const res = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({
        name: 'New User',
        email: 'new@test.com',
        phone: '01234567890',
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        stage: 'primary',
        grade: 'الصف الأول الابتدائي'
      });

    expect(res.status).toBe(201);
    expect(res.body.user?.email).toBe('new@test.com');
    expect(res.body.accessToken).toBeTruthy();
  });

  it('POST /register returns 409 when email exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser());

    const res = await supertest(app.server)
      .post('/api/v1/auth/register')
      .send({
        name: 'Ab',
        email: 'student@test.com',
        phone: '01234567890',
        password: TEST_PASSWORD,
        confirmPassword: TEST_PASSWORD,
        stage: 'primary',
        grade: 'G'
      });

    expect(res.status).toBe(409);
  });

  it('POST /refresh returns new access token when refresh token valid', async () => {
    const plain = 'plain-refresh-token-value-min-length-ok-123456';
    const tokenHash = hashRefreshToken(plain);
    const dbUser = mockUser();
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-old',
      tokenHash,
      userId: dbUser.id,
      expiresAt: new Date(Date.now() + 86_400_000),
      ip: null,
      userAgent: null,
      createdAt: new Date(),
      user: dbUser
    } as never);
    prismaMock.refreshToken.delete.mockResolvedValue({} as never);
    prismaMock.refreshToken.create.mockResolvedValue({
      id: 'rt-new',
      tokenHash: 'z',
      userId: dbUser.id,
      expiresAt: new Date(),
      ip: null,
      userAgent: null,
      createdAt: new Date()
    } as never);

    const res = await supertest(app.server)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: plain });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.user?.id).toBe(dbUser.id);
  });

  it('POST /logout returns ok and deletes refresh row when token provided', async () => {
    const plain = 'logout-refresh-token-long-enough-123456789012345';
    const tokenHash = hashRefreshToken(plain);
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as never);

    const res = await supertest(app.server)
      .post('/api/v1/auth/logout')
      .send({ refreshToken: plain });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { tokenHash }
    });
  });

  it('GET /me returns 401 without bearer token', async () => {
    const res = await supertest(app.server).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /me returns user when token valid', async () => {
    const secret = process.env.JWT_SECRET!;
    const token = signAccessToken({ sub: 'user-1', role: 'student' }, secret, 900);
    prismaMock.user.findUnique.mockResolvedValue(mockUser());

    const res = await supertest(app.server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user?.email).toBe('student@test.com');
  });
});
