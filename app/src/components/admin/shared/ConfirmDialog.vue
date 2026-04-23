<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-backdrop" @click.self="emit('cancel')">
      <div class="confirm-dialog">
        <h3 class="font-ar confirm-title">{{ title || 'تأكيد الإجراء' }}</h3>
        <p class="font-ar confirm-msg">{{ message || 'هل أنت متأكد من تنفيذ هذا الإجراء؟' }}</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost font-ar" @click="emit('cancel')">إلغاء</button>
          <button
            class="btn font-ar"
            :class="danger ? 'btn-danger' : 'btn-primary'"
            @click="emit('confirm')"
          >
            {{ confirmLabel || 'تأكيد' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
}
.confirm-dialog {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  max-width: 440px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}
.confirm-title { font-size: var(--text-h4); margin-bottom: var(--space-sm); color: var(--text-primary); }
.confirm-msg { color: var(--text-secondary); margin-bottom: var(--space-xl); line-height: 1.7; }
.confirm-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }
.btn { padding: 0.5rem 1.25rem; border-radius: var(--radius-md); border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--duration-fast); }
.btn-primary { background: var(--color-navy); color: #fff; }
.btn-primary:hover { background: var(--color-navy-light); }
.btn-danger { background: var(--color-error); color: #fff; }
.btn-danger:hover { filter: brightness(1.1); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn-ghost:hover { background: var(--bg-section); }
</style>
