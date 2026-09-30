import { readonly, ref } from 'vue';

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const DURATION_MS = 3500;

const toasts = ref<Toast[]>([]);
let nextId = 1;

const dismiss = (id: number) => {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
};

const show = (tone: ToastTone, message: string) => {
  const id = nextId++;
  toasts.value.push({ id, tone, message });
  window.setTimeout(() => dismiss(id), DURATION_MS);
};

/**
 * Notificações rápidas do app. O <ToastHost> (montado uma vez no App.vue)
 * renderiza a fila; qualquer tela só chama `toast.success('...')`.
 */
export function useToast() {
  return {
    toasts: readonly(toasts),
    dismiss,
    success: (message: string) => show('success', message),
    error: (message: string) => show('error', message),
    info: (message: string) => show('info', message),
  };
}
