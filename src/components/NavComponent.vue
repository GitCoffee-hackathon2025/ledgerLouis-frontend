<template>
  <nav class="bottom-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.route"
      class="nav-item"
      active-class="nav-item--active"
      exact-active-class="nav-item--active"
    >
      <span class="nav-icon" v-html="item.icon"></span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
const navItems = [
  {
    name: 'home',
    label: 'Home',
    route: '/',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>`,
  },
  {
    name: 'funcionarios',
    label: 'Funcionários',
    route: '/funcionarios',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="7" r="3"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <circle cx="17" cy="7" r="3"/>
      <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>`,
  },
  {
    name: 'adicionar',
    label: 'Adicionar',
    route: '/adicionar',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,
  },
  {
    name: 'relatorio',
    label: 'Relatório',
    route: '/relatorio',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 12 L12 3"/>
      <path d="M12 12 L18.5 8.5"/>
      <path d="M12 12 L16 17"/>
    </svg>`,
  },
  {
    name: 'configuracoes',
    label: 'Configurações',
    route: '/configuracoes',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
        1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
        a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
        A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06
        A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
        a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
        a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,
  },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: space-around;

  background: #ffffff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);

  padding: 10px 8px calc(10px + env(safe-area-inset-bottom));
  height: calc(68px + env(safe-area-inset-bottom));
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  flex: 1;
  min-width: 0;
  padding: 6px 4px;
  border-radius: 12px;

  color: #9ca3af;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.15s ease;

  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 34px;
  border-radius: 10px;
  transition:
    background 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 64px;
  text-align: center;
  transition: color 0.25s ease;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.nav-item--active .nav-label {
  color: #06514C;
  font-weight: 600;
}
</style>