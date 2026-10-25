<template>
  <section class="dashboard-header">
    <div class="header-copy">
      <p class="eyebrow">Desempenho financeiro · {{ companyName }}</p>
      <h1 class="header-title">Relatórios</h1>
      <p class="subtitle">
        Acompanhe saldo global, movimentação de entradas e saídas e o detalhamento por categorias.
      </p>
    </div>

    <div class="header-actions">
      <!-- Menu de Exportação -->
      <div ref="exportMenuRef" class="export-menu">
        <button
          class="action-button action-button--neutral"
          type="button"
          aria-haspopup="true"
          :aria-expanded="exportMenuOpen"
          @click="exportMenuOpen = !exportMenuOpen"
        >
          <Download :size="16" aria-hidden="true" />
          <span>Exportar</span>
        </button>

        <div v-if="exportMenuOpen" class="export-dropdown" role="menu">
          <button type="button" role="menuitem" @click="pickFormat('csv')">Exportar CSV</button>
          <button type="button" role="menuitem" @click="pickFormat('pdf')">Exportar PDF</button>
        </div>
      </div>

      <!-- Botão Novo Lançamento -->
      <button
        class="action-button action-button--primary"
        type="button"
        @click="router.push({ name: 'addExpense' })"
      >
        <Plus :size="16" aria-hidden="true" />
        <span>Novo lançamento</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Download, Plus } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';

const router = useRouter();
const companyStore = useCompanyStore();
const companyName = computed(() => companyStore.company.name || 'Sua empresa');

const emit = defineEmits<{ export: [format: 'csv' | 'pdf'] }>();

const exportMenuOpen = ref(false);
const exportMenuRef = ref<HTMLElement | null>(null);

const pickFormat = (format: 'csv' | 'pdf') => {
  exportMenuOpen.value = false;
  emit('export', format);
};

const handleClickOutside = (event: MouseEvent) => {
  if (exportMenuOpen.value && !exportMenuRef.value?.contains(event.target as Node)) {
    exportMenuOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.eyebrow {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.header-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 6px 0;
  line-height: 1.15;
}

.subtitle {
  max-width: 60ch;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 8px 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--color-border);
  transition: all 0.15s ease;
}

.action-button--neutral {
  background: var(--color-surface);
  color: var(--color-text);
}

.action-button--neutral:hover {
  background: var(--color-surface-soft);
}

.action-button--primary {
  background: var(--color-primary);
  color: #111827;
  border-color: var(--color-primary);
}

.action-button--primary:hover {
  filter: brightness(0.95);
}

.export-menu {
  position: relative;
}

.export-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 140px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.export-dropdown button {
  background: transparent;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  text-align: left;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.export-dropdown button:hover {
  background: var(--color-surface-soft);
}
</style>
