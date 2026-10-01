<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowDownRight, ArrowUpRight, CalendarClock, Plus, Repeat } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import RecurringItem from '@/components/company/RecurringItem.vue';
import RecurringFormModal from '@/components/company/RecurringFormModal.vue';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import type { RecurringFrequency, RecurringTransactionDto } from '@/services/recurringTransactionService';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { formatCurrency, formatIsoDate } from '@/utils/format';

const store = useRecurringTransactionStore();
const toast = useToast();
const { confirm } = useConfirm();

const showForm = ref(false);
const runningId = ref<string | null>(null);
const filter = ref<'all' | 'debit' | 'credit'>('all');

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'debit', label: 'Saídas' },
  { value: 'credit', label: 'Entradas' },
] as const;

const sortedItems = computed(() =>
  store.items
    .filter((item) => filter.value === 'all' || item.entryType === filter.value)
    .sort((a, b) => a.nextRunDate.localeCompare(b.nextRunDate)),
);

// Normaliza qualquer frequência para "por mês" para o resumo do topo.
const monthlyFactor: Record<RecurringFrequency, number> = { weekly: 52 / 12, monthly: 1, yearly: 1 / 12 };

const activeItems = computed(() => store.items.filter((item) => item.status === 'active'));

const monthlyTotal = (entryType: 'credit' | 'debit') =>
  activeItems.value
    .filter((item) => item.entryType === entryType)
    .reduce((sum, item) => sum + item.amount * monthlyFactor[item.frequency], 0);

const nextRun = computed(() =>
  [...activeItems.value].sort((a, b) => a.nextRunDate.localeCompare(b.nextRunDate))[0],
);

const summary = computed(() => [
  {
    label: 'Saídas fixas / mês',
    value: formatCurrency(monthlyTotal('debit')),
    icon: ArrowDownRight,
    tone: 'danger',
  },
  {
    label: 'Entradas fixas / mês',
    value: formatCurrency(monthlyTotal('credit')),
    icon: ArrowUpRight,
    tone: 'primary',
  },
  {
    label: 'Próximo lançamento',
    value: nextRun.value ? formatIsoDate(nextRun.value.nextRunDate) : '-',
    icon: CalendarClock,
    tone: 'neutral',
  },
]);

const handleRunNow = async (item: RecurringTransactionDto) => {
  runningId.value = item.id;
  try {
    const result = await store.runNow(item.id);
    if (result.created > 0) toast.success('Lançamento gerado com sucesso!');
    else toast.info('Nada vencido para lançar ainda.');
  } catch {
    toast.error('Erro ao lançar agora.');
  } finally {
    runningId.value = null;
  }
};

const handleToggleStatus = async (item: RecurringTransactionDto) => {
  const nextStatus = item.status === 'active' ? 'paused' : 'active';
  try {
    await store.updateRecurringTransaction(item.id, { status: nextStatus });
    toast.success(nextStatus === 'paused' ? 'Lançamento pausado.' : 'Lançamento retomado.');
  } catch {
    toast.error('Erro ao atualizar status.');
  }
};

const handleDelete = async (item: RecurringTransactionDto) => {
  const confirmed = await confirm({
    title: 'Remover lançamento recorrente?',
    message: `"${item.description || 'Lançamento recorrente'}" deixará de ser lançado. Transações já geradas continuam no histórico.`,
    confirmLabel: 'Remover',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    await store.deleteRecurringTransaction(item.id);
    toast.success('Lançamento recorrente removido.');
  } catch {
    toast.error('Erro ao remover lançamento recorrente.');
  }
};

onMounted(() => {
  store.fetchRecurringTransactions();
});
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <PageHeader
        back
        eyebrow="Gerenciamento"
        title="Lançamentos recorrentes"
        description="Despesas e receitas fixas da empresa. Quando a data chega, a transação é lançada automaticamente."
      >
        <template #actions>
          <BaseButton @click="showForm = true">
            <Plus :size="18" />
            Novo lançamento
          </BaseButton>
        </template>
      </PageHeader>

      <section class="summary-grid" aria-label="Resumo">
        <div v-for="stat in summary" :key="stat.label" class="summary-tile">
          <div>
            <p class="summary-label">{{ stat.label }}</p>
            <p class="summary-value tabular">{{ stat.value }}</p>
          </div>
        </div>
      </section>

      <div class="list-toolbar">
        <div class="segmented" role="tablist" aria-label="Filtrar por tipo">
          <button
            v-for="option in filters"
            :key="option.value"
            type="button"
            role="tab"
            class="segmented-item"
            :aria-selected="filter === option.value"
            :class="{ 'is-active': filter === option.value }"
            @click="filter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <span class="list-count">{{ sortedItems.length }} lançamento(s)</span>
      </div>

      <div v-if="store.loading && store.items.length === 0" class="recurring-list">
        <span v-for="n in 3" :key="n" class="skeleton" style="height: 128px; border-radius: var(--radius-lg)" />
      </div>

      <div v-else-if="sortedItems.length === 0" class="empty-state">
        <Repeat :size="28" />
        <strong>Nenhum lançamento recorrente {{ filter === 'all' ? 'ainda' : 'neste filtro' }}</strong>
        <span>Cadastre aluguel, salários ou assinaturas para lançá-los automaticamente.</span>
        <BaseButton v-if="filter === 'all'" size="sm" class="empty-action" @click="showForm = true">
          <Plus :size="15" />
          Criar o primeiro
        </BaseButton>
      </div>

      <div v-else class="recurring-list">
        <RecurringItem
          v-for="item in sortedItems"
          :key="item.id"
          :item="item"
          :running="runningId === item.id"
          @run-now="handleRunNow(item)"
          @toggle-status="handleToggleStatus(item)"
          @delete="handleDelete(item)"
        />
      </div>
    </div>

    <RecurringFormModal v-model:open="showForm" />
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.summary-tile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
}

.summary-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.summary-value {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.list-count {
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}

.recurring-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.empty-state strong {
  color: var(--color-text);
  font-size: var(--text-base);
}

.empty-action {
  margin-top: var(--space-3);
}
</style>
