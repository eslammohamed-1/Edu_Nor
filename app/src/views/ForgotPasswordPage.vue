<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppInput from '@/components/common/AppInput.vue';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const submitted = ref(false);
const form = reactive({ email: '' });
const errors = reactive({ email: '' });

function submit() {
  errors.email = '';
  const email = form.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'اكتب بريد إلكتروني صالح';
    return;
  }
  submitted.value = true;
  toast.info('إذا كان البريد مسجلاً ستصلك تعليمات الاستعادة عند تفعيل الخدمة.');
}
</script>

<template>
  <main class="forgot-page">
    <section class="forgot-panel">
      <RouterLink to="/" class="brand-link font-ar">
        <AppIcon name="GraduationCap" :size="32" color="var(--color-gold)" />
        <span>إديو نور</span>
      </RouterLink>

      <div class="forgot-body">
        <h1 class="font-ar text-navy">استعادة كلمة المرور</h1>
        <p class="font-ar text-secondary">
          اكتب بريد حسابك وسنعرض نفس الرسالة سواء كان مسجلاً أم لا لحماية خصوصية الحسابات.
        </p>

        <form class="forgot-form" @submit.prevent="submit" novalidate>
          <AppInput
            v-model="form.email"
            label="البريد الإلكتروني"
            type="email"
            placeholder="you@example.com"
            :error="errors.email"
            required
          />
          <AppButton type="submit" block>
            إرسال تعليمات الاستعادة
          </AppButton>
        </form>

        <p v-if="submitted" class="notice font-ar">
          تم تسجيل الطلب. عند تفعيل خدمة البريد سيصل رابط الاستعادة إلى الحساب المسجل.
        </p>

        <RouterLink to="/login" class="login-link font-ar">
          العودة لتسجيل الدخول
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.forgot-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--space-xl);
  background: var(--bg-section);
}

.forgot-panel {
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

.forgot-body {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.forgot-body h1 {
  font-size: var(--text-h2);
  margin-bottom: var(--space-xs);
}

.forgot-body p {
  line-height: 1.7;
}

.forgot-form {
  display: grid;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.notice {
  margin-top: var(--space-md);
  color: var(--color-success);
  font-size: var(--text-body-sm);
}

.login-link {
  display: inline-block;
  margin-top: var(--space-lg);
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}
</style>
