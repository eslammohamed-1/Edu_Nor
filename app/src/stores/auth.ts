import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User, LoginPayload, RegisterPayload } from '@/types/auth';
import type { Stage } from '@/types/course';
import { ENABLE_MOCK_AUTH, isSuperAdminCredentials, SUPER_ADMIN_EMAIL } from '@/config/superAdmin';
import {
  normalizeStoredUser,
  readStoredAuth,
  writeStoredAuth,
  type StoredAuthPayload
} from '@/lib/authStorage';
import { apiLogoutRefresh, getApiBase } from '@/services/http/client';
import { loginRemote, registerRemote } from '@/services/authService';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');

  function applySession(payload: StoredAuthPayload, persistent = true) {
    user.value = normalizeStoredUser(payload.user);
    token.value = payload.token;
    refreshToken.value = payload.refreshToken ?? null;
    writeStoredAuth(
      {
        user: user.value,
        token: payload.token,
        refreshToken: payload.refreshToken
      },
      persistent
    );
  }

  function clearSession() {
    user.value = null;
    token.value = null;
    refreshToken.value = null;
    error.value = null;
    writeStoredAuth(null);
  }

  function hydrate() {
    const stored = readStoredAuth();
    if (stored) {
      user.value = normalizeStoredUser(stored.user);
      token.value = stored.token;
      refreshToken.value = stored.refreshToken ?? null;
    }
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const apiBase = getApiBase();
      if (apiBase) {
        const session = await loginRemote(payload);
        applySession(session, payload.remember ?? true);
        return true;
      }
      if (!ENABLE_MOCK_AUTH) {
        throw new Error('الخادم غير متصل. عرّف VITE_API_BASE_URL لتسجيل الدخول.');
      }

      await delay(700);

      if (!payload.email || !payload.password) {
        throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
      }
      if (payload.password.length < 6) {
        throw new Error('كلمة المرور قصيرة جداً');
      }

      const emailNorm = payload.email.trim().toLowerCase();
      const isSuper = isSuperAdminCredentials(payload.email, payload.password);

      const mockUser: User = isSuper
        ? {
            id: 'user_super_admin',
            name: 'مدير النظام',
            email: emailNorm,
            createdAt: new Date().toISOString(),
            role: 'super_admin'
          }
        : {
            id: 'u_' + Date.now(),
            name: emailNorm.split('@')[0] || 'طالب',
            email: emailNorm,
            stage: 'secondary' as Stage,
            grade: 'الصف الثالث الثانوي',
            createdAt: new Date().toISOString(),
            role: 'student'
          };

      const mockTok = 'mock_token_' + Math.random().toString(36).slice(2);
      applySession({ user: mockUser, token: mockTok }, payload.remember ?? true);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'حدث خطأ ما';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const apiBase = getApiBase();
      if (apiBase) {
        const session = await registerRemote(payload);
        applySession(session);
        return true;
      }
      if (!ENABLE_MOCK_AUTH) {
        throw new Error('الخادم غير متصل. عرّف VITE_API_BASE_URL لإنشاء الحساب.');
      }

      await delay(900);

      if (payload.password !== payload.confirmPassword) {
        throw new Error('كلمة المرور وتأكيدها غير متطابقين');
      }

      const emailNorm = payload.email.trim().toLowerCase();
      if (emailNorm === SUPER_ADMIN_EMAIL.toLowerCase()) {
        throw new Error('هذا البريد محجوز لحساب الإدارة. استخدم تسجيل الدخول بكلمة السر المناسبة.');
      }

      const mockUser: User = {
        id: 'u_' + Date.now(),
        name: payload.name,
        email: emailNorm,
        phone: payload.phone,
        stage: payload.stage,
        grade: payload.grade,
        secondaryTrack:
          payload.stage === 'secondary' ? payload.secondaryTrack : undefined,
        createdAt: new Date().toISOString(),
        role: 'student'
      };
      const mockTok = 'mock_token_' + Math.random().toString(36).slice(2);
      applySession({ user: mockUser, token: mockTok });
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'حدث خطأ ما';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    await apiLogoutRefresh();
    clearSession();
  }

  function clearError() {
    error.value = null;
  }

  return {
    user,
    token,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    isSuperAdmin,
    hydrate,
    login,
    register,
    logout,
    clearError
  };
});
