import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

export interface AccessPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(
  payload: AccessPayload,
  secret: string,
  expiresSec: number
): string {
  return jwt.sign({ sub: payload.sub, role: payload.role }, secret, {
    expiresIn: expiresSec,
    issuer: 'edunor-api'
  });
}

export function verifyAccessToken(token: string, secret: string): AccessPayload {
  const decoded = jwt.verify(token, secret, { issuer: 'edunor-api' }) as jwt.JwtPayload;
  if (!decoded.sub || !decoded.role) throw new Error('Invalid token payload');
  return { sub: decoded.sub, role: decoded.role as Role };
}

export function randomRefreshToken(): string {
  return crypto.randomBytes(48).toString('base64url');
}

export function hashRefreshToken(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}
