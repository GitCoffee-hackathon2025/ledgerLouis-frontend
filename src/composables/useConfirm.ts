import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` pinta o botão de confirmação de vermelho. */
  tone?: 'danger' | 'primary';
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const pending = ref<PendingConfirm | null>(null);

const settle = (value: boolean) => {
  pending.value?.resolve(value);
  pending.value = null;
};

/**
 * Diálogo de confirmação padrão, baseado em Promise:
 *   if (await confirm({ title: 'Remover tag?', tone: 'danger' })) { ... }
 * O <ConfirmHost> no App.vue exibe o diálogo.
 */
export function useConfirm() {
  const confirm = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      pending.value?.resolve(false);
      pending.value = { ...options, resolve };
    });

  return { pending, confirm, settle };
}
