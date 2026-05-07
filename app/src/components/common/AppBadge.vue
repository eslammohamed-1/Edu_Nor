<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'teal' | 'gold';
  size?: 'sm' | 'md';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
});
</script>

<template>
  <span class="app-badge" :class="[`badge--${variant}`, `badge--${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--space-xs);
  border-radius: var(--radius-full);
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.badge--sm {
  font-size: 10px;
  height: 18px;
}

.badge--md {
  font-size: var(--text-caption);
  height: 24px;
}

.badge--primary {
  background-color: rgba(30, 58, 95, 0.1);
  color: var(--color-navy);
}

.badge--success {
  background-color: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
}

.badge--warning {
  background-color: rgba(243, 156, 18, 0.1);
  color: var(--color-warning);
}

.badge--danger {
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
}

.badge--info {
  background-color: rgba(52, 152, 219, 0.1);
  color: var(--color-info);
}

.badge--teal {
  background-color: rgba(46, 196, 182, 0.1);
  color: var(--color-teal);
}

.badge--gold {
  background-color: rgba(244, 168, 37, 0.12);
  color: var(--color-gold, #c9a227);
}
</style>
