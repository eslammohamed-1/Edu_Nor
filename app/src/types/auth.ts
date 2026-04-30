import type { Stage } from '@/types/course';

/**
 * - student: مستخدم عادي
 * - admin: إدارة محدودة (صلاحيات من permissions)
 * - super_admin: كل صلاحيات المنصة
 */
export type UserRole = 'student' | 'admin' | 'super_admin';

/** مسار الثانوية: علمي عربي / علمي لغات / أدبي */
export type SecondaryTrack = 'scientific_ar' | 'scientific_languages' | 'literary';

export interface User {
  id: string;
  name: string;
  email: string;
  /** ابتدائي / إعدادي / ثانوي */
  stage?: Stage;
  /** يُخزَّن فقط لطلاب `stage === 'secondary'` */
  secondaryTrack?: SecondaryTrack;
  grade?: string;
  /** رقم التليفون (مثلاً مصر: 01xxxxxxxxx) */
  phone?: string;
  avatar?: string;
  createdAt: string;
  role: UserRole;
  /** للـ admin فقط؛ السوبر أدمن يتجاهلها وله كل شيء */
  permissions?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  stage: Stage;
  grade: string;
  secondaryTrack?: SecondaryTrack;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}
