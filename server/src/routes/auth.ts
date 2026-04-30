import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  hashRefreshToken,
  randomRefreshToken,
  signAccessToken,
  verifyAccessToken
} from '../lib/tokens.js';
import { toPublicUser } from '../lib/user-mapper.js';
import { appendLearnerExportCsv } from '../lib/learnersCsv.js';
import type { Env } from '../env.js';
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie
} from '../lib/refreshCookie.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  stage: z.enum(['primary', 'prep', 'secondary']),
  grade: z.string().min(1),
  secondaryTrack: z.enum(['scientific_ar', 'scientific_languages', 'literary']).optional()
});

export const authRoutes: FastifyPluginAsync<{ env: Env }> = async (app, { env }) => {
  async function issueTokens(
    userId: string,
    role: import('@prisma/client').Role,
    req?: FastifyRequest
  ) {
    const accessToken = signAccessToken(
      { sub: userId, role },
      env.JWT_SECRET,
      env.JWT_ACCESS_EXPIRES_SEC
    );
    const plainRefresh = randomRefreshToken();
    const tokenHash = hashRefreshToken(plainRefresh);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_DAYS);
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        ip: req?.ip ?? null,
        userAgent: req?.headers['user-agent'] ?? null
      }
    });
    return { accessToken, refreshToken: plainRefresh };
  }

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute'
        }
      }
    },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
      }
      const email = parsed.data.email.trim().toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.banned) {
        return reply.status(401).send({ error: 'البريد أو كلمة المرور غير صحيحة' });
      }
      const ok = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!ok) {
        return reply.status(401).send({ error: 'البريد أو كلمة المرور غير صحيحة' });
      }
      const tokens = await issueTokens(user.id, user.role, req);
      setRefreshCookie(reply, tokens.refreshToken, env.JWT_REFRESH_EXPIRES_DAYS, env.COOKIE_SECURE);
      return reply.send({
        user: toPublicUser(user),
        accessToken: tokens.accessToken
      });
    }
  );

  app.post('/register', async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
    }
    const b = parsed.data;
    if (b.password !== b.confirmPassword) {
      return reply.status(400).send({ error: 'كلمة المرور غير متطابقة' });
    }
    const email = b.email.trim().toLowerCase();
    if (email === env.SUPER_ADMIN_EMAIL.trim().toLowerCase()) {
      return reply.status(400).send({ error: 'بريد محجوز' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return reply.status(409).send({ error: 'البريد مستخدم بالفعل' });
    }
    const passwordHash = await hashPassword(b.password);
    const user = await prisma.user.create({
      data: {
        email,
        name: b.name.trim(),
        phone: b.phone,
        passwordHash,
        role: 'student',
        stage: b.stage,
        grade: b.grade,
        secondaryTrack: b.stage === 'secondary' ? b.secondaryTrack ?? null : null
      }
    });
    appendLearnerExportCsv(env.CSV_DATA_DIR, user);
    const tokens = await issueTokens(user.id, user.role, req);
    setRefreshCookie(reply, tokens.refreshToken, env.JWT_REFRESH_EXPIRES_DAYS, env.COOKIE_SECURE);
    return reply.status(201).send({
      user: toPublicUser(user),
      accessToken: tokens.accessToken
    });
  });

  app.post('/refresh', async (req, reply) => {
    const body = z.object({ refreshToken: z.string().min(10).optional() }).safeParse(req.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: 'refreshToken مطلوب' });
    }
    const plainRefresh = body.data.refreshToken ?? readRefreshCookie(req);
    if (!plainRefresh) {
      return reply.status(401).send({ error: 'جلسة منتهية' });
    }
    const tokenHash = hashRefreshToken(plainRefresh);
    const row = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
    if (!row || row.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'جلسة منتهية' });
    }
    if (row.user.banned) {
      return reply.status(403).send({ error: 'حساب محظور' });
    }
    await prisma.refreshToken.delete({ where: { id: row.id } });
    const tokens = await issueTokens(row.user.id, row.user.role, req);
    setRefreshCookie(reply, tokens.refreshToken, env.JWT_REFRESH_EXPIRES_DAYS, env.COOKIE_SECURE);
    return reply.send({
      user: toPublicUser(row.user),
      accessToken: tokens.accessToken
    });
  });

  app.post('/logout', async (req, reply) => {
    const body = z.object({ refreshToken: z.string().optional() }).safeParse(req.body);
    if (!body.success) return reply.status(400).send({ error: 'طلب غير صالح' });
    const plainRefresh = body.data.refreshToken ?? readRefreshCookie(req);
    if (plainRefresh) {
      const tokenHash = hashRefreshToken(plainRefresh);
      await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }
    clearRefreshCookie(reply, env.COOKIE_SECURE);
    return reply.send({ ok: true });
  });

  app.get('/me', async (req, reply) => {
    if (!req.authUser) {
      return reply.status(401).send({ error: 'غير مصرح' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
    if (!user) return reply.status(401).send({ error: 'غير مصرح' });
    return reply.send({ user: toPublicUser(user) });
  });

  /** تحقق من صلاحية التوكن (للواجهة) */
  app.get('/verify', async (req, reply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ valid: false });
    }
    try {
      verifyAccessToken(auth.slice('Bearer '.length).trim(), env.JWT_SECRET);
      return reply.send({ valid: true });
    } catch {
      return reply.status(401).send({ valid: false });
    }
  });
};
