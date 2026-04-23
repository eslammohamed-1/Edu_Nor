<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';
import { adminNavSections } from '@/config/adminNav';

const route = useRoute();
const collapsed = ref(false);
const mobileOpen = ref(false);

function isActive(to: string): boolean {
  if (to === '/admin') return route.path === '/admin';
  return route.path.startsWith(to);
}

defineExpose({ mobileOpen });
</script>

<template>
  <!-- Mobile overlay -->
  <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false"></div>

  <aside class="admin-sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!collapsed" class="sidebar-brand">
        <span class="brand-logo font-en">EN</span>
        <div>
          <p class="brand-name font-ar">إديو نور</p>
          <span class="brand-badge font-ar">سوبر أدمن</span>
        </div>
      </div>
      <span v-else class="brand-logo font-en brand-logo-only">EN</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        <AppIcon :name="collapsed ? 'ChevronRight' : 'ChevronLeft'" :size="16" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div v-for="section in adminNavSections" :key="section.title" class="nav-section">
        <p v-if="!collapsed" class="section-label font-ar">{{ section.title }}</p>
        <ul>
          <li v-for="link in section.links" :key="link.to">
            <RouterLink
              :to="link.to"
              class="nav-link font-ar"
              :class="{ active: isActive(link.to) }"
              :title="collapsed ? link.label : ''"
              @click="mobileOpen = false"
            >
              <AppIcon :name="link.icon" :size="18" />
              <span v-if="!collapsed">{{ link.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <RouterLink to="/" class="back-btn font-ar" :title="collapsed ? 'الرجوع للموقع' : ''">
        <AppIcon name="ExternalLink" :size="16" />
        <span v-if="!collapsed">الرجوع للموقع</span>
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 260px;
  background: var(--color-navy-dark, #162D4A);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width var(--duration-normal) var(--ease-smooth);
  z-index: var(--z-drawer);
  overflow: hidden;
}
.admin-sidebar.collapsed { width: 64px; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  min-height: 64px;
}
.sidebar-brand { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
.brand-logo {
  width: 36px; height: 36px; flex-shrink: 0;
  background: var(--color-gold);
  color: var(--color-navy-dark);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.875rem;
}
.brand-logo-only { margin: auto; }
.brand-name { font-size: 0.9375rem; font-weight: 700; white-space: nowrap; }
.brand-badge { font-size: 0.7rem; background: rgba(244,168,37,0.25); color: var(--color-gold); padding: 1px 6px; border-radius: var(--radius-full); }
.collapse-btn { background: rgba(255,255,255,0.1); border: none; color: #fff; width: 28px; height: 28px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background var(--duration-fast); }
.collapse-btn:hover { background: rgba(255,255,255,0.2); }

.sidebar-nav { flex: 1; overflow-y: auto; padding: 0.5rem; scrollbar-width: thin; }
.nav-section { margin-bottom: 0.5rem; }
.section-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); padding: 0.5rem 0.75rem 0.25rem; }
.nav-link {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-md);
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all var(--duration-fast);
  white-space: nowrap;
}
.nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-link.active { background: var(--color-gold); color: var(--color-navy-dark); font-weight: 700; }

.sidebar-footer { padding: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); }
.back-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem; border-radius: var(--radius-md); color: rgba(255,255,255,0.6); text-decoration: none; font-size: 0.875rem; transition: all var(--duration-fast); }
.back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: calc(var(--z-drawer) - 1); }

@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(100%);
    width: 260px !important;
    transition: transform var(--duration-normal) var(--ease-smooth);
  }
  .admin-sidebar.mobile-open { transform: translateX(0); }
  .collapse-btn { display: none; }
}
</style>
