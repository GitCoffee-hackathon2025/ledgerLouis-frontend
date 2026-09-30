<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ReceiptText, Search } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import ExportMenu from '@/components/ui/ExportMenu.vue';
import TransactionItem from '@/components/dashboard/TransactionItem.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useTagStore } from '@/stores/tagStore';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/utils/exportTransactions';
import { formatCurrency } from '@/utils/format';

const transactionStore = useTransactionStore();
const companyStore = useCompanyStore();
const tagStore = useTagStore();

const search = ref('');
const typeFilter = ref<'all' | 'credit' | 'debit'>('all');

const filters = [
  { value: 'all', label: 'Todas' },
  { value: 'credit', label: 'Entradas' },
  { value: 'debit', label: 'Saídas' },
] as const;

onMounted(async () => {
  if (transactionStore.transactions.length === 0) {
    await transactionStore.fetchTransactions();
  }
});

const filteredTransactions = computed(() => {
  const term = search.value.trim().toLowerCase();

  return transactionStore.transactions
    .filter((t) => typeFilter.value === 'all' || t.entryType === typeFilter.value)
    .filter((t) => !term || t.description.toLowerCase().includes(term))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const netTotal = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + (t.entryType === 'credit' ? t.amount : -t.amount), 0),
);

const handleExport = (format: 'csv' | 'pdf') => {
  if (format === 'csv') {
    exportTransactionsCsv(filteredTransactions.value, tagStore.transactionTagsMap);
  } else {
    exportTransactionsPdf(filteredTransactions.value, tagStore.transactionTagsMap, companyStore.company.name);
  }
};
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <PageHeader
        back
        eyebrow="Histórico completo"
        title="Transações"
        description="Consulte, filtre e exporte todas as movimentações registradas."
      >
        <template #actions>
          <ExportMenu @export="handleExport" />
        </template>
      </PageHeader>

      <div class="toolbar">
        <label class="search">
          <Search :size="17" />
          <span class="sr-only">Buscar</span>
          <input v-model="search" type="search" class="input" placeholder="Buscar por descrição..." />
        </label>

        <div class="segmented" role="tablist" aria-label="Filtrar por tipo">
          <button
            v-for="option in filters"
            :key="option.value"
            type="button"
            role="tab"
            class="segmented-item"
            :aria-selected="typeFilter === option.value"
            :class="{ 'is-active': typeFilter === option.value }"
            @click="typeFilter = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <section class="card">
        <header class="list-summary">
          <span>{{ filteredTransactions.length }} transação(ões)</span>
          <span>
            Saldo do filtro:
            <strong class="tabular" :class="netTotal >= 0 ? 'text-income' : 'text-expense'">
              {{ formatCurrency(netTotal) }}
            </strong>
          </span>
        </header>

        <div v-if="filteredTransactions.length === 0" class="empty-state">
          <ReceiptText :size="26" />
          Nenhuma transação encontrada com esses filtros.
        </div>

        <ul v-else class="list-divided">
          <TransactionItem
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            :transaction="transaction"
            with-year
          />
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.search {
  position: relative;
  flex: 1 1 240px;
  display: flex;
  align-items: center;
}

.search svg {
  position: absolute;
  left: 14px;
  color: var(--color-text-subtle);
  pointer-events: none;
}

.search .input {
  padding-left: 42px;
  border-radius: var(--radius-full);
}

.list-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-1);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
