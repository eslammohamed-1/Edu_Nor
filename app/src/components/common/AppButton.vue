<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button'
});

const classes = computed(() => [
  'app-btn',
  `app-btn--${props.variant}`,
  `app-btn--${props.size}`,
  { 'app-btn--block': props.block },
  { 'app-btn--loading': props.loading }
]);
</script>

<template>
  <button
    :class="classes"
    :type="type"
    :disabled="disabled || loading"
    class="transition-all"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <span :class="{ 'opacity-0': loading }" class="btn-content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: var(--radius-md);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  border: 1.5px solid transparent;
  white-space: nowrap;
}

.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.app-btn--sm {
  padding: var(--space-xxs) var(--space-md);
  font-size: var(--text-body-sm);
  height: 36px;
}

.app-btn--md {
  padding: var(--space-xs) var(--space-lg);
  font-size: var(--text-body);
  height: 44px;
}

.app-btn--lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--text-body-lg);
  height: 52px;
}

.app-btn--block {
  display: flex;
  width: 100%;
}

/* Variants */
.app-btn--primary {
  background-color: var(--color-gold);
  color: var(--color-navy);
}

.app-btn--primary:hover:not(:disabled) {
  background-color: var(--color-gold-dark);
  box-shadow: var(--shadow-gold);
}

.app-btn--secondary {
  background-color: transparent;
  border-color: var(--color-navy);
  color: var(--color-navy);
}

.app-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-navy);
  color: var(--color-white);
}

.app-btn--ghost {
  background-color: transparent;
  color: var(--color-navy);
}

.app-btn--ghost:hover:not(:disabled) {
  background-color: rgba(30, 58, 95, 0.08);
}

.app-btn--danger {
  background-color: var(--color-error);
  color: var(--color-white);
}

.app-btn--danger:hover:not(:disabled) {
  background-color: #C0392B;
}

/* Loading Spinner */
.btn-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.opacity-0 {
  opacity: 0;
}
</style>
