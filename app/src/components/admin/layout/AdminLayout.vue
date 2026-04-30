<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import AdminSidebar from './AdminSidebar.vue';
import AdminTopbar from './AdminTopbar.vue';
import AdminBreadcrumbs from './AdminBreadcrumbs.vue';
import { getApiBase } from '@/services/http/client';
import { useAdminUsersStore } from '@/stores/admin/adminUsers';

const sidebarRef = ref<InstanceType<typeof AdminSidebar>>();

onMounted(() => {
  if (getApiBase()) void useAdminUsersStore().fetchUsers();
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
