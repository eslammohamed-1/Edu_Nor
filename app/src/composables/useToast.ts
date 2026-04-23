import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  const addToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type, duration });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (msg: string, dur?: number) => addToast(msg, 'success', dur),
    error: (msg: string, dur?: number) => addToast(msg, 'error', dur),
    warning: (msg: string, dur?: number) => addToast(msg, 'warning', dur),
    info: (msg: string, dur?: number) => addToast(msg, 'info', dur),
  };
}
