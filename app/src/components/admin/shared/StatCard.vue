<script setup lang="ts">
import AppIcon from '@/components/common/AppIcon.vue';

defineProps<{
  title: string;
  value: string | number;
  icon: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  loading?: boolean;
}>();
</script>

<template>
  <div class="stat-card" :class="{ loading }">
    <div class="stat-icon-wrap" :style="color ? `background: ${color}20; color: ${color}` : ''">
      <AppIcon :name="icon" :size="24" />
    </div>
    <div class="stat-body">
      <p class="stat-title font-ar">{{ title }}</p>
      <div v-if="loading" class="stat-skeleton"></div>
      <p v-else class="stat-value font-en">{{ value }}</p>
      <p v-if="delta && !loading" class="stat-delta font-ar" :class="trend">
        <span v-if="trend === 'up'">↑</span>
        <span v-else-if="trend === 'down'">↓</span>
        {{ delta }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--duration-fast);
}
.stat-card:hover { box-shadow: var(--shadow-md); }
.stat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: var(--radius-lg);
  background: var(--bg-section);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: var(--color-navy);
}
.stat-body { flex: 1; min-width: 0; }
.stat-title { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); line-height: 1; }
.stat-delta { font-size: 0.75rem; margin-top: 0.25rem; }
.stat-delta.up { color: var(--color-success); }
.stat-delta.down { color: var(--color-error); }
.stat-delta.neutral { color: var(--text-muted); }
.stat-skeleton { height: 2rem; width: 80px; background: var(--bg-section); border-radius: var(--radius-sm); animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
</style>
