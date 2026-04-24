<script setup lang="ts">
const props = defineProps<{
  activeTab: string;
}>();

const emit = defineEmits(['change-tab']);
</script>

<template>
  <nav class="auth-nav">
    <button 
      :class="['nav-item', { active: props.activeTab === 'login' }]" 
      @click="emit('change-tab', 'login')"
    >
      Entrar
    </button>
    
    <button 
      :class="['nav-item', { active: props.activeTab === 'register' }]" 
      @click="emit('change-tab', 'register')"
    >
      Registrar-se
    </button>
  </nav>
</template>

<style scoped>
.auth-nav {
  display: flex;
  background-color: var(--color-primary);
  width: 100%;
  height: 60px;
  border-radius: 20px 20px 0 0;
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
  color: rgba(var(--color-surface-rgb), 0.85);
  cursor: pointer;
  transition: all 0.3s ease;
}


.nav-item.active {
  background-color: var(--color-surface);
  color: var(--color-success);
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