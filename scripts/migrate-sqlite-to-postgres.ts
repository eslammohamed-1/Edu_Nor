#!/usr/bin/env node
/**
 * نقل جداول أساسية من SQLite القديم إلى Postgres (يحافظ على المعرّفات حيث يرد).
 * اضبط `SQLITE_PATH` أواترك الافتراضي `server/prisma/dev.db`.
 * من المجلد server: `npm run migrate:sqlite`
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import type { Role } from '@prisma/client';

const here = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(here, '../server/.env') });

const { prisma } = await import('../server/src/db.js');

const sqlitePath = process.env.SQLITE_PATH ?? resolve(here, '../server/prisma/dev.db');

function tableExists(db: Database.Database, name: string): boolean {
  const row = db
    .prepare(`SELECT 1 AS x FROM sqlite_master WHERE type='table' AND name=?`)
    .get(name);
  return !!row;
}

function parseDate(v: unknown): Date {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') return new Date(v);
  return new Date();
}

function toRole(v: unknown): Role {
  const s = String(v);
  if (s === 'student' || s === 'admin' || s === 'teacher' || s === 'super_admin') return s;
  return 'student';
}

async function copyUsers(db: Database.Database): Promise<number> {
  if (!tableExists(db, 'User')) {
    console.warn('جدول User غير موجود في SQLite — تخطي');
    return 0;
  }
  const rows = db.prepare(`SELECT * FROM User`).all() as Record<string, unknown>[];
  let n = 0;
  for (const row of rows) {
    const id = String(row.id ?? '');
    if (!id) continue;
    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email: String(row.email ?? ''),
        passwordHash: String(row.passwordHash ?? ''),
        name: String(row.name ?? ''),
        role: toRole(row.role),
        banned: Boolean(row.banned),
        grade: row.grade != null && row.grade !== '' ? String(row.grade) : null,
        phone: row.phone != null && row.phone !== '' ? String(row.phone) : null,
        stage: row.stage != null && row.stage !== '' ? String(row.stage) : null,
        secondaryTrack:
          row.secondaryTrack != null && row.secondaryTrack !== ''
            ? String(row.secondaryTrack)
            : null,
        permissionsJson:
          row.permissionsJson != null && String(row.permissionsJson) !== ''
            ? String(row.permissionsJson)
            : null,
        createdAt: parseDate(row.createdAt),
        updatedAt: parseDate(row.updatedAt)
      },
      update: {
        email: String(row.email ?? ''),
        passwordHash: String(row.passwordHash ?? ''),
        name: String(row.name ?? ''),
        role: toRole(row.role),
        banned: Boolean(row.banned),
        grade: row.grade != null && row.grade !== '' ? String(row.grade) : null,
        phone: row.phone != null && row.phone !== '' ? String(row.phone) : null,
        stage: row.stage != null && row.stage !== '' ? String(row.stage) : null,
        secondaryTrack:
          row.secondaryTrack != null && row.secondaryTrack !== ''
            ? String(row.secondaryTrack)
            : null,
        permissionsJson:
          row.permissionsJson != null && String(row.permissionsJson) !== ''
            ? String(row.permissionsJson)
            : null,
        updatedAt: parseDate(row.updatedAt)
      }
    });
    n += 1;
  }
  return n;
}

async function copyRefreshTokens(db: Database.Database): Promise<number> {
  if (!tableExists(db, 'RefreshToken')) {
    console.warn('جدول RefreshToken غير موجود في SQLite — تخطي');
    return 0;
  }
  const rows = db.prepare(`SELECT * FROM RefreshToken`).all() as Record<string, unknown>[];
  let n = 0;
  for (const row of rows) {
    const id = String(row.id ?? '');
    const tokenHash = String(row.tokenHash ?? '');
    if (!id || !tokenHash) continue;
    await prisma.refreshToken.upsert({
      where: { id },
      create: {
        id,
        tokenHash,
        userId: String(row.userId ?? ''),
        expiresAt: parseDate(row.expiresAt),
        ip: row.ip != null && row.ip !== '' ? String(row.ip) : null,
        userAgent: row.userAgent != null && row.userAgent !== '' ? String(row.userAgent) : null,
        createdAt: parseDate(row.createdAt)
      },
      update: {
        tokenHash,
        userId: String(row.userId ?? ''),
        expiresAt: parseDate(row.expiresAt),
        ip: row.ip != null && row.ip !== '' ? String(row.ip) : null,
        userAgent: row.userAgent != null && row.userAgent !== '' ? String(row.userAgent) : null
      }
    });
    n += 1;
  }
  return n;
}

async function copyAdminSnapshots(db: Database.Database): Promise<number> {
  if (!tableExists(db, 'AdminSnapshot')) {
    console.warn('جدول AdminSnapshot غير موجود في SQLite — تخطي');
    return 0;
  }
  const rows = db.prepare(`SELECT * FROM AdminSnapshot`).all() as Record<string, unknown>[];
  let n = 0;
  for (const row of rows) {
    const key = String(row.key ?? '');
    if (!key) continue;
    await prisma.adminSnapshot.upsert({
      where: { key },
      create: {
        key,
        dataJson: String(row.dataJson ?? '{}'),
        createdAt: parseDate(row.createdAt),
        updatedAt: parseDate(row.updatedAt)
      },
      update: {
        dataJson: String(row.dataJson ?? '{}'),
        updatedAt: parseDate(row.updatedAt)
      }
    });
    n += 1;
  }
  return n;
}

async function copyAuditLogs(db: Database.Database): Promise<number> {
  if (!tableExists(db, 'AuditLog')) {
    console.warn('جدول AuditLog غير موجود في SQLite — تخطي');
    return 0;
  }
  const rows = db.prepare(`SELECT * FROM AuditLog`).all() as Record<string, unknown>[];
  let n = 0;
  for (const row of rows) {
    const id = String(row.id ?? '');
    if (!id) continue;
    await prisma.auditLog.upsert({
      where: { id },
      create: {
        id,
        actorId: row.actorId != null && row.actorId !== '' ? String(row.actorId) : null,
        actorName: String(row.actorName ?? ''),
        actorRole: String(row.actorRole ?? ''),
        action: String(row.action ?? ''),
        targetJson:
          row.targetJson != null && String(row.targetJson) !== '' ? String(row.targetJson) : null,
        metaJson: row.metaJson != null && String(row.metaJson) !== '' ? String(row.metaJson) : null,
        ip: row.ip != null && row.ip !== '' ? String(row.ip) : null,
        userAgent:
          row.userAgent != null && row.userAgent !== '' ? String(row.userAgent) : null,
        createdAt: parseDate(row.createdAt)
      },
      update: {
        actorId: row.actorId != null && row.actorId !== '' ? String(row.actorId) : null,
        actorName: String(row.actorName ?? ''),
        actorRole: String(row.actorRole ?? ''),
        action: String(row.action ?? ''),
        targetJson:
          row.targetJson != null && String(row.targetJson) !== '' ? String(row.targetJson) : null,
        metaJson: row.metaJson != null && String(row.metaJson) !== '' ? String(row.metaJson) : null,
        ip: row.ip != null && row.ip !== '' ? String(row.ip) : null,
        userAgent:
          row.userAgent != null && row.userAgent !== '' ? String(row.userAgent) : null
      }
    });
    n += 1;
  }
  return n;
}

let dbFile: Database.Database;
try {
  dbFile = new Database(sqlitePath, { readonly: true, fileMustExist: true });
} catch (e) {
  console.error('تعذّر فتح ملف SQLite:', sqlitePath, e);
  process.exit(1);
}

try {
  console.log('SQLite:', sqlitePath);
  const users = await copyUsers(dbFile);
  const tokens = await copyRefreshTokens(dbFile);
  const snapshots = await copyAdminSnapshots(dbFile);
  const logs = await copyAuditLogs(dbFile);
  console.log('تم النقل — User:', users, 'RefreshToken:', tokens, 'AdminSnapshot:', snapshots, 'AuditLog:', logs);
} finally {
  dbFile.close();
  await prisma.$disconnect();
}
