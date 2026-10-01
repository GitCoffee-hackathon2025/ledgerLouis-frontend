<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import { isNavItemActive, mainNav } from '@/router/navigation';
import AppLogo from './AppLogo.vue';

const route = useRoute();
const companyStore = useCompanyStore();
</script>

<template>
  <!-- Trilho fixo e silencioso: so icones; o rotulo aparece como dica ao lado no hover/foco. -->
  <aside class="rail" aria-label="Navegação principal">
    <RouterLink to="/" class="rail-logo" aria-label="Ledger Louis, início">
      <AppLogo mark-only />
    </RouterLink>

    <nav class="rail-nav">
      <RouterLink
        v-for="item in mainNav"
        :key="item.name"
        :to="{ name: item.name }"
        class="rail-item"
        :class="{ 'is-active': isNavItemActive(item, route.name) }"
        :aria-label="item.label"
      >
        <component :is="item.icon" :size="20" :stroke-width="1.75" />
        <span class="rail-tip" aria-hidden="true">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div v-if="companyStore.company.hasCompany" class="rail-actions">
      <RouterLink :to="{ name: 'addIncome' }" class="rail-action rail-action--income" aria-label="Nova entrada">
        <ArrowUp :size="18" :stroke-width="2" />
        <span class="rail-tip" aria-hidden="true">Nova entrada</span>
      </RouterLink>
      <RouterLink :to="{ name: 'addExpense' }" class="rail-action rail-action--expense" aria-label="Nova saída">
        <ArrowDown :size="18" :stroke-width="2" />
        <span class="rail-tip" aria-hidden="true">Nova saída</span>
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.rail {
  display: none;
}

@media (min-width: 1024px) {
  .rail {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: var(--z-nav);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    width: var(--sidebar-width);
    padding: var(--space-5) 0;
    border-right: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-bg) 70%, transparent);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
}

.rail-logo {
  display: flex;
  padding: 4px;
}

.rail-nav,
.rail-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.rail-nav {
  flex: 1;
}

.rail-item,
.rail-action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  color: var(--color-text-subtle);
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease,
    transform var(--duration) var(--ease-out);
}

.rail-item:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.rail-item.is-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary-ring) inset;
}

/* Marcador de pagina atual: a luz do trilho acende encostada na borda. */
.rail-item.is-active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  border-radius: 0 2px 2px 0;
  background: var(--color-primary);
  box-shadow: 0 0 12px 0 rgba(52, 181, 133, 0.7);
}

.rail-action {
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-full);
}

.rail-action--income {
  color: var(--color-primary);
}

.rail-action--income:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary-ring);
  transform: translateY(-2px);
}

.rail-action--expense {
  color: var(--color-danger);
}

.rail-action--expense:hover {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-ring);
  transform: translateY(2px);
}

.rail-tip {
  position: absolute;
  left: calc(100% + 14px);
  padding: 6px 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface-2);
  box-shadow: var(--shadow-md);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-4px);
  pointer-events: none;
  transition:
    opacity var(--duration-fast) ease,
    transform var(--duration) var(--ease-out);
}

.rail-item:hover .rail-tip,
.rail-item:focus-visible .rail-tip,
.rail-action:hover .rail-tip,
.rail-action:focus-visible .rail-tip {
  opacity: 1;
  transform: none;
}
</style>
