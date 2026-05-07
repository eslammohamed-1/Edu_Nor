import type { User as DbUser } from '@prisma/client';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'teacher' | 'super_admin';
  banned?: boolean;
  grade?: string;
  phone?: string;
  stage?: string;
  secondaryTrack?: string;
  permissions?: string[];
  createdAt: string;
  /** هل أنهى الإرشاد الأولي (U5) */
  onboardingCompleted?: boolean;
  /** معرّفات المواد المفضّلة بعد الإرشاد */
  favoriteSubjectIds?: string[];
}

export function toPublicUser(u: DbUser): PublicUser {
  let permissions: string[] | undefined;
  if (u.permissionsJson) {
    try {
      const parsed = JSON.parse(u.permissionsJson) as unknown;
      if (Array.isArray(parsed)) permissions = parsed.filter(x => typeof x === 'string');
    } catch {
      permissions = undefined;
    }
  }
  let favoriteSubjectIds: string[] | undefined;
  if (u.favoriteSubjectsJson) {
    try {
      const parsed = JSON.parse(u.favoriteSubjectsJson) as unknown;
      if (Array.isArray(parsed)) {
        favoriteSubjectIds = parsed.filter((x): x is string => typeof x === 'string');
      }
    } catch {
      favoriteSubjectIds = undefined;
    }
  }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as PublicUser['role'],
    banned: u.banned,
    grade: u.grade ?? undefined,
    phone: u.phone ?? undefined,
    stage: u.stage ?? undefined,
    secondaryTrack: u.secondaryTrack ?? undefined,
    permissions,
    createdAt: u.createdAt.toISOString(),
    onboardingCompleted: !!u.onboardingCompletedAt,
    favoriteSubjectIds
  };
}
