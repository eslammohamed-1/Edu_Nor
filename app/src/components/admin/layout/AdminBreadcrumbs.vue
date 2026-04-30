<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';

const route = useRoute();

interface Crumb { label: string; to?: string; }

const crumbs = computed<Crumb[]>(() => {
  const list: Crumb[] = [{ label: 'لوحة التحكم', to: route.path === '/admin' ? undefined : '/admin' }];
  const matched = route.matched.slice(1); // skip the AdminLayout parent
  for (const r of matched) {
    if (r.meta?.title) {
      const title = (r.meta.title as string).split(' — ')[0];
      const prev = list[list.length - 1];
      if (prev && prev.label === title) continue;
      list.push({ label: title, to: r.path === route.path ? undefined : r.path });
    }
  }
  return list;
});
</script>

<template>
  <nav class="breadcrumbs" aria-label="breadcrumb">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <RouterLink v-if="crumb.to" :to="crumb.to" class="crumb-link font-ar">
        {{ crumb.label }}
      </RouterLink>
      <span v-else class="crumb-current font-ar">{{ crumb.label }}</span>
      <AppIcon v-if="i < crumbs.length - 1" name="ChevronLeft" :size="14" class="crumb-sep" />
    </template>
  </nav>
</template>

<style scoped>
.breadcrumbs { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.crumb-link { color: var(--text-secondary); font-size: 0.8125rem; text-decoration: none; transition: color var(--duration-fast); }
.crumb-link:hover { color: var(--color-navy); }
.crumb-current { color: var(--text-primary); font-size: 0.8125rem; font-weight: 600; }
.crumb-sep { color: var(--text-muted); flex-shrink: 0; }
</style>
