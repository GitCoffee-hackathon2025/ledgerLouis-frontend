<script setup lang="ts">
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';
import { useConfirm } from '@/composables/useConfirm';

const { pending, settle } = useConfirm();

// Fechar pelo X, Esc ou clique fora conta como "cancelar".
const open = computed({
  get: () => pending.value !== null,
  set: (value) => {
    if (!value) settle(false);
  },
});
</script>

<template>
  <BaseModal v-model:open="open" :title="pending?.title ?? ''" size="sm">
    <p v-if="pending?.message" class="confirm-message">{{ pending.message }}</p>

    <template #footer>
      <BaseButton variant="secondary" @click="settle(false)">
        {{ pending?.cancelLabel ?? 'Cancelar' }}
      </BaseButton>
      <BaseButton :variant="pending?.tone === 'danger' ? 'danger' : 'primary'" @click="settle(true)">
        {{ pending?.confirmLabel ?? 'Confirmar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-message {
  color: var(--color-text-muted);
}
</style>
