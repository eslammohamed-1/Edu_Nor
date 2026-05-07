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
    createdAt: u.createdAt.toISOString()
  };
}
