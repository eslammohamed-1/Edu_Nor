<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import { stageLabel, trackLabel } from '@/config/educationTracks';
import type { Stage } from '@/types/course';
import type { SecondaryTrack } from '@/types/auth';
import { digitsOnlyNormalized } from '@/lib/phoneDigits';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { validatePasswordAgainstPolicy } from '@/lib/passwordPolicy';

const props = defineProps<{
  stage: Stage;
  grade: string;
  secondaryTrack?: SecondaryTrack;
}>();

const router = useRouter();
const { register, isLoading, error, clearError } = useAuth();
const toast = useToast();
const settingsStore = useAdminSettingsStore();

const stageLine = computed(() => {
  const base = `${stageLabel(props.stage)} — ${props.grade}`;
  if (props.stage === 'secondary' && props.secondaryTrack) {
    return `${base} — ${trackLabel(props.secondaryTrack)}`;
  }
  return base;
});

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
});

const showPassword = ref(false);

function validate(): boolean {
  errors.name = '';
  errors.email = '';
  errors.phone = '';
  errors.password = '';
  errors.confirmPassword = '';
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

  const phoneDigits = digitsOnlyNormalized(form.phone);
  if (!form.phone.trim()) {
    errors.phone = 'رقم التليفون مطلوب';
    ok = false;
  } else if (phoneDigits.length < 10) {
    errors.phone = 'أدخل رقماً صالحاً (10 أرقام على الأقل)';
    ok = false;
  } else if (phoneDigits.length > 15) {
    errors.phone = 'رقم التليفون طويل جداً';
    ok = false;
  }

  if (!form.password) {
    errors.password = 'كلمة المرور مطلوبة';
    ok = false;
  } else {
    const policyErr = validatePasswordAgainstPolicy(
      form.password,
      settingsStore.settings.security.passwordPolicy,
      { email: form.email, name: form.name }
    );
    if (policyErr) {
      errors.password = policyErr;
      ok = false;
    }
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور غير متطابقة';
    ok = false;
  }

  return ok;
}

function buildPayload() {
  const pay: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    stage: Stage;
    grade: string;
    secondaryTrack?: SecondaryTrack;
  } = {
    name: form.name.trim(),
    email: form.email,
    phone: digitsOnlyNormalized(form.phone),
    password: form.password,
    confirmPassword: form.confirmPassword,
    stage: props.stage,
    grade: props.grade
  };
  if (props.stage === 'secondary' && props.secondaryTrack) {
    pay.secondaryTrack = props.secondaryTrack;
  }
  return pay;
}

async function handleSubmit() {
  clearError();
  if (!validate()) return;

  const success = await register(buildPayload());

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
    <p class="form-subtitle text-secondary mb-md font-ar">
      أكمل بياناتك لإتمام التسجيل.
    </p>
    <p class="summary font-ar text-secondary mb-lg">{{ stageLine }}</p>

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

      <AppInput
        v-model="form.phone"
        label="رقم التليفون"
        type="tel"
        inputmode="tel"
        dir="ltr"
        placeholder="01xxxxxxxxx أو +20xxxxxxxxx"
        :error="errors.phone"
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

.summary {
  font-size: var(--text-body-sm);
  line-height: 1.5;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-section);
  border-radius: var(--radius-md);
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
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
</style>
