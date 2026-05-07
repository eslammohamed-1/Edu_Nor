import type { User } from '@/types/auth';
import { apiFetch } from '@/services/http/client';

export interface GamificationStats {
  totalPoints: number;
  weeklyPoints: number;
  weekKey: string | null;
  currentStreak: number;
  bestStreak: number;
  lastStreakUtcDate: string | null;
  badges: string[];
}

export async function fetchMyStats(): Promise<GamificationStats> {
  const res = await apiFetch('/api/v1/me/stats');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'stats failed');
  }
  return (await res.json()) as GamificationStats;
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  weeklyPoints: number;
}

export interface LeaderboardResponse {
  weekKey: string;
  grade: string | null;
  items: LeaderboardRow[];
  myRank: number | null;
}

export async function fetchWeeklyLeaderboard(): Promise<LeaderboardResponse> {
  const res = await apiFetch('/api/v1/me/leaderboard');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'leaderboard failed');
  }
  return (await res.json()) as LeaderboardResponse;
}

export async function patchOnboardingComplete(body: {
  favoriteSubjectIds: string[];
  stage?: User['stage'];
  grade?: string;
  secondaryTrack?: User['secondaryTrack'];
}): Promise<User> {
  const res = await apiFetch('/api/v1/me/onboarding', {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? 'onboarding failed');
  }
  const data = (await res.json()) as { user: User };
  return data.user;
}
