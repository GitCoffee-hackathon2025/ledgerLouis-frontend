<script setup lang="ts">
import { computed, nextTick, ref, watch, type Component } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import { useEventListener } from '@vueuse/core';
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CornerDownLeft,
  Layers,
  Mail,
  PieChart,
  ReceiptText,
  Repeat,
  Search,
  Settings,
  Tags,
} from 'lucide-vue-next';
import { useCommandPalette } from '@/composables/useCommandPalette';
import { useCompanyStore } from '@/stores/CompanyStore';

interface Command {
  label: string;
  group: 'Lançar' | 'Ir para';
  icon: Component;
  to: RouteLocationRaw;
  needsCompany?: boolean;
}

const commands: Command[] = [
  { label: 'Nova entrada', group: 'Lançar', icon: ArrowUp, to: { name: 'addIncome' }, needsCompany: true },
  { label: 'Nova saída', group: 'Lançar', icon: ArrowDown, to: { name: 'addExpense' }, needsCompany: true },
  { label: 'Relatórios', group: 'Ir para', icon: PieChart, to: { name: 'reports' }, needsCompany: true },
  { label: 'Transações', group: 'Ir para', icon: ReceiptText, to: { name: 'transactions' }, needsCompany: true },
  { label: 'Tags', group: 'Ir para', icon: Tags, to: { name: 'tags' }, needsCompany: true },
  { label: 'Lançamentos recorrentes', group: 'Ir para', icon: Repeat, to: { name: 'recurring' }, needsCompany: true },
  { label: 'Gerenciamento da empresa', group: 'Ir para', icon: Layers, to: { name: 'companySettings' }, needsCompany: true },
  { label: 'Trocar de empresa', group: 'Ir para', icon: Building2, to: { name: 'company' } },
  { label: 'Convites', group: 'Ir para', icon: Mail, to: { name: 'invitations' } },
  { label: 'Configurações', group: 'Ir para', icon: Settings, to: { name: 'settings' } },
];

const router = useRouter();
const companyStore = useCompanyStore();
const { isOpen, close, toggle } = useCommandPalette();

const query = ref('');
const active = ref(0);
const input = ref<HTMLInputElement>();

const results = computed(() => {
  const term = query.value.trim().toLowerCase();
  return commands
    .filter((c) => !c.needsCompany || companyStore.company.hasCompany)
    .filter((c) => !term || c.label.toLowerCase().includes(term));
});

watch(query, () => {
  active.value = 0;
});

watch(isOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
  if (!open) return;
  query.value = '';
  active.value = 0;
  await nextTick();
  input.value?.focus();
});

const run = (command?: Command) => {
  if (!command) return;
  close();
  router.push(command.to);
};

useEventListener(window, 'keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    toggle();
    return;
  }
  if (!isOpen.value) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowDown') {
    e.preventDefault();
    active.value = (active.value + 1) % Math.max(results.value.length, 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    active.value = (active.value - 1 + results.value.length) % Math.max(results.value.length, 1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    run(results.value[active.value]);
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop palette-backdrop" @click.self="close">
        <div class="palette" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
          <label class="palette-search">
            <Search :size="18" />
            <span class="sr-only">Buscar comando</span>
            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Para onde você quer ir?"
              autocomplete="off"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
            />
            <kbd>Esc</kbd>
          </label>

          <ul id="palette-list" class="palette-list" role="listbox">
            <li v-if="results.length === 0" class="palette-empty">Nada encontrado para "{{ query }}".</li>
            <template v-for="(command, index) in results" :key="command.label">
              <li v-if="index === 0 || results[index - 1]!.group !== command.group" class="palette-group" role="presentation">
                {{ command.group }}
              </li>
              <li
                role="option"
                class="palette-item"
                :class="{ 'is-active': index === active }"
                :aria-selected="index === active"
                @mousemove="active = index"
                @click="run(command)"
              >
                <component :is="command.icon" :size="17" :stroke-width="1.75" />
                <span>{{ command.label }}</span>
                <CornerDownLeft v-if="index === active" :size="14" class="palette-enter" />
              </li>
            </template>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-backdrop {
  align-items: flex-start;
  padding-top: min(18vh, 140px);
}

.palette {
  width: min(560px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg), var(--glow-primary);
}

.palette-search {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-5);
  height: 56px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-subtle);
}

.palette-search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  font-size: var(--text-md);
  color: var(--color-text);
}

.palette-search input:focus {
  outline: none;
}

.palette-search kbd {
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  font-family: var(--font-mono);
  font-size: 11px;
}

.palette-list {
  max-height: 340px;
  padding: var(--space-2);
  overflow-y: auto;
}

.palette-group {
  padding: var(--space-3) var(--space-3) var(--space-1);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-subtle);
}

.palette-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  color: var(--color-text-muted);
  cursor: pointer;
}

.palette-item.is-active {
  background: var(--color-primary-soft);
  color: var(--color-text);
}

.palette-item.is-active svg:first-child {
  color: var(--color-primary);
}

.palette-enter {
  margin-left: auto;
  color: var(--color-text-subtle);
}

.palette-empty {
  padding: var(--space-6) var(--space-3);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
