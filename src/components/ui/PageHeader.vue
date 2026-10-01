<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

withDefaults(
  defineProps<{
    title: string;
    eyebrow?: string;
    description?: string;
    /** Mostra o botão "Voltar" acima do título. */
    back?: boolean;
  }>(),
  { eyebrow: undefined, description: undefined, back: false },
);

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) router.back();
  else router.push('/');
};
</script>

<template>
  <header class="page-header">
    <div class="page-header-copy">
      <button v-if="back" type="button" class="back-link" @click="goBack">
        <ArrowLeft :size="16" />
        Voltar
      </button>

      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="title">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description || $slots.description" class="description">
        <slot name="description">{{ description }}</slot>
      </p>
    </div>

    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4) var(--space-6);
  padding-bottom: var(--space-2);
}

.page-header-copy {
  flex: 1 1 380px;
  min-width: 0;
}

.back-link {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--space-4);
  padding: 6px 12px 6px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease;
}

.back-link:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.eyebrow {
  margin-bottom: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-primary);
}

.title {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.04em;
}

.description {
  margin-top: var(--space-2);
  max-width: 60ch;
  color: var(--color-text-muted);
  font-size: var(--text-md);
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
</style>
