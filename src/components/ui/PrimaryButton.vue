<template>
  <button
    class="primary-btn"
    :class="[
      `primary-btn--${variant}`,
      { 'primary-btn--compact': compact, 'primary-btn--icon': iconOnly },
    ]"
    :disabled="loading"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean;
    /** Cor semântica — mesma forma/tamanho em todas, só muda a cor. */
    variant?: 'primary' | 'danger' | 'neutral';
    /** Versão menor, para ações secundárias/inline (ex: "Atualizar", itens de lista). */
    compact?: boolean;
    /** Botão só com ícone — vira um círculo em vez de pill alongado. */
    iconOnly?: boolean;
  }>(),
  {
    loading: false,
    variant: 'primary',
    compact: false,
    iconOnly: false,
  },
);
defineEmits(['click']);
</script>

<style scoped>
/* Componente de botão padronizado: sólido, contido, acessível */
.primary-btn {
  align-self: center;
  width: auto;
  padding: 10px 20px;
  background: var(--color-primary);
  color: #062e1e;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  white-space: nowrap;
}

.primary-btn:hover:not(:disabled) {
  filter: brightness(0.95);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.primary-btn:active:not(:disabled) {
  transform: none;
}

.primary-btn:focus-visible {
  outline: 2px solid var(--color-focus-ring, #047857);
  outline-offset: 2px;
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.primary-btn--danger {
  background: var(--color-danger);
  color: #ffffff;
  border-color: var(--color-danger);
}

.primary-btn--danger:hover:not(:disabled) {
  filter: brightness(0.92);
}

.primary-btn--neutral {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.primary-btn--neutral:hover:not(:disabled) {
  background: var(--color-surface-soft);
  color: var(--color-text);
}

.primary-btn--compact {
  padding: 8px 14px;
  min-height: 44px;
  font-size: 13px;
  gap: 6px;
}

.primary-btn--icon {
  padding: 0;
  width: 44px;
  min-height: 44px;
}

.primary-btn--icon.primary-btn--compact {
  width: 44px;
  min-height: 44px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(6, 46, 30, 0.35);
  border-top-color: #062e1e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

.primary-btn--danger .spinner {
  border-color: rgba(255, 255, 255, 0.35);
  border-top-color: white;
}

.primary-btn--neutral .spinner {
  border-color: rgba(17, 24, 39, 0.15);
  border-top-color: var(--color-text-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
