import type { Stage } from '@/types/course';

/**
 * - student: مستخدم عادي
 * - admin: إدارة محدودة (صلاحيات من permissions)
 * - teacher: معلم
 * - super_admin: كل صلاحيات المنصة
 */
export type UserRole = 'student' | 'admin' | 'teacher' | 'super_admin';

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
  /** للـ admin والمعلم؛ إن غابت نستخدم افتراضيات الدور (انظر seed RolePermission) */
  permissions?: string[];
  /** من الخادم بعد U5 — `false` يعني يحتاج صفحة الإرشاد */
  onboardingCompleted?: boolean;
  /** مواد مفضّلة بعد الإرشاد */
  favoriteSubjectIds?: string[];
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
