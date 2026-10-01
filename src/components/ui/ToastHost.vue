<script setup lang="ts">
import { CircleCheck, CircleAlert, Info, X } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();

const icons = { success: CircleCheck, error: CircleAlert, info: Info };
</script>

<template>
  <Teleport to="body">
    <div class="toast-region" role="region" aria-live="polite" aria-label="Notificações">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :data-tone="toast.tone">
          <component :is="icons[toast.tone]" :size="18" class="toast-icon" />
          <p class="toast-message">{{ toast.message }}</p>
          <button type="button" class="toast-close" aria-label="Fechar" @click="dismiss(toast.id)">
            <X :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-region {
  position: fixed;
  z-index: var(--z-toast);
  top: calc(var(--topbar-height) + 12px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(420px, calc(100vw - 32px));
  pointer-events: none;
}

@media (min-width: 1024px) {
  .toast-region {
    left: auto;
    right: 24px;
    transform: none;
    align-items: flex-end;
  }
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-2) 92%, transparent);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.toast[data-tone='success'] {
  --tone: var(--color-primary);
}

.toast[data-tone='error'] {
  --tone: var(--color-danger);
}

.toast[data-tone='info'] {
  --tone: var(--color-info);
}

.toast-icon {
  margin-top: 1px;
  color: var(--tone);
}

.toast-message {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.toast-close {
  display: inline-flex;
  padding: 2px;
  border-radius: var(--radius-xs);
  color: var(--color-text-subtle);
}

.toast-close:hover {
  color: var(--color-text);
  background: var(--color-surface-3);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--duration) ease,
    transform var(--duration) var(--ease-out);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.toast-move {
  transition: transform var(--duration) var(--ease-out);
}
</style>
