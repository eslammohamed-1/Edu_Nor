<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';
import type { UserRole } from '@/types/auth';

const props = defineProps<{ role: UserRole }>();

const config: Record<UserRole, { label: string; icon: string; cls: string }> = {
  student: { label: 'طالب', icon: 'GraduationCap', cls: 'role-student' },
  admin:   { label: 'مدير', icon: 'UserCog', cls: 'role-admin' },
  super_admin: { label: 'سوبر أدمن', icon: 'Shield', cls: 'role-super' }
};
</script>

<template>
  <span class="role-badge font-ar" :class="config[role]?.cls">
    <AppIcon :name="config[role]?.icon || 'User'" :size="12" />
    {{ config[role]?.label || role }}
  </span>
</template>

<style scoped>
.role-badge { display: inline-flex; align-items: center; gap: 4px; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
.role-student { background: #e8f5e9; color: #2e7d32; }
.role-admin { background: #fff8e1; color: #f57f17; }
.role-super { background: #e8eaf6; color: #283593; }
[data-theme="dark"] .role-student { background: #1b5e20; color: #a5d6a7; }
[data-theme="dark"] .role-admin { background: #4e342e; color: #ffcc80; }
[data-theme="dark"] .role-super { background: #1a237e; color: #9fa8da; }
</style>
