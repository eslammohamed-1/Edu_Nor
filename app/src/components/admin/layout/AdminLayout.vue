<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import AdminSidebar from './AdminSidebar.vue';
import AdminTopbar from './AdminTopbar.vue';
import AdminBreadcrumbs from './AdminBreadcrumbs.vue';
import { getApiBase } from '@/services/http/client';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';
import { useAdminContentStore } from '@/stores/admin/adminContent';
import { useAdminQuizzesStore } from '@/stores/admin/adminQuizzes';
import { useAdminSettingsStore } from '@/stores/admin/adminSettings';
import { useAdminAuditStore } from '@/stores/admin/adminAudit';
import { useAdminSessionsStore } from '@/stores/admin/adminSessions';

const sidebarRef = ref<InstanceType<typeof AdminSidebar>>();

onMounted(() => {
  if (!getApiBase()) return;
  void useAdminUsersStore().fetchUsers();
  void useAdminContentStore().fetchContent();
  void useAdminQuizzesStore().fetchQuizzes();
  void useAdminSettingsStore().fetchSettings();
  void useAdminAuditStore().fetchLogs();
  void useAdminSessionsStore().fetchSessions();
});

function toggleMobile() {
  if (sidebarRef.value) {
    sidebarRef.value.mobileOpen = !sidebarRef.value.mobileOpen;
  }
}
</script>

<template>
  <div class="admin-shell">
    <AdminSidebar ref="sidebarRef" />
    <div class="admin-main">
      <AdminTopbar @toggle-mobile="toggleMobile" />
      <div class="admin-body">
        <div class="admin-breadcrumbs-bar">
          <AdminBreadcrumbs />
        </div>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}
.admin-main {
  flex: 1;
  margin-right: 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  transition: margin-right var(--duration-normal) var(--ease-smooth);
}
.admin-body {
  flex: 1;
  padding: var(--space-lg);
  max-width: 1400px;
}
.admin-breadcrumbs-bar {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--border-color);
}
@media (max-width: 768px) {
  .admin-main { margin-right: 0; }
  .admin-body { padding: var(--space-md); }
}
</style>
