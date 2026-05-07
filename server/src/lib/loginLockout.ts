import { prisma } from '../db.js';

const WINDOW_MS = 15 * 60 * 1000;
const FAILURE_THRESHOLD = 5;
const LOCK_MS = 30 * 60 * 1000;

export async function isAccountLocked(emailNorm: string): Promise<Date | null> {
  const row = await prisma.accountLockout.findUnique({ where: { emailNorm } });
  if (!row) return null;
  if (row.lockedUntil <= new Date()) {
    await prisma.accountLockout.delete({ where: { emailNorm } }).catch(() => {});
    return null;
  }
  return row.lockedUntil;
}

export async function recordLoginFailure(emailNorm: string, ip: string | null): Promise<void> {
  const since = new Date(Date.now() - WINDOW_MS);
  await prisma.loginAttempt.create({
    data: { emailNorm, success: false, ip }
  });
  const failures = await prisma.loginAttempt.count({
    where: {
      emailNorm,
      success: false,
      createdAt: { gte: since }
    }
  });
  if (failures >= FAILURE_THRESHOLD) {
    const lockedUntil = new Date(Date.now() + LOCK_MS);
    await prisma.accountLockout.upsert({
      where: { emailNorm },
      create: { emailNorm, lockedUntil },
      update: { lockedUntil }
    });
  }
}

export async function clearLoginFailures(emailNorm: string): Promise<void> {
  await prisma.accountLockout.deleteMany({ where: { emailNorm } });
  await prisma.loginAttempt.deleteMany({ where: { emailNorm } });
}
