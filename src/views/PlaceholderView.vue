<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <router-link to="/" class="back-button">Voltar ao Início</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const title = computed(() => {
  const routeName = route.name ? String(route.name) : '';
  return (route.meta.title as string) || `Página ${routeName}`;
});

const description = computed(() => {
  return (
    (route.meta.description as string) ||
    'Esta página ainda não está implementada, mas a navegação já está funcionando corretamente.'
  );
});
</script>

<style scoped>
.placeholder-page {
  min-height: calc(100vh - 165px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: #f8fafc;
}

.placeholder-card {
  width: 100%;
  max-width: 520px;
  padding: 32px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
  text-align: center;
}

h1 {
  font-size: 28px;
  color: #064e3b;
  margin-bottom: 14px;
}

p {
  color: #475569;
  line-height: 1.75;
  margin-bottom: 24px;
}

.back-button {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, #27B969 0%, #1DE276 100%);
  color: white;
  font-weight: 600;
  text-decoration: none;
}
</style>
