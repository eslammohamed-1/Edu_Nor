/**
 * - student: مستخدم عادي
 * - admin: إدارة محدودة (صلاحيات من permissions)
 * - super_admin: كل صلاحيات المنصة
 */
export type UserRole = 'student' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  grade?: string;
  avatar?: string;
  createdAt: string;
  role: UserRole;
  /** للـ admin فقط؛ السوبر أدمن يتجاهلها وله كل شيء */
  permissions?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  grade: string;
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
