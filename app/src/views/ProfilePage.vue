<script setup lang="ts">
import { reactive, ref } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppIcon from '@/components/common/AppIcon.vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';

const { user, logout, isSuperAdmin } = useAuth();
const toast = useToast();

const form = reactive({
  name: user.value?.name ?? '',
  email: user.value?.email ?? '',
  grade: user.value?.grade ?? ''
});

const isSaving = ref(false);

async function handleSave() {
  isSaving.value = true;
  await new Promise((r) => setTimeout(r, 500));
  isSaving.value = false;
  toast.success('تم حفظ التغييرات');
}
</script>

<template>
  <div class="profile-page container">
    <div v-if="user" class="profile-grid">
      <header class="profile-head">
        <div class="avatar">
          <span class="initials font-en">
            {{ user.name.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h1 class="font-ar text-navy">{{ user.name }}</h1>
          <p class="font-en text-secondary">{{ user.email }}</p>
          <p v-if="isSuperAdmin" class="role-badge font-ar">
            <AppIcon name="Shield" :size="14" color="var(--color-gold)" />
            سوبر أدمن — صلاحيات كاملة
          </p>
        </div>
      </header>

      <div class="profile-content">
        <section class="settings-card">
          <h3 class="font-ar text-navy card-title">المعلومات الشخصية</h3>
          <form class="settings-form" @submit.prevent="handleSave">
            <AppInput v-model="form.name" label="الاسم الكامل" required />
            <AppInput v-model="form.email" label="البريد الإلكتروني" type="email" required />
            <AppInput v-model="form.grade" label="الصف الدراسي" />
            <div class="form-actions">
              <AppButton type="submit" :loading="isSaving">حفظ التغييرات</AppButton>
            </div>
          </form>
        </section>

        <section class="settings-card">
          <h3 class="font-ar text-navy card-title">الإعدادات</h3>
          <div class="danger-row">
            <div>
              <h4 class="font-ar">تسجيل الخروج</h4>
              <p class="font-ar text-secondary">أغلق جلستك الحالية على هذا الجهاز.</p>
            </div>
            <AppButton variant="danger" @click="logout">
              <AppIcon name="LogOut" :size="16" />
              <span style="margin-inline-start: 6px">تسجيل الخروج</span>
            </AppButton>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: var(--space-2xl) var(--space-md) var(--space-4xl);
}

.profile-grid {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.profile-head {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--bg-section), var(--bg-page));
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 2rem;
  font-weight: var(--weight-bold);
  border: 3px solid var(--color-gold);
  flex-shrink: 0;
}

.profile-head h1 {
  font-size: var(--text-h2);
  margin-bottom: 2px;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  margin-top: var(--space-sm);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  color: var(--color-navy);
  background: rgba(244, 168, 37, 0.12);
  padding: var(--space-xxs) var(--space-sm);
  border-radius: var(--radius-full);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.settings-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
}

.card-title {
  font-size: var(--text-h3);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-xs);
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.danger-row h4 {
  font-size: var(--text-body);
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.danger-row p {
  font-size: var(--text-caption);
  margin-top: 2px;
}
</style>
