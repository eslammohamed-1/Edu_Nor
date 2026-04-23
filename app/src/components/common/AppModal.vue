<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import AppIcon from './AppIcon.vue';

interface Props {
  show: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlay: true
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close();
  }
};

onMounted(() => window.addEventListener('keydown', onEsc));
onUnmounted(() => window.removeEventListener('keydown', onEsc));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="closeOnOverlay && close()">
        <div class="modal-container transition-all" :class="[`modal--${size}`]">
          <div class="modal-header">
            <h3 class="modal-title font-ar">{{ title }}</h3>
            <button class="close-btn" @click="close">
              <AppIcon name="X" :size="20" />
            </button>
          </div>
          
          <div class="modal-content">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 58, 95, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  padding: var(--space-md);
}

.modal-container {
  background-color: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal--sm { max-width: 400px; }
.modal--md { max-width: 600px; }
.modal--lg { max-width: 800px; }
.modal--xl { max-width: 1140px; }

.modal-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--text-h3);
  color: var(--color-navy);
}

.close-btn {
  color: var(--text-secondary);
  transition: color var(--duration-fast);
}

.close-btn:hover {
  color: var(--color-error);
}

.modal-content {
  padding: var(--space-lg);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: slideUp 0.3s var(--ease-bounce);
}

.modal-fade-leave-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform: translateY(20px);
  opacity: 0;
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
