<template>
  <Transition name="fade">
    <div v-if="isMenuOpen" class="nav-overlay" @click="isMenuOpen = false"></div>
  </Transition>

  <div :class="['floating-menu', { 'is-open': isMenuOpen }]">
    <button class="btn-action btn-income" @click="handleNavigate('/add/income')">
      Entrada
      <ArrowUp :size="20" />
    </button>

    <button class="btn-action btn-expense" @click="handleNavigate('/add/expense')">
      Saída
      <ArrowDown :size="20" />
    </button>
  </div>

  <nav class="bottom-nav">
    <button 
      class="nav-item" 
      :class="{ 'active': route.path === '/' }" 
      @click="handleNavigate('/')"
    >
      <div class="icon-wrapper"><Home :size="24" /></div>
      <span>Início</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ 'active': route.path === '/management' }" 
      @click="handleNavigate('/management')"
    >
      <div class="icon-wrapper"><Layers :size="24" /></div>
      <span>Gerenciamento</span>
    </button>

    <button 
      class="nav-item btn-add-wrapper" 
      @click="isMenuOpen = !isMenuOpen"
    >
      <div :class="['plus-icon', { 'rotated': isMenuOpen }]">
        <Plus :size="28" />
      </div>
      <span :class="{ 'label-active': isMenuOpen }">Adicionar</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ 'active': route.path === '/reports' }" 
      @click="handleNavigate('/reports')"
    >
      <div class="icon-wrapper"><PieChart :size="24" /></div>
      <span>Relatórios</span>
    </button>

    <button 
      class="nav-item" 
      :class="{ 'active': route.path === '/settings' }" 
      @click="handleNavigate('/settings')"
    >
      <div class="icon-wrapper"><Settings :size="24" /></div>
      <span>Configurações</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Home, Layers, Plus, PieChart, Settings, ArrowUp, ArrowDown } from 'lucide-vue-next';

const isMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();

const handleNavigate = (path: string) => {
  router.push(path);
  isMenuOpen.value = false;
};
</script>

<style scoped>
/* Mantive os mesmos estilos de alta qualidade que definimos antes */
.nav-item, .btn-action {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border: none;
  outline: none;
  background: none;
  padding: 0;
  margin: 0;
}

.nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(3px);
  z-index: 998;
}

.floating-menu {
  position: fixed;
  bottom: 105px; 
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 220px;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-menu.is-open {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.btn-income { 
  background: linear-gradient(135deg, #27B969 0%, #1DE276 100%); 
}
.btn-expense { 
  background: linear-gradient(135deg, #E52124 0%, #FF585A 100%); 
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: white;
  padding: 8px 5px 25px 5px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  border-radius: 30px 30px 0 0;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 60px;
}

.nav-item span {
  font-size: 10px;
  font-weight: 700;
  margin-top: 5px;
  color: #9ca3af;
  transition: color 0.3s;
}

.icon-wrapper {
  padding: 6px 18px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
}

.nav-item.active .icon-wrapper {
  background-color: #f3f4f6;
  color: #27B969;
}

.nav-item.active span {
  color: #111827;
}

.plus-icon {
  background: #f9fafb;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #111827;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.plus-icon.rotated {
  transform: rotate(45deg);
  background-color: #fef2f2;
  color: #E52124;
}

.label-active {
  color: #E52124 !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.nav-item:active {
  transform: scale(0.92);
}
</style>