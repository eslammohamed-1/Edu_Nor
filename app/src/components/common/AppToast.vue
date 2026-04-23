<script setup lang="ts">
import { useToast } from '@/composables/useToast';
import AppIcon from './AppIcon.vue';

const { toasts, removeToast } = useToast();

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return 'CheckCircle';
    case 'error': return 'AlertCircle';
    case 'warning': return 'AlertTriangle';
    default: return 'Info';
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item shadow-lg"
          :class="[`toast--${toast.type}`]"
        >
          <AppIcon :name="getIcon(toast.type)" :size="20" class="toast-icon" />
          <span class="toast-message font-ar">{{ toast.message }}</span>
          <button class="close-btn" @click="removeToast(toast.id)">
            <AppIcon name="X" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  min-width: 300px;
  max-width: 450px;
  background-color: var(--bg-card);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  border-left: 4px solid transparent;
}

.toast-message {
  flex: 1;
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.toast--success { border-left-color: var(--color-success); }
.toast--error { border-left-color: var(--color-error); }
.toast--warning { border-left-color: var(--color-warning); }
.toast--info { border-left-color: var(--color-info); }

.toast--success .toast-icon { color: var(--color-success); }
.toast--error .toast-icon { color: var(--color-error); }
.toast--warning .toast-icon { color: var(--color-warning); }
.toast--info .toast-icon { color: var(--color-info); }

.close-btn {
  color: var(--text-muted);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

/* Animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
