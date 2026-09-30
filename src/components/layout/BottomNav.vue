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
        <span class="nav-icon"><component :is="item.icon" :size="22" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>

      <button
        type="button"
        class="nav-item"
        :aria-expanded="isMenuOpen"
        aria-label="Adicionar lançamento"
        @click="isMenuOpen = !isMenuOpen"
      >
        <span class="fab" :class="{ 'is-open': isMenuOpen }"><Plus :size="26" /></span>
      </button>

      <RouterLink
        v-for="item in rightItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ 'is-active': isNavItemActive(item, route.name) }"
      >
        <span class="nav-icon"><component :is="item.icon" :size="22" /></span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: var(--color-overlay);
  backdrop-filter: blur(3px);
}

.quick-menu {
  position: fixed;
  left: 50%;
  bottom: calc(var(--bottom-nav-height) + 16px + env(safe-area-inset-bottom));
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 230px;
  transform: translateX(-50%);
}

.quick-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  border-radius: var(--radius-full);
  font-weight: 700;
  color: #fff;
}

.quick-action--income {
  background: var(--gradient-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-primary);
}

.quick-action--expense {
  background: var(--gradient-danger);
  box-shadow: var(--shadow-danger);
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

.bottom-nav {
  position: fixed;
  inset: auto 0 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: calc(var(--bottom-nav-height) - 12px + env(safe-area-inset-bottom));
  padding: 0 6px env(safe-area-inset-bottom);
  background: color-mix(in srgb, var(--color-surface) 90%, transparent);
  border-top: 1px solid var(--color-border);
  backdrop-filter: saturate(1.6) blur(14px);
  -webkit-backdrop-filter: saturate(1.6) blur(14px);
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
  gap: 3px;
  min-width: 0;
  color: var(--color-text-subtle);
  -webkit-tap-highlight-color: transparent;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 30px;
  border-radius: var(--radius-full);
  transition:
    background-color var(--duration) ease,
    color var(--duration) ease;
}

.nav-label {
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

.nav-item.is-active {
  color: var(--color-text);
}

.nav-item.is-active .nav-icon {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin-top: -18px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-primary), 0 0 0 5px var(--color-surface);
  transition:
    transform var(--duration) var(--ease-out),
    background var(--duration) ease;
}

.fab.is-open {
  transform: rotate(45deg);
  background: var(--color-text);
  color: var(--color-surface);
}
</style>
