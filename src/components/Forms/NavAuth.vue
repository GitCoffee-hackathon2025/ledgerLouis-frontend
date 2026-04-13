<template>
  <nav class="auth-nav">
    <button 
      :class="['nav-item', { active: activeTab === 'login' }]" 
      @click="activeTab = 'login'"
    >
      <i class="icon-entrar"></i>
      Entrar
    </button>
    
    <button 
      :class="['nav-item', { active: activeTab === 'register' }]" 
      @click="activeTab = 'register'"
    >
      Registrar-se
      <i class="icon-user-plus"></i>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const activeTab = ref('register');
</script>

<style scoped>
.auth-nav {
  display: flex;
  background-color: var(--color-primary); 
  width: 100%;
  height: 60px;
  overflow: hidden;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: transparent;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  color: #000;
  cursor: pointer;
  transition: all 0.3s ease;
}


.nav-item.active {
  background-color: #fff;
  color: #000;
}
.nav-item:first-child.active {
  border-radius: 0 40px 0 0;
}
.nav-item:last-child.active {
  border-radius: 40px 0 0 0;
}
.nav-item i {
  font-size: 1.2rem;
}
</style>