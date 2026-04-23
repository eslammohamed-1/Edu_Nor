<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TheLayout from '@/layouts/TheLayout.vue';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { useAuthStore } from '@/stores/auth';
import AppIcon from '@/components/common/AppIcon.vue';

const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useAdminSettingsStore();

settingsStore.init();

const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const maintenanceMode = computed(() => settingsStore.settings.features.maintenanceMode);
const isSuperAdmin = computed(() => authStore.user?.role === 'super_admin');
const showMaintenance = computed(() => maintenanceMode.value && !isSuperAdmin.value && !isAdminRoute.value);
</script>

<template>
  <!-- Maintenance mode overlay for non-super-admins -->
  <div v-if="showMaintenance" class="maintenance-overlay">
    <div class="maintenance-card">
      <AppIcon name="Wrench" :size="56" color="var(--color-gold)" />
      <h1 class="font-ar">المنصة قيد الصيانة</h1>
      <p class="font-ar">نعمل على تحسين منصتنا. سنعود قريباً إن شاء الله 🚀</p>
    </div>
  </div>
  <TheLayout v-else />
</template>

<style scoped>
.maintenance-overlay {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  padding: var(--space-xl);
}
.maintenance-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  max-width: 480px;
}
.maintenance-card h1 {
  font-size: var(--text-h1);
  color: var(--text-primary);
}
.maintenance-card p {
  color: var(--text-secondary);
  font-size: var(--text-body-lg);
  line-height: 1.7;
}
</style>
