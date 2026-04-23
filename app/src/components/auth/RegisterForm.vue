<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const { register, isLoading, error, clearError } = useAuth();
const toast = useToast();

const grades = [
  'الصف الأول الابتدائي',
  'الصف الثاني الابتدائي',
  'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي'
];

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: ''
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: ''
});

const showPassword = ref(false);

function validate(): boolean {
  errors.name = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
  errors.grade = '';
  let ok = true;

  if (!form.name.trim()) {
    errors.name = 'الاسم مطلوب';
    ok = false;
  } else if (form.name.trim().length < 3) {
    errors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    ok = false;
  }

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

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور غير متطابقة';
    ok = false;
  }

  if (!form.grade) {
    errors.grade = 'اختر الصف الدراسي';
    ok = false;
  }

  return ok;
}

async function handleSubmit() {
  clearError();
  if (!validate()) return;

  const success = await register({
    name: form.name.trim(),
    email: form.email,
    password: form.password,
    confirmPassword: form.confirmPassword,
    grade: form.grade
  });

  if (success) {
    toast.success('تم إنشاء حسابك بنجاح 🎉');
    router.push('/dashboard');
  } else if (error.value) {
    toast.error(error.value);
  }
}
</script>

<template>
  <form class="register-form" @submit.prevent="handleSubmit" novalidate>
    <h2 class="form-title text-navy mb-xs font-ar">إنشاء حساب جديد</h2>
    <p class="form-subtitle text-secondary mb-xl font-ar">
      انضم إلى آلاف الطلاب وابدأ رحلتك التعليمية الآن.
    </p>

    <div class="form-fields">
      <AppInput
        v-model="form.name"
        label="الاسم الكامل"
        placeholder="أحمد محمد"
        :error="errors.name"
        required
      />

      <AppInput
        v-model="form.email"
        label="البريد الإلكتروني"
        type="email"
        placeholder="you@example.com"
        :error="errors.email"
        required
      />

      <div class="grade-select-group" :class="{ 'has-error': errors.grade }">
        <label class="input-label font-ar">
          الصف الدراسي <span class="required-star">*</span>
        </label>
        <select v-model="form.grade" class="grade-select">
          <option value="">اختر الصف الدراسي</option>
          <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
        </select>
        <p v-if="errors.grade" class="error-text">{{ errors.grade }}</p>
      </div>

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
        >
          <AppIcon :name="showPassword ? 'EyeOff' : 'Eye'" :size="18" />
        </button>
      </div>

      <AppInput
        v-model="form.confirmPassword"
        label="تأكيد كلمة المرور"
        :type="showPassword ? 'text' : 'password'"
        placeholder="••••••••"
        :error="errors.confirmPassword"
        required
      />

      <AppButton type="submit" :loading="isLoading" block size="lg">
        إنشاء الحساب
      </AppButton>
    </div>

    <p class="form-footer font-ar">
      لديك حساب بالفعل؟
      <RouterLink to="/login" class="link-accent">سجل الدخول</RouterLink>
    </p>
  </form>
</template>

<style scoped>
.register-form {
  width: 100%;
  max-width: 460px;
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
}

.toggle-password:hover {
  color: var(--color-navy);
}

.grade-select-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
}

.input-label {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.required-star {
  color: var(--color-error);
}

.grade-select {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-md);
  background-color: var(--bg-input);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.grade-select:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(244, 168, 37, 0.15);
}

.has-error .grade-select {
  border-color: var(--color-error);
}

.error-text {
  font-size: var(--text-caption);
  color: var(--color-error);
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
</style>
