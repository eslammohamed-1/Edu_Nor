<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';
import AppButton from '@/components/common/AppButton.vue';
import type { User } from '@/types/auth';
import { stageLabel } from '@/config/educationTracks';
import type { Stage } from '@/types/course';

interface Props {
  user: User;
}

const props = defineProps<Props>();

const stageSummary = computed(() => {
  if (!props.user.stage) return props.user.grade ?? '';
  const g = props.user.grade ? ` — ${props.user.grade}` : '';
  return `${stageLabel(props.user.stage as Stage)}${g}`;
});

const initials = computed(() => {
  const parts = props.user.name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2);
  return (parts[0][0] + parts[1][0]).toUpperCase();
});
</script>

<template>
  <section class="widget profile-card">
    <div class="avatar" :style="{ backgroundImage: user.avatar ? `url(${user.avatar})` : '' }">
      <span v-if="!user.avatar" class="initials font-en">{{ initials }}</span>
    </div>
    <h3 class="user-name font-ar">{{ user.name }}</h3>
    <p class="user-email font-en">{{ user.email }}</p>
    <p v-if="user.phone" class="user-phone font-en">{{ user.phone }}</p>
    <span v-if="stageSummary" class="user-grade font-ar">
      <AppIcon name="GraduationCap" :size="14" />
      {{ stageSummary }}
    </span>
    <RouterLink to="/profile">
      <AppButton variant="secondary" block>تعديل الملف الشخصي</AppButton>
    </RouterLink>
  </section>
</template>

<style scoped>
.widget {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  margin-bottom: var(--space-xs);
  border: 3px solid var(--color-gold);
}

.initials {
  font-size: 1.75rem;
  font-weight: var(--weight-bold);
}

.user-name {
  font-size: var(--text-h4);
  color: var(--color-navy);
  font-weight: var(--weight-bold);
}

.user-email {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
}

.user-phone {
  font-size: var(--text-body-sm);
  color: var(--text-secondary);
  direction: ltr;
  unicode-bidi: embed;
}

.user-grade {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xxs);
  padding: var(--space-xxs) var(--space-sm);
  background-color: rgba(244, 168, 37, 0.1);
  color: var(--color-gold-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  margin: var(--space-xs) 0 var(--space-md);
}

.widget :deep(a) {
  width: 100%;
}
</style>
