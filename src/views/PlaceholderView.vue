<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Compass } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();

const title = computed(() => route.meta.title ?? 'Página em construção');
const description = computed(
  () => route.meta.description ?? 'Esta página ainda não está implementada, mas a navegação já funciona.',
);
</script>

<template>
  <div class="page placeholder-page">
    <div class="placeholder">
      <span class="code" aria-hidden="true">404</span>
      <span class="icon-tile icon-tile--solid"><Compass :size="22" /></span>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <BaseButton to="/" size="lg">Voltar ao início</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--topbar-height) - var(--bottom-nav-height));
}

.placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 460px;
  isolation: isolate;
  text-align: center;
}

.code {
  position: absolute;
  top: -70px;
  z-index: -1;
  font-family: var(--font-display);
  font-size: 9rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--color-surface-3);
}

.placeholder h1 {
  font-size: var(--text-2xl);
}

.placeholder p {
  margin-bottom: var(--space-2);
  color: var(--color-text-muted);
}
</style>
