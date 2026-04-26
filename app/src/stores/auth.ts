import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User, LoginPayload, RegisterPayload, UserRole } from '@/types/auth';
import type { Stage } from '@/types/course';
import { SUPER_ADMIN_EMAIL, isSuperAdminCredentials } from '@/config/superAdmin';
import { useCoursesStore } from '@/stores/courses';

const STORAGE_KEY = 'edunor_auth';

interface StoredAuth {
  user: User;
  token: string;
}

function readStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

function writeStorage(data: StoredAuth | null) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ترقية جلسات قديمة قبل إضافة role أو حقول stage */
function normalizeUser(raw: User): User {
  const role: UserRole = raw.role ?? 'student';
  return {
    ...raw,
    role,
    permissions: raw.permissions
  };
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');

  function hydrate() {
    const stored = readStorage();
    if (stored) {
      user.value = normalizeUser(stored.user);
      token.value = stored.token;
      // مزامنة سياق المنهج فور استعادة الجلسة
      useCoursesStore().applyUserCurriculumContext(user.value);
    }
  }

  async function login(payload: LoginPayload): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
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

      const mockToken = 'mock_token_' + Math.random().toString(36).slice(2);

      user.value = mockUser;
      token.value = mockToken;
      writeStorage({ user: mockUser, token: mockToken });
      useCoursesStore().applyUserCurriculumContext(mockUser);
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
      const mockToken = 'mock_token_' + Math.random().toString(36).slice(2);

      user.value = mockUser;
      token.value = mockToken;
      writeStorage({ user: mockUser, token: mockToken });
      useCoursesStore().applyUserCurriculumContext(mockUser);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'حدث خطأ ما';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    error.value = null;
    writeStorage(null);
    useCoursesStore().applyUserCurriculumContext(null);
  }

  function clearError() {
    error.value = null;
  }

  return {
    user,
    token,
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
