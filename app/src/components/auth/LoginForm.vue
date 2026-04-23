<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { SUPER_ADMIN_EMAIL } from '@/config/superAdmin';

const isDev = import.meta.env.DEV;

const router = useRouter();
const { login, isLoading, error, clearError, isSuperAdmin } = useAuth();
const toast = useToast();

const form = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

const showPassword = ref(false);

function validate(): boolean {
  errors.email = '';
  errors.password = '';
  let ok = true;

  if (!form.email) {
    errors.email = 'البريد الإلكتروني مطلوب';
    ok = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'البريد الإلكتروني غير صالح';
    ok = false;
  }

  if (!form.password) {
    errors.password = 'كلمة المرور مطلوبة';
    ok = false;
  } else if (form.password.length < 6) {
    errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    ok = false;
  }

  return ok;
}

async function handleSubmit() {
  clearError();
  if (!validate()) return;

  const success = await login({ email: form.email, password: form.password });
  if (success) {
    toast.success(
      isSuperAdmin.value ? 'مرحباً بك كمدير للنظام' : 'تم تسجيل الدخول بنجاح 👋'
    );
    router.push(isSuperAdmin.value ? '/admin' : '/dashboard');
  } else if (error.value) {
    toast.error(error.value);
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit" novalidate>
    <h2 class="form-title text-navy mb-xs font-ar">تسجيل الدخول</h2>
    <p class="form-subtitle text-secondary mb-xl font-ar">
      أهلاً بعودتك! سجّل دخولك لمتابعة رحلتك التعليمية.
    </p>

    <div class="form-fields">
      <AppInput
        v-model="form.email"
        label="البريد الإلكتروني"
        type="email"
        placeholder="you@example.com"
        :error="errors.email"
        required
      />

      <div class="password-field">
        <AppInput
          v-model="form.password"
          label="كلمة المرور"
          :type="showPassword ? 'text' : 'password'"
          placeholder="••••••••"
          :error="errors.password"
          required
        />
        <button
          type="button"
          class="toggle-password"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
        >
          <AppIcon :name="showPassword ? 'EyeOff' : 'Eye'" :size="18" />
        </button>
      </div>

      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" />
          <span class="font-ar">تذكرني</span>
        </label>
        <RouterLink to="/forgot-password" class="forgot-link font-ar">
          نسيت كلمة المرور؟
        </RouterLink>
      </div>

      <AppButton type="submit" :loading="isLoading" block size="lg">
        تسجيل الدخول
      </AppButton>
    </div>

    <p class="form-footer font-ar">
      ليس لديك حساب؟
      <RouterLink to="/register" class="link-accent">أنشئ حساب جديد</RouterLink>
    </p>

    <p v-if="isDev" class="dev-hint font-ar">
      تطوير: بريد السوبر أدمن الافتراضي
      <code class="dev-code">{{ SUPER_ADMIN_EMAIL }}</code>
      — تغيّر كلمة المرور في <code class="dev-code">.env</code> (
      <code class="dev-code">VITE_SUPER_ADMIN_PASSWORD</code>).
    </p>
  </form>
</template>

<style scoped>
.login-form {
  width: 100%;
  max-width: 420px;
}

.form-title {
  font-size: var(--text-h2);
}

.form-subtitle {
  font-size: var(--text-body);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.password-field {
  position: relative;
}

.toggle-password {
  position: absolute;
  inset-inline-end: var(--space-sm);
  bottom: 10px;
  color: var(--text-muted);
  padding: var(--space-xxs);
  border-radius: var(--radius-sm);
  z-index: 2;
}

.toggle-password:hover {
  color: var(--color-navy);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-body-sm);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--text-secondary);
  cursor: pointer;
}

.remember-me input {
  accent-color: var(--color-gold);
}

.forgot-link {
  color: var(--color-navy);
  font-weight: var(--weight-medium);
}

.forgot-link:hover {
  color: var(--color-gold);
}

.form-footer {
  margin-top: var(--space-xl);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
}

.link-accent {
  color: var(--color-gold);
  font-weight: var(--weight-semibold);
  margin-inline-start: var(--space-xxs);
}

.link-accent:hover {
  color: var(--color-gold-dark);
}

.mb-xs { margin-bottom: var(--space-xs); }
.mb-xl { margin-bottom: var(--space-xl); }

.dev-hint {
  margin-top: var(--space-lg);
  font-size: var(--text-caption);
  color: var(--text-muted);
  line-height: 1.5;
  padding: var(--space-sm);
  background: var(--bg-section);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-color);
}

.dev-code {
  font-size: 0.85em;
  padding: 1px 4px;
  background: var(--bg-page);
  border-radius: 4px;
  word-break: break-all;
}
</style>
