import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { sendEmail } from '../lib/email.js';
import { evaluatePasswordPolicy } from '../lib/passwordPolicy.js';
import {
  clearLoginFailures,
  isAccountLocked,
  recordLoginFailure
} from '../lib/loginLockout.js';
import {
  hashRecoveryCodesForStore,
  validateTotp,
  newTwofaSecretBase32,
  totpFor,
  generateRecoveryCodes,
  consumeRecoveryCode
} from '../lib/twoFactor.js';
import {
  hashRefreshToken,
  randomRefreshToken,
  signAccessToken,
  signTwoFactorPendingToken,
  verifyAccessToken,
  verifyTwoFactorPendingToken
} from '../lib/tokens.js';
import { toPublicUser } from '../lib/user-mapper.js';
import { appendLearnerExportCsv } from '../lib/learnersCsv.js';
import type { Env } from '../env.js';
import {
  clearRefreshCookie,
  readRefreshCookie,
  setRefreshCookie
} from '../lib/refreshCookie.js';
import {
  authSessionResponse,
  errorSchema,
  okTrueSchema,
  publicUserSchema,
  validSchema
} from '../lib/openapi-schemas.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(10),
  confirmPassword: z.string().min(10),
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

  function requireSuperAdmin(req: FastifyRequest, reply: import('fastify').FastifyReply) {
    if (!req.authUser || req.authUser.role !== 'super_admin') {
      void reply.status(403).send({ error: 'للمسؤول الأعلى فقط' });
      return false;
    }
    return true;
  }

  /** CSRF: يزوّد الواجهة توكناً ويطابق كوكي csrf_token */
  app.get('/csrf', async (_req, reply) => {
    const token = crypto.randomBytes(32).toString('hex');
    reply.setCookie('csrf_token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: env.COOKIE_SECURE
    });
    return { csrfToken: token };
  });

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 15,
          timeWindow: '1 minute'
        }
      },
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 1 }
          }
        },
        response: {
          200: { type: 'object', additionalProperties: true },
          400: errorSchema,
          401: errorSchema,
          423: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              lockedUntil: { type: 'string' }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
      }
      const email = parsed.data.email.trim().toLowerCase();
      const ip = req.ip ?? null;

      const lockedUntil = await isAccountLocked(email);
      if (lockedUntil) {
        return reply.status(423).send({
          error: 'تم قفل المحاولة مؤقتاً بعد محاولات متعددة',
          lockedUntil: lockedUntil.toISOString()
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { twoFactor: true }
      });
      if (!user || user.banned) {
        await recordLoginFailure(email, ip);
        return reply.status(401).send({ error: 'البريد أو كلمة المرور غير صحيحة' });
      }
      const ok = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!ok) {
        await recordLoginFailure(email, ip);
        return reply.status(401).send({ error: 'البريد أو كلمة المرور غير صحيحة' });
      }

      await clearLoginFailures(email);

      if (user.twoFactor?.enabled && user.role === 'super_admin') {
        const twoFactorTicket = signTwoFactorPendingToken(user.id, env.JWT_SECRET);
        return reply.send({
          requires2fa: true as const,
          twoFactorTicket
        });
      }

      const tokens = await issueTokens(user.id, user.role, req);
      setRefreshCookie(reply, tokens.refreshToken, env.JWT_REFRESH_EXPIRES_DAYS, env.COOKIE_SECURE);
      return reply.send({
        user: toPublicUser(user),
        accessToken: tokens.accessToken
      });
    }
  );

  app.post('/forgot', async (req, reply) => {
    const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'بيانات غير صالحة' });
    }
    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.banned) {
      return reply.send({ ok: true });
    }
    const plain = crypto.randomBytes(32).toString('base64url');
    const tokenHash = hashRefreshToken(plain);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt }
    });
    const base = env.APP_PUBLIC_URL.replace(/\/$/, '');
    const link = `${base}/reset-password?token=${encodeURIComponent(plain)}`;
    await sendEmail(env, {
      to: email,
      subject: 'استعادة كلمة مرور — إديو نور',
      text: `رابط صالح لساعة واحدة:\n${link}`,
      html: `<p><a href="${link}">تعيين كلمة مرور جديدة</a></p><p>إن لم تطلب هذا تجاهل الرسالة.</p>`
    });
    return reply.send({ ok: true });
  });

  app.post('/reset', async (req, reply) => {
    const bodySchema = z.object({
      token: z.string().min(10),
      password: z.string().min(10),
      confirmPassword: z.string().min(10)
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'بيانات غير صالحة', details: parsed.error.flatten() });
    }
    if (parsed.data.password !== parsed.data.confirmPassword) {
      return reply.status(400).send({ error: 'كلمة المرور غير متطابقة' });
    }
    const tokenHash = hashRefreshToken(parsed.data.token.trim());
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return reply.status(400).send({ error: 'الرابط منتهٍ أو غير صالح' });
    }
    const pol = await evaluatePasswordPolicy(parsed.data.password, {
      email: row.user.email,
      name: row.user.name
    });
    if (!pol.ok) {
      return reply.status(400).send({ error: pol.errors[0] ?? 'كلمة مرور ضعيفة', details: pol.errors });
    }
    const passwordHash = await hashPassword(parsed.data.password);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: row.userId },
        data: { passwordHash }
      });
      await tx.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() }
      });
    });
    return reply.send({ ok: true });
  });

  app.post('/2fa/verify', async (req, reply) => {
    const schema = z.object({
      twoFactorTicket: z.string().min(20),
      code: z.string().min(4).max(32).optional(),
      recoveryCode: z.string().min(4).max(64).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'بيانات غير صالحة' });
    }
    if (!parsed.data.code && !parsed.data.recoveryCode) {
      return reply.status(400).send({ error: 'أدخل رمز التحقق أو رمز الاسترداد' });
    }
    let userId: string;
    try {
      userId = verifyTwoFactorPendingToken(parsed.data.twoFactorTicket, env.JWT_SECRET);
    } catch {
      return reply.status(401).send({ error: 'جلسة التحقق منتهية' });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { twoFactor: true }
    });
    if (!user || !user.twoFactor?.enabled) {
      return reply.status(400).send({ error: 'لم يُفعّل التحقق الثنائي لهذا الحساب' });
    }

    let ok = false;
    if (parsed.data.recoveryCode) {
      const cons = await consumeRecoveryCode(
        parsed.data.recoveryCode,
        user.twoFactor.recoveryHashesJson
      );
      if (cons.ok) {
        ok = true;
        await prisma.userTwoFactor.update({
          where: { userId: user.id },
          data: { recoveryHashesJson: cons.nextJson }
        });
      }
    } else if (parsed.data.code) {
      ok = validateTotp(user.twoFactor.secret, user.email, parsed.data.code);
    }

    if (!ok) {
      return reply.status(401).send({ error: 'رمز غير صحيح' });
    }

    const tokens = await issueTokens(user.id, user.role, req);
    setRefreshCookie(reply, tokens.refreshToken, env.JWT_REFRESH_EXPIRES_DAYS, env.COOKIE_SECURE);
    return reply.send({
      user: toPublicUser(user),
      accessToken: tokens.accessToken
    });
  });

  app.post('/2fa/setup', async (req, reply) => {
    if (!requireSuperAdmin(req, reply)) return;
    const user = await prisma.user.findUnique({ where: { id: req.authUser!.id } });
    if (!user) return reply.status(401).send({ error: 'غير مصرح' });

    const secret = newTwofaSecretBase32();
    await prisma.userTwoFactor.upsert({
      where: { userId: user.id },
      create: { userId: user.id, secret, enabled: false, recoveryHashesJson: '[]' },
      update: { secret, enabled: false, recoveryHashesJson: '[]' }
    });

    const totp = totpFor(user.email, secret);
    const otpauthUrl = totp.toString();
    const QRCode = await import('qrcode');
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    return reply.send({
      otpauthUrl,
      qrDataUrl,
      secret
    });
  });

  app.post('/2fa/enable', async (req, reply) => {
    if (!requireSuperAdmin(req, reply)) return;
    const parsed = z.object({ code: z.string().min(4).max(12) }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'رمز التحقق مطلوب' });

    const user = await prisma.user.findUnique({
      where: { id: req.authUser!.id },
      include: { twoFactor: true }
    });
    if (!user?.twoFactor) return reply.status(400).send({ error: 'ابدأ الإعداد أولاً (setup)' });

    const valid = validateTotp(user.twoFactor.secret, user.email, parsed.data.code);
    if (!valid) return reply.status(400).send({ error: 'رمز غير صحيح' });

    const codes = generateRecoveryCodes(10);
    const recoveryHashesJson = await hashRecoveryCodesForStore(codes);

    await prisma.userTwoFactor.update({
      where: { userId: user.id },
      data: { enabled: true, recoveryHashesJson }
    });

    return reply.send({
      ok: true,
      recoveryCodes: codes
    });
  });

  app.post('/2fa/disable', async (req, reply) => {
    if (!requireSuperAdmin(req, reply)) return;
    const parsed = z.object({ password: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: 'كلمة المرور مطلوبة' });
    const user = await prisma.user.findUnique({ where: { id: req.authUser!.id } });
    if (!user) return reply.status(401).send({ error: 'غير مصرح' });
    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return reply.status(401).send({ error: 'كلمة المرور غير صحيحة' });
    }
    await prisma.userTwoFactor.deleteMany({ where: { userId: user.id } });
    return reply.send({ ok: true });
  });

  app.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: [
            'name',
            'email',
            'phone',
            'password',
            'confirmPassword',
            'stage',
            'grade'
          ],
          properties: {
            name: { type: 'string', minLength: 2 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', minLength: 10 },
            password: { type: 'string', minLength: 10 },
            confirmPassword: { type: 'string', minLength: 10 },
            stage: { type: 'string', enum: ['primary', 'prep', 'secondary'] },
            grade: { type: 'string', minLength: 1 },
            secondaryTrack: {
              type: 'string',
              enum: ['scientific_ar', 'scientific_languages', 'literary']
            }
          }
        },
        response: {
          201: authSessionResponse,
          400: errorSchema,
          409: errorSchema
        }
      }
    },
    async (req, reply) => {
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

      const pol = await evaluatePasswordPolicy(b.password, {
        email,
        name: b.name.trim()
      });
      if (!pol.ok) {
        return reply
          .status(400)
          .send({ error: pol.errors[0] ?? 'كلمة مرور ضعيفة', details: pol.errors });
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
    }
  );

  app.post(
    '/refresh',
    {
      schema: {
        body: {
          type: 'object',
          properties: { refreshToken: { type: 'string', minLength: 10 } }
        },
        response: {
          200: authSessionResponse,
          400: errorSchema,
          401: errorSchema,
          403: errorSchema
        }
      }
    },
    async (req, reply) => {
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
    }
  );

  app.post(
    '/logout',
    {
      schema: {
        body: {
          type: 'object',
          properties: { refreshToken: { type: 'string' } }
        },
        response: {
          200: okTrueSchema,
          400: errorSchema
        }
      }
    },
    async (req, reply) => {
      const body = z.object({ refreshToken: z.string().optional() }).safeParse(req.body);
      if (!body.success) return reply.status(400).send({ error: 'طلب غير صالح' });
      const plainRefresh = body.data.refreshToken ?? readRefreshCookie(req);
      if (plainRefresh) {
        const tokenHash = hashRefreshToken(plainRefresh);
        await prisma.refreshToken.deleteMany({ where: { tokenHash } });
      }
      clearRefreshCookie(reply, env.COOKIE_SECURE);
      return reply.send({ ok: true });
    }
  );

  app.get(
    '/me',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: { user: publicUserSchema },
            required: ['user']
          },
          401: errorSchema
        }
      }
    },
    async (req, reply) => {
      if (!req.authUser) {
        return reply.status(401).send({ error: 'غير مصرح' });
      }
      const user = await prisma.user.findUnique({ where: { id: req.authUser.id } });
      if (!user) return reply.status(401).send({ error: 'غير مصرح' });
      return reply.send({ user: toPublicUser(user) });
    }
  );

  app.get(
    '/verify',
    {
      schema: {
        response: {
          200: validSchema,
          401: validSchema
        }
      }
    },
    async (req, reply) => {
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
    }
  );
};
