<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppInput from '@/components/common/AppInput.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const { completeTwoFactor, isLoading, error, clearError, isSuperAdmin } = useAuth();
const toast = useToast();

const code = ref('');
const remember = ref(true);

async function submit() {
  clearError();
  if (!code.value.trim()) {
    toast.error('أدخل رمز التطبيق');
    return;
  }
  const ok = await completeTwoFactor(code.value, remember.value);
  if (ok) {
    toast.success('تم التحقق');
    router.push(isSuperAdmin.value ? '/admin' : '/dashboard');
  } else if (error.value) {
    toast.error(error.value);
  }
}
</script>

<template>
  <main class="page">
    <section class="panel">
      <RouterLink to="/login" class="brand-link font-ar">
        <AppIcon name="GraduationCap" :size="32" color="var(--color-gold)" />
        <span>إديو نور</span>
      </RouterLink>

      <div class="card">
        <h1 class="font-ar text-navy">التحقق الثنائي</h1>
        <p class="text-secondary font-ar">
          افتح تطبيق المصادقة وأدخل الرمز المكوّن من 6 أرقام لحساب السوبر أدمن.
        </p>

        <form class="form" @submit.prevent="submit">
          <AppInput v-model="code" label="رمز التحقق" type="text" inputmode="numeric" autocomplete="one-time-code" />
          <label class="remember font-ar">
            <input v-model="remember" type="checkbox" />
            تذكرني
          </label>
          <AppButton type="submit" :loading="isLoading" block>تأكيد</AppButton>
        </form>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-xl);
  background: var(--bg-section);
}
.panel { width: min(100%, 420px); }
.brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-navy);
  font-weight: var(--weight-bold);
  margin-bottom: var(--space-lg);
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}
.form {
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}
.remember {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-body-sm);
}
</style>
