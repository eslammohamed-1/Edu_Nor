<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppInput from '@/components/common/AppInput.vue';
import { useToast } from '@/composables/useToast';
import { getApiBase } from '@/services/http/client';
import { passwordPolicyHints, PASSWORD_MIN_LEN } from '@/lib/passwordPolicy';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = ref('');
const form = reactive({ password: '', confirm: '' });
const errors = reactive({ password: '', confirm: '' });
const busy = ref(false);

onMounted(() => {
  const t = typeof route.query.token === 'string' ? route.query.token : '';
  token.value = t || '';
});

const policyHints = computed(() => passwordPolicyHints(form.password, '', ''));

async function submit() {
  errors.password = '';
  errors.confirm = '';
  if (!token.value) {
    toast.error('رابط غير صالح');
    return;
  }
  if (form.password.length < PASSWORD_MIN_LEN) {
    errors.password = `الحد الأدنى ${PASSWORD_MIN_LEN} أحرف`;
    return;
  }
  if (form.password !== form.confirm) {
    errors.confirm = 'غير متطابق';
    return;
  }
  const base = getApiBase();
  if (!base) {
    toast.error('الخادم غير مُعرّف');
    return;
  }
  busy.value = true;
  try {
    const res = await fetch(`${base}/api/v1/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        token: token.value,
        password: form.password,
        confirmPassword: form.confirm
      })
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? 'فشل التعيين');
      return;
    }
    toast.success('تم تغيير كلمة المرور — سجّل الدخول');
    router.push('/login');
  } catch {
    toast.error('خطأ في الاتصال');
  } finally {
    busy.value = false;
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
        <h1 class="font-ar text-navy">كلمة مرور جديدة</h1>
        <p v-if="!token" class="text-secondary font-ar">رابط غير صالح أو منتهٍ. اطلب رابطاً جديداً من «نسيت كلمة المرور».</p>

        <form v-else class="form" @submit.prevent="submit">
          <AppInput
            v-model="form.password"
            label="كلمة المرور"
            type="password"
            :error="errors.password"
          />
          <ul v-if="policyHints.length" class="hints font-ar">
            <li v-for="(h, i) in policyHints" :key="i">{{ h }}</li>
          </ul>
          <AppInput
            v-model="form.confirm"
            label="تأكيد كلمة المرور"
            type="password"
            :error="errors.confirm"
          />
          <AppButton type="submit" :loading="busy" block>حفظ</AppButton>
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
.panel {
  width: min(100%, 440px);
}
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
  margin-top: var(--space-md);
}
.hints {
  margin: 0;
  padding-inline-start: var(--space-lg);
  font-size: var(--text-caption);
  color: var(--text-muted);
}
</style>
