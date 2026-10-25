<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, Download } from 'lucide-vue-next';
import TransactionItem from '@/components/dashboard/TransactionItem.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useTagStore } from '@/stores/tagStore';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/utils/exportTransactions';
import { toLocalMidnight, formatDateBr } from '@/utils/dateUtils';

const router = useRouter();
const transactionStore = useTransactionStore();
const companyStore = useCompanyStore();
const tagStore = useTagStore();

const search = ref('');
const typeFilter = ref<'all' | 'credit' | 'debit'>('all');
const exportMenuOpen = ref(false);

onMounted(async () => {
  if (!companyStore.company.hasCompany) {
    router.replace({ name: 'company' });
    return;
  }

  if (transactionStore.transactions.length === 0) {
    await transactionStore.fetchTransactions();
  }
});

const filteredTransactions = computed(() => {
  const term = search.value.trim().toLowerCase();

  return [...transactionStore.transactions]
    .filter((transaction) => (typeFilter.value === 'all' ? true : transaction.entryType === typeFilter.value))
    .filter((transaction) => (term ? transaction.description.toLowerCase().includes(term) : true))
    .sort((a, b) => b.date.localeCompare(a.date));
});

const formattedAmount = (transaction: { amount: number; entryType: string }) => {
  const value = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(transaction.amount);

  return transaction.entryType === 'credit' ? `+ ${value}` : `- ${value}`;
};

const formattedDate = (dateString: string) => {
  const txLocal = toLocalMidnight(dateString);
  if (!txLocal) return dateString;
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffDays = Math.floor((todayLocal.getTime() - txLocal.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return formatDateBr(dateString);
};

const handleExport = (format: 'csv' | 'pdf') => {
  exportMenuOpen.value = false;
  if (format === 'csv') {
    exportTransactionsCsv(filteredTransactions.value, tagStore.transactionTagsMap);
  } else {
    exportTransactionsPdf(filteredTransactions.value, tagStore.transactionTagsMap, companyStore.company.name);
  }
};
</script>

<template>
  <main class="transactions-page">
    <div class="transactions-shell">
      <header class="transactions-page-header">
        <button class="back-button" type="button" @click="router.back()">
          <ArrowLeft :size="18" />
          Voltar
        </button>

        <div>
          <p class="eyebrow">Histórico completo</p>
          <h1>Todas as transações</h1>
          <p class="subtitle">Consulte, filtre e exporte todas as movimentações registradas.</p>
        </div>

        <div class="export-menu">
          <button class="export-toggle" type="button" @click="exportMenuOpen = !exportMenuOpen">
            <Download :size="18" />
            Exportar
          </button>

          <div v-if="exportMenuOpen" class="export-dropdown">
            <button type="button" @click="handleExport('csv')">Exportar CSV</button>
            <button type="button" @click="handleExport('pdf')">Exportar PDF</button>
          </div>
        </div>
      </header>

      <div class="filters-bar">
        <input v-model="search" type="search" placeholder="Buscar por descrição..." class="search-input" />

        <div class="type-filters">
          <button
            type="button"
            :class="{ active: typeFilter === 'all' }"
            @click="typeFilter = 'all'"
          >
            Todas
          </button>
          <button
            type="button"
            :class="{ active: typeFilter === 'credit' }"
            @click="typeFilter = 'credit'"
          >
            Entradas
          </button>
          <button
            type="button"
            :class="{ active: typeFilter === 'debit' }"
            @click="typeFilter = 'debit'"
          >
            Saídas
          </button>
        </div>
      </div>

      <section class="transactions-card">
        <div v-if="filteredTransactions.length === 0" class="empty-state">
          Nenhuma transação encontrada com esses filtros.
        </div>

        <ul v-else class="transactions-list">
          <TransactionItem
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            :title="transaction.description"
            :subtitle="transaction.entryType === 'credit' ? 'Entrada' : 'Saída'"
            :amount="formattedAmount(transaction)"
            :date="formattedDate(transaction.date)"
            :kind="transaction.entryType === 'credit' ? 'income' : 'expense'"
          />
        </ul>
      </section>
    </div>
  </main>
</template>

<style scoped>
.transactions-page {
  min-height: calc(100vh - 165px);
  padding: 20px 16px 32px;
  background: var(--color-bg);
}

.transactions-shell {
  max-width: 900px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}

.transactions-page-header {
  display: grid;
  gap: 14px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-surface);
  position: relative;
}

.back-button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.eyebrow {
  color: var(--color-success-dark);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  color: var(--color-text);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.export-menu {
  justify-self: start;
  position: relative;
}

.export-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-weight: 700;
  cursor: pointer;
}

.export-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  display: grid;
  min-width: 160px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
}

.export-dropdown button {
  border: none;
  background: transparent;
  color: var(--color-text);
  text-align: left;
  padding: 9px 10px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.export-dropdown button:hover {
  background: var(--color-surface-soft);
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.search-input {
  flex: 1;
  min-width: 200px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
}

.type-filters {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
}

.type-filters button {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.type-filters button.active {
  background: var(--color-success-gradient);
  color: white;
}

.transactions-card {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.empty-state {
  padding: 32px 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.transactions-list {
  display: grid;
}

@media (min-width: 768px) {
  .transactions-card {
    padding: 24px;
  }

  .transactions-page-header {
    padding: 28px 30px;
  }
}
</style>
