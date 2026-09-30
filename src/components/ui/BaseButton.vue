<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

const props = withDefaults(
  defineProps<{
    /** Cor semântica. `secondary` = contorno neutro, `ghost` = sem fundo. */
    variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    /** Quando informado, renderiza um RouterLink com a mesma aparência. */
    to?: RouteLocationRaw;
    loading?: boolean;
    disabled?: boolean;
    /** Botão quadrado só com ícone — exige `aria-label` ou `title`. */
    iconOnly?: boolean;
    /** Ocupa toda a largura disponível. */
    block?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    to: undefined,
    loading: false,
    disabled: false,
    iconOnly: false,
    block: false,
  },
);

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  { 'btn--icon': props.iconOnly, 'btn--block': props.block, 'is-loading': props.loading },
]);
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>

  <button v-else :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading || undefined">
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <span class="btn-content"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition:
    transform var(--duration-fast) ease,
    box-shadow var(--duration) ease,
    background-color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    opacity var(--duration-fast) ease;
}

.btn-content {
  display: inline-flex;
  align-items: center;
  gap: inherit;
}

.btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.985);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Variantes */
.btn--primary {
  background: var(--gradient-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-primary);
}

.btn--primary:hover:not(:disabled) {
  box-shadow: 0 12px 26px -8px var(--color-primary-ring), var(--shadow-primary);
  transform: translateY(-1px);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
  box-shadow: var(--shadow-danger);
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
}

.btn--secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

.btn--secondary:hover:not(:disabled) {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-3);
  color: var(--color-text);
}

/* Tamanhos */
.btn--sm {
  min-height: 36px;
  padding: 0 14px;
  gap: 6px;
  font-size: var(--text-sm);
}

.btn--lg {
  min-height: 52px;
  padding: 0 28px;
  font-size: var(--text-md);
}

.btn--icon {
  padding: 0;
  width: 44px;
}

.btn--icon.btn--sm {
  width: 36px;
}

.btn--icon.btn--lg {
  width: 52px;
}

.btn--block {
  display: flex;
  width: 100%;
}

/* Loading: mantém a largura do botão e sobrepõe o spinner. */
.is-loading .btn-content {
  visibility: hidden;
}

.btn-spinner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.7s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
