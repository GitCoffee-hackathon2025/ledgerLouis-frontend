<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue';
import { X } from 'lucide-vue-next';
import BaseButton from './BaseButton.vue';

const props = withDefaults(defineProps<{ title: string; size?: 'sm' | 'md' }>(), { size: 'md' });

const open = defineModel<boolean>('open', { default: false });

const close = () => {
  open.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close();
};

// Trava o scroll da página enquanto o modal está aberto.
watch(
  open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) document.addEventListener('keydown', onKeydown);
    else document.removeEventListener('keydown', onKeydown);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="close">
        <div
          class="modal"
          :class="{ 'modal--sm': props.size === 'sm' }"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <header class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <BaseButton variant="ghost" size="sm" icon-only aria-label="Fechar" @click="close">
              <X :size="18" />
            </BaseButton>
          </header>

          <div class="modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@media (min-width: 640px) {
  .modal--sm {
    max-width: 420px;
  }
}
</style>
