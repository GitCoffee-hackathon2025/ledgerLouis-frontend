<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowDown, ArrowUp, Plus } from 'lucide-vue-next';
import { isNavItemActive, mainNav } from '@/router/navigation';

const route = useRoute();
const isMenuOpen = ref(false);

const leftItems = computed(() => mainNav.slice(0, 2));
const rightItems = computed(() => mainNav.slice(2));

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
  },
);
</script>

<template>
  <div class="bottom-nav-root">
    <Transition name="fade">
      <div v-if="isMenuOpen" class="nav-overlay" @click="isMenuOpen = false" />
    </Transition>

    <Transition name="sheet">
      <div v-if="isMenuOpen" class="quick-menu">
        <RouterLink :to="{ name: 'addIncome' }" class="quick-action quick-action--income">
          <ArrowUp :size="20" />
          Nova entrada
        </RouterLink>
        <RouterLink :to="{ name: 'addExpense' }" class="quick-action quick-action--expense">
          <ArrowDown :size="20" />
          Nova saída
        </RouterLink>
      </div>
    </Transition>

    <nav class="bottom-nav" aria-label="Navegação principal">
      <RouterLink
        v-for="item in leftItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ 'is-active': isNavItemActive(item, route.name) }"
      >
        <span class="nav-icon"><component :is="item.icon" :size="21" :stroke-width="1.75" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>

      <button
        type="button"
        class="nav-item"
        :aria-expanded="isMenuOpen"
        aria-label="Adicionar lançamento"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="fab" :class="{ 'is-open': isMenuOpen }"><Plus :size="24" :stroke-width="2" /></span>
      </button>

      <RouterLink
        v-for="item in rightItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ 'is-active': isNavItemActive(item, route.name) }"
      >
        <span class="nav-icon"><component :is="item.icon" :size="21" :stroke-width="1.75" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.nav-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-nav);
  background: var(--color-overlay);
  backdrop-filter: blur(6px);
}

.quick-menu {
  position: fixed;
  left: 50%;
  bottom: calc(var(--bottom-nav-height) + 12px + env(safe-area-inset-bottom));
  z-index: var(--z-overlay);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 220px;
  transform: translateX(-50%);
}

.quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 50px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  box-shadow: var(--shadow-lg);
  font-weight: 600;
}

.quick-action--income {
  color: var(--color-primary);
}

.quick-action--expense {
  color: var(--color-danger);
}

.sheet-enter-active,
.sheet-leave-active {
  transition:
    opacity var(--duration) ease,
    transform var(--duration) var(--ease-out);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

/* Doca flutuante: pilula separada das bordas, com o botao + no centro. */
.bottom-nav {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 64px;
  padding: 0 6px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  box-shadow: var(--shadow-lg);
  backdrop-filter: saturate(1.4) blur(20px);
  -webkit-backdrop-filter: saturate(1.4) blur(20px);
}

@media (min-width: 1024px) {
  .bottom-nav-root {
    display: none;
  }
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  color: var(--color-text-subtle);
  -webkit-tap-highlight-color: transparent;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 28px;
  border-radius: var(--radius-full);
  transition:
    background-color var(--duration) ease,
    color var(--duration) ease;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-item.is-active {
  color: var(--color-text);
}

.nav-item.is-active .nav-icon {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-primary);
  transition:
    transform var(--duration) var(--ease-out),
    background var(--duration) ease;
}

.fab.is-open {
  transform: rotate(45deg);
  background: var(--color-surface-3);
  color: var(--color-text);
  box-shadow: 0 0 0 1px var(--color-border-strong) inset;
}
</style>
