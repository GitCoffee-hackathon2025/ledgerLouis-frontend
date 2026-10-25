<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Download, Plus } from 'lucide-vue-next';

defineProps<{
  period: string;
}>();

const emit = defineEmits<{
  'update:period': [value: string];
  export: [format: 'csv' | 'pdf'];
}>();

const exportMenuOpen = ref(false);
const exportMenuRef = ref<HTMLElement | null>(null);
const exportButtonRef = ref<HTMLButtonElement | null>(null);

const pickFormat = (format: 'csv' | 'pdf') => {
  exportMenuOpen.value = false;
  exportButtonRef.value?.focus();
  emit('export', format);
};

const closeExportMenu = (restoreFocus = false) => {
  if (exportMenuOpen.value) {
    exportMenuOpen.value = false;
    if (restoreFocus) {
      exportButtonRef.value?.focus();
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (exportMenuOpen.value && !exportMenuRef.value?.contains(event.target as Node)) {
    exportMenuOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <header class="lg-page-head">
    <div>
      <h1 class="lg-title">Relatórios</h1>
      <p class="lg-lede">Acompanhe saldo acumulado, fluxo por período e projeções da sua empresa.</p>
    </div>

    <div class="lg-actions">
      <!-- Seletor de período -->
      <label for="report-period" class="sr-only">Período analisado</label>
      <select
        id="report-period"
        class="lg-select period-select"
        :value="period"
        @change="emit('update:period', ($event.target as HTMLSelectElement).value)"
      >
        <option value="weekly">Últimas 4 semanas</option>
        <option value="monthly">Últimos 6 meses</option>
        <option value="daily">Últimos 7 dias</option>
        <option value="annual">Últimos 5 anos</option>
        <option value="all">Todo o histórico</option>
      </select>

      <!-- Menu de Exportação -->
      <div ref="exportMenuRef" class="export-menu-wrap">
        <button
          ref="exportButtonRef"
          type="button"
          class="lg-btn"
          :aria-expanded="exportMenuOpen"
          aria-haspopup="true"
          aria-controls="export-dropdown"
          @click="exportMenuOpen = !exportMenuOpen"
          @keydown.esc="closeExportMenu(false)"
        >
          <Download :size="16" aria-hidden="true" />
          <span>Exportar</span>
        </button>

        <div
          v-if="exportMenuOpen"
          id="export-dropdown"
          class="export-dropdown"
          role="menu"
          @keydown.esc.stop="closeExportMenu(true)"
        >
          <button type="button" class="export-opt" role="menuitem" @click="pickFormat('csv')">
            Exportar CSV
          </button>
          <button type="button" class="export-opt" role="menuitem" @click="pickFormat('pdf')">
            Exportar PDF
          </button>
        </div>
      </div>

      <!-- Novo lançamento -->
      <router-link :to="{ name: 'addExpense' }" class="lg-btn lg-btn--primary">
        <Plus :size="16" aria-hidden="true" />
        <span>Novo lançamento</span>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.period-select {
  width: auto;
  min-width: 170px;
}

.export-menu-wrap {
  position: relative;
}

.export-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 20;
  min-width: 150px;
  background: var(--lg-paper);
  border: 1px solid var(--lg-line);
  border-radius: var(--lg-radius-sm);
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.export-opt {
  min-height: 44px;
  display: flex;
  align-items: center;
  border: none;
  background: transparent;
  color: var(--lg-ink);
  padding: 10px 14px;
  text-align: left;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  width: 100%;
}

.export-opt:hover {
  background: var(--lg-sunken);
}
</style>
