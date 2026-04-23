<script setup lang="ts">
import { ref } from 'vue';
import AppIcon from '@/components/common/AppIcon.vue';

interface SidebarLink {
  label: string;
  icon: string;
  to?: string;
  active?: boolean;
  badge?: string | number;
}

interface SidebarSection {
  title?: string;
  links: SidebarLink[];
}

interface Props {
  sections: SidebarSection[];
  collapsible?: boolean;
  title?: string;
}

withDefaults(defineProps<Props>(), {
  collapsible: true
});

const isCollapsed = ref(false);
const toggleCollapse = () => (isCollapsed.value = !isCollapsed.value);
</script>

<template>
  <aside class="the-sidebar" :class="{ 'the-sidebar--collapsed': isCollapsed }">
    <div class="sidebar-header">
      <h4 v-if="title && !isCollapsed" class="sidebar-title font-ar">{{ title }}</h4>
      <button
        v-if="collapsible"
        class="collapse-btn"
        @click="toggleCollapse"
        :aria-label="isCollapsed ? 'توسيع' : 'طي'"
      >
        <AppIcon :name="isCollapsed ? 'ChevronLeft' : 'ChevronRight'" :size="18" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-for="(section, idx) in sections" :key="idx" class="sidebar-section">
        <h5 v-if="section.title && !isCollapsed" class="section-title font-ar">
          {{ section.title }}
        </h5>
        <ul class="section-links">
          <li v-for="link in section.links" :key="link.label">
            <RouterLink
              v-if="link.to"
              :to="link.to"
              class="sidebar-link"
              :class="{ 'sidebar-link--active': link.active }"
            >
              <AppIcon :name="link.icon" :size="20" />
              <span v-if="!isCollapsed" class="link-label font-ar">{{ link.label }}</span>
              <span v-if="link.badge && !isCollapsed" class="link-badge">{{ link.badge }}</span>
            </RouterLink>
            <button
              v-else
              class="sidebar-link"
              :class="{ 'sidebar-link--active': link.active }"
            >
              <AppIcon :name="link.icon" :size="20" />
              <span v-if="!isCollapsed" class="link-label font-ar">{{ link.label }}</span>
              <span v-if="link.badge && !isCollapsed" class="link-badge">{{ link.badge }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.the-sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-card);
  border-inline-start: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--duration-normal) var(--ease-smooth);
  overflow: hidden;
  height: 100%;
}

.the-sidebar--collapsed {
  width: 72px;
}

.sidebar-header {
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  min-height: 60px;
}

.sidebar-title {
  font-size: var(--text-h4);
  color: var(--color-navy);
  font-weight: var(--weight-semibold);
}

.collapse-btn {
  color: var(--text-secondary);
  padding: var(--space-xxs);
  border-radius: var(--radius-sm);
  transition: background-color var(--duration-fast);
}

.collapse-btn:hover {
  background-color: var(--bg-section);
  color: var(--color-navy);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) 0;
}

.sidebar-section {
  margin-bottom: var(--space-lg);
}

.section-title {
  padding: 0 var(--space-lg);
  font-size: var(--text-caption);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-xs);
}

.section-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  color: var(--text-secondary);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  width: 100%;
  text-align: inherit;
  transition: all var(--duration-fast);
  border-inline-start: 3px solid transparent;
}

.sidebar-link:hover {
  background-color: var(--bg-section);
  color: var(--color-navy);
}

.sidebar-link--active {
  background-color: rgba(244, 168, 37, 0.08);
  color: var(--color-navy);
  border-inline-start-color: var(--color-gold);
}

[data-theme="dark"] .sidebar-link--active {
  color: var(--color-gold);
}

.link-label {
  flex: 1;
}

.link-badge {
  background-color: var(--color-gold);
  color: var(--color-navy);
  font-size: 10px;
  font-weight: var(--weight-bold);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .the-sidebar {
    width: 100%;
  }
}
</style>
