import { prisma } from '../db.js';
import { sseNotifyUser } from './sse-notify.js';

export const POINTS_LESSON_COMPLETE = 10;
export const POINTS_QUIZ_PASS = 25;
export const POINTS_SUBJECT_COMPLETE = 50;

export const BADGE_FIRST_LESSON = 'first_lesson';
export const BADGE_STREAK_7 = 'streak_7';
export const BADGE_STREAK_30 = 'streak_30';
export const BADGE_BOOKWORM = 'bookworm';
export const BADGE_QUIZ_MASTER = 'quiz_master';
export const BADGE_SUBJECT_HERO = 'subject_hero';

export function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function utcYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function prevUtcDay(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return utcYmd(d);
}

function parseBadges(json: string): string[] {
  try {
    const x = JSON.parse(json) as unknown;
    return Array.isArray(x) ? x.filter((b): b is string => typeof b === 'string') : [];
  } catch {
    return [];
  }
}

function serializeBadges(b: string[]): string {
  return JSON.stringify([...new Set(b)]);
}

export async function getOrCreateUserStats(userId: string) {
  let row = await prisma.userStats.findUnique({ where: { userId } });
  if (!row) {
    row = await prisma.userStats.create({
      data: { userId, weekKey: isoWeekKey(new Date()) }
    });
  }
  return row;
}

/**
 * يصفّر السلسلة الحالية إن كان آخر نشاط مسجّل قبل أمس بتوقيت UTC (مهمة مجدولة).
 */
export function reconcileStreakAgainstNow(stats: {
  currentStreak: number;
  lastStreakUtcDate: string | null;
}): number {
  const today = utcYmd(new Date());
  if (!stats.lastStreakUtcDate || stats.currentStreak === 0) {
    return stats.currentStreak;
  }
  const last = stats.lastStreakUtcDate;
  if (last === today) {
    return stats.currentStreak;
  }
  const yest = prevUtcDay(today);
  if (last === yest) {
    return stats.currentStreak;
  }
  return 0;
}

export async function persistReconciledStreakIfStale(userId: string): Promise<void> {
  const stats = await getOrCreateUserStats(userId);
  const next = reconcileStreakAgainstNow(stats);
  if (next !== stats.currentStreak) {
    await prisma.userStats.update({
      where: { userId },
      data: { currentStreak: next }
    });
  }
}

export async function reconcileAllUserStreaks(): Promise<number> {
  const rows = await prisma.userStats.findMany({
    select: { userId: true, currentStreak: true, lastStreakUtcDate: true }
  });
  let n = 0;
  for (const s of rows) {
    const next = reconcileStreakAgainstNow(s);
    if (next !== s.currentStreak) {
      await prisma.userStats.update({
        where: { userId: s.userId },
        data: { currentStreak: next }
      });
      n += 1;
    }
  }
  return n;
}

async function bumpPoints(userId: string, delta: number): Promise<void> {
  const now = new Date();
  const wk = isoWeekKey(now);
  const stats = await getOrCreateUserStats(userId);
  const weekly = stats.weekKey === wk ? stats.weeklyPoints + delta : delta;
  await prisma.userStats.update({
    where: { userId },
    data: {
      weekKey: wk,
      weeklyPoints: weekly,
      totalPoints: { increment: delta }
    }
  });
}

export async function recordActivityDayForStreak(
  userId: string,
  activityDayUtc?: string
): Promise<void> {
  const day = activityDayUtc ?? utcYmd(new Date());
  const stats = await getOrCreateUserStats(userId);
  const last = stats.lastStreakUtcDate;

  if (last === day) {
    return;
  }

  let nextStreak: number;
  if (!last) {
    nextStreak = 1;
  } else if (last === prevUtcDay(day)) {
    nextStreak = stats.currentStreak + 1;
  } else {
    nextStreak = 1;
  }

  const bestStreak = Math.max(stats.bestStreak, nextStreak);
  await prisma.userStats.update({
    where: { userId },
    data: {
      currentStreak: nextStreak,
      bestStreak,
      lastStreakUtcDate: day
    }
  });
}

async function mergeBadges(userId: string, codes: string[]): Promise<void> {
  if (!codes.length) return;
  const stats = await getOrCreateUserStats(userId);
  const have = new Set(parseBadges(stats.badgesJson));
  let changed = false;
  for (const c of codes) {
    if (!have.has(c)) {
      have.add(c);
      changed = true;
    }
  }
  if (changed) {
    await prisma.userStats.update({
      where: { userId },
      data: { badgesJson: serializeBadges([...have]) }
    });
  }
}

async function pushNotification(
  userId: string,
  title: string,
  body: string,
  href?: string
): Promise<void> {
  const row = await prisma.notification.create({
    data: {
      userId,
      title,
      body,
      href: href ?? null
    }
  });
  sseNotifyUser(userId, {
    v: 1,
    kind: 'notification',
    id: row.id,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.createdAt.toISOString()
  });
}

function clientDateHeader(hdr: string | undefined): string | undefined {
  if (!hdr || typeof hdr !== 'string') return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hdr)) return undefined;
  return hdr;
}

export type GamificationRequestHints = {
  clientDateHeader?: string | undefined;
};

export async function awardLessonComplete(
  userId: string,
  hints?: GamificationRequestHints
): Promise<void> {
  const day = clientDateHeader(hints?.clientDateHeader) ?? utcYmd(new Date());
  await bumpPoints(userId, POINTS_LESSON_COMPLETE);
  await recordActivityDayForStreak(userId, day);

  const completed = await prisma.lessonProgress.count({
    where: { userId, status: 'completed' }
  });
  const fresh = await prisma.userStats.findUnique({ where: { userId } });
  const streak = fresh?.currentStreak ?? 0;

  const badges: string[] = [];
  if (completed >= 1) badges.push(BADGE_FIRST_LESSON);
  if (streak >= 7) badges.push(BADGE_STREAK_7);
  if (streak >= 30) badges.push(BADGE_STREAK_30);
  if (completed >= 20) badges.push(BADGE_BOOKWORM);

  await mergeBadges(userId, badges);
  await pushNotification(
    userId,
    'نقاط جديدة',
    `+${POINTS_LESSON_COMPLETE} نقطة لإتمام الدرس`,
    '/dashboard'
  );
}

export async function awardQuizPass(
  userId: string,
  hints?: GamificationRequestHints
): Promise<void> {
  const day = clientDateHeader(hints?.clientDateHeader) ?? utcYmd(new Date());
  await bumpPoints(userId, POINTS_QUIZ_PASS);
  await recordActivityDayForStreak(userId, day);

  const passCount = await prisma.quizAttempt.count({
    where: { userId, passed: true }
  });
  const badges: string[] = [];
  if (passCount >= 5) badges.push(BADGE_QUIZ_MASTER);
  await mergeBadges(userId, badges);

  await pushNotification(
    userId,
    'أحسنت!',
    `+${POINTS_QUIZ_PASS} نقطة لنجاحك في الاختبار`,
    '/quiz'
  );
}

export async function awardSubjectCompletion(
  userId: string,
  hints?: GamificationRequestHints
): Promise<void> {
  const day = clientDateHeader(hints?.clientDateHeader) ?? utcYmd(new Date());
  await bumpPoints(userId, POINTS_SUBJECT_COMPLETE);
  await recordActivityDayForStreak(userId, day);
  await mergeBadges(userId, [BADGE_SUBJECT_HERO]);
  await pushNotification(
    userId,
    'إنجاز مادة',
    `+${POINTS_SUBJECT_COMPLETE} نقطة لإتمام المادة`,
    '/certificates'
  );
}

export async function getStatsPayload(userId: string) {
  await persistReconciledStreakIfStale(userId);
  const row = await getOrCreateUserStats(userId);
  return {
    totalPoints: row.totalPoints,
    weeklyPoints: row.weeklyPoints,
    weekKey: row.weekKey,
    currentStreak: row.currentStreak,
    bestStreak: row.bestStreak,
    lastStreakUtcDate: row.lastStreakUtcDate,
    badges: parseBadges(row.badgesJson)
  };
}
