<template>
  <div class="app-layout">
    <TopNav />

    <main class="main-content">
      <router-view />
    </main>

    <BottomNav />

    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#27B969;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1DE276;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopNav from './components/TopNav.vue';
import BottomNav from './components/BottomNav.vue';
</script>

<style>
/* Reset básico para garantir que o layout ocupe a tela toda */
body, html {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

<style scoped>
/* Recomendo usar grid para a criação dos layouts - William */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  /* Espaço para a TopNav não cobrir o topo (65px de altura + 10px de respiro) */
  padding-top: 75px; 
  
  /* Espaço para a BottomNav não cobrir o rodapé (90px a 100px dependendo do seu design) */
  padding-bottom: 100px; 
  
  box-sizing: border-box;
}
</style>