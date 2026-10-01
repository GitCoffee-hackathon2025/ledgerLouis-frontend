<script setup lang="ts">
defineProps<{ activeTab: 'login' | 'register' }>();
</script>

<template>
  <!-- O indicador desliza entre as abas: a troca de tela fica legivel como um unico movimento. -->
  <nav class="segmented segmented--block auth-tabs" :data-active="activeTab" aria-label="Acesso">
    <span class="auth-tabs-thumb" aria-hidden="true" />
    <RouterLink
      :to="{ name: 'entrar', query: $route.query }"
      replace
      class="segmented-item"
      :class="{ 'is-active': activeTab === 'login' }"
    >
      Entrar
    </RouterLink>
    <RouterLink :to="{ name: 'cadastro' }" replace class="segmented-item" :class="{ 'is-active': activeTab === 'register' }">
      Criar conta
    </RouterLink>
  </nav>
</template>

<style scoped>
.auth-tabs {
  position: relative;
  isolation: isolate;
}

.auth-tabs-thumb {
  position: absolute;
  z-index: -1;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / 2);
  border-radius: var(--radius-full);
  background: var(--color-text);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 6px 18px -8px rgba(255, 255, 255, 0.35);
  transition: transform 420ms var(--ease-out);
}

.auth-tabs[data-active='register'] .auth-tabs-thumb {
  transform: translateX(100%);
}

/* O fundo vem do indicador; o item so troca de cor. */
.auth-tabs .segmented-item {
  transition: color 320ms var(--ease-out);
}

.auth-tabs .segmented-item.is-active {
  background: transparent;
  box-shadow: none;
  color: var(--color-bg);
}
</style>
