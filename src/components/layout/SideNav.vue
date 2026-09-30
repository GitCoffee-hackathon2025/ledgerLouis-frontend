<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import { isNavItemActive, mainNav } from '@/router/navigation';

const route = useRoute();
const companyStore = useCompanyStore();
</script>

<template>
  <!-- Trilho fixo de 76px; no hover/foco a sidebar expande por cima do conteúdo, sem empurrá-lo. -->
  <aside class="sidebar" aria-label="Navegação principal">
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in mainNav"
        :key="item.name"
        :to="{ name: item.name }"
        class="sidebar-item"
        :class="{ 'is-active': isNavItemActive(item, route.name) }"
        :title="item.label"
      >
        <component :is="item.icon" :size="20" />
        <span class="sidebar-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div v-if="companyStore.company.hasCompany" class="sidebar-actions">
      <RouterLink :to="{ name: 'addIncome' }" class="quick-action quick-action--income" title="Nova entrada">
        <ArrowUp :size="18" />
        <span class="sidebar-label">Entrada</span>
      </RouterLink>
      <RouterLink :to="{ name: 'addExpense' }" class="quick-action quick-action--expense" title="Nova saída">
        <ArrowDown :size="18" />
        <span class="sidebar-label">Saída</span>
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .sidebar {
    position: fixed;
    top: var(--topbar-height);
    bottom: 0;
    left: 0;
    z-index: 900;
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    padding: var(--space-5) 12px;
    overflow: hidden;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    transition:
      width var(--duration) var(--ease-out),
      box-shadow var(--duration) ease;
  }

  .sidebar:hover,
  .sidebar:focus-within {
    width: var(--sidebar-width-open);
    box-shadow: var(--shadow-lg);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .sidebar-item,
  .quick-action {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 46px;
    /* (76 - 2*12 - 20) / 2 = 16px: centraliza o ícone no trilho fechado */
    padding: 0 16px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    white-space: nowrap;
    transition:
      background-color var(--duration-fast) ease,
      color var(--duration-fast) ease;
  }

  .sidebar-item {
    position: relative;
    color: var(--color-text-muted);
  }

  .sidebar-item:hover {
    background: var(--color-surface-3);
    color: var(--color-text);
  }

  .sidebar-item.is-active {
    background: var(--color-primary-soft);
    color: var(--color-primary-strong);
  }

  .sidebar-item.is-active::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 12px;
    bottom: 12px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--color-primary);
  }

  .sidebar-label {
    opacity: 0;
    transition: opacity var(--duration-fast) ease;
  }

  .sidebar:hover .sidebar-label,
  .sidebar:focus-within .sidebar-label {
    opacity: 1;
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }

  .quick-action {
    padding: 0 15px;
    border-radius: var(--radius-full);
    color: #fff;
  }

  .quick-action:hover {
    filter: brightness(1.06);
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
}
</style>
