import { ref } from 'vue';

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const toasts = ref<Array<ToastOptions & { id: number; show: boolean }>>([]);
let toastId = 0;

export function useToast() {
  const showToast = (options: ToastOptions) => {
    const id = toastId++;
    const toast = {
      ...options,
      id,
      show: true,
      duration: options.duration || 3000
    };
    
    toasts.value.push(toast);
    
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      const toast = toasts.value[index];
      if (toast) {
        toast.show = false;
      }
      setTimeout(() => {
        toasts.value.splice(index, 1);
      }, 300);
    }
  };

  const success = (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  };

  const error = (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  };

  const warning = (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  };

  const info = (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
}
