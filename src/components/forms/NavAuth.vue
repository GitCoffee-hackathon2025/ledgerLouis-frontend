<script setup lang="ts">
defineProps<{ activeTab: 'login' | 'register' }>();
</script>

<template>
  <nav class="segmented segmented--block" aria-label="Acesso">
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

