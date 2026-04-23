<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  bordered?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  bordered: true
});
</script>

<template>
  <div
    class="app-card transition-all"
    :class="[
      `p-${padding}`,
      { 'app-card--hoverable': hoverable },
      { 'app-card--bordered': bordered }
    ]"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.app-card--bordered {
  border: 1px solid var(--border-color);
}

.app-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.p-none { padding: 0; }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-lg); }
.p-lg { padding: var(--space-xl); }

.card-header {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
}

.card-footer {
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
}
</style>
