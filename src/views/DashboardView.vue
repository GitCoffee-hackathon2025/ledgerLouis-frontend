<template>
  <main class="dashboard-page">
    <div class="dashboard-shell">
      <!-- Cabeçalho de Relatórios -->
      <DashboardHeader @export="handleExport" />

      <!-- Filtro por Tag (se houver tags) -->
      <TagFilterChips />

      <!-- Bloco de Indicadores com Hierarquia Financeira Real -->
      <section class="financial-summary-surface" aria-label="Resumo e Saldo">
        <!-- Indicador Dominante: Saldo Total Global -->
        <div class="primary-balance-tile">
          <span class="balance-kicker">Saldo total da conta (global)</span>
          <div class="balance-value" :class="accountValue >= 0 ? 'positive' : 'negative'">
            {{ formattedAccountValue }}
          </div>
          <span class="balance-meta">Disponível consolidado na conta bancária (não sofre filtros)</span>
        </div>

        <!-- Indicadores de Apoio do Recorte Filtrado -->
        <div class="secondary-metrics-grid">
          <div class="metric-item">
            <span class="metric-label">Entradas no filtro</span>
            <strong class="metric-val text-income">+ {{ formattedIncome }}</strong>
            <span class="metric-footnote">
              {{ activeTagName ? `Filtro ativo: ${activeTagName}` : 'Todas as entradas registradas' }}
            </span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Saídas no filtro</span>
            <strong class="metric-val text-expense">- {{ formattedExpense }}</strong>
            <span class="metric-footnote">
              {{ activeTagName ? `Filtro ativo: ${activeTagName}` : 'Todas as saídas registradas' }}
            </span>
          </div>

          <div class="metric-item">
            <span class="metric-label">Resultado no filtro</span>
            <strong
              class="metric-val"
              :class="netTotal >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ netTotal >= 0 ? '+ ' : '- ' }}{{ formattedNetTotal }}
            </strong>
            <span class="metric-footnote">
              {{ transactionCount }} {{ transactionCount === 1 ? 'lançamento computado' : 'lançamentos computados' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Gráficos Principais: Movimentação (8 cols) + Tags Ranking (4 cols) -->
      <section class="charts-section" aria-label="Gráficos de movimentação e categorias">
        <div class="chart-col-main">
          <RevenueChart :transactions="filteredTransactions" />
        </div>
        <div class="chart-col-side">
          <TagsDistributionCard :transactions="filteredTransactions" />
        </div>
      </section>

      <!-- Análise Estatística e Previsão Baseada em Dados Históricos -->
      <section class="insights-section" aria-label="Estatísticas e previsões">
        <ExpenseInsightsCard />
      </section>

      <!-- Lista de Transações Recentes -->
      <section class="transactions-section" aria-label="Últimas movimentações">
        <RecentTransactions :transactions="filteredTransactions" />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import DashboardHeader from '@/components/dashboard/DashboardHeader.vue';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import RevenueChart from '@/components/dashboard/RevenueChart.vue';
import TagFilterChips from '@/components/dashboard/TagFilterChips.vue';
import TagsDistributionCard from '@/components/dashboard/TagsDistributionCard.vue';
import ExpenseInsightsCard from '@/components/dashboard/ExpenseInsightsCard.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useTagStore } from '@/stores/tagStore';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/utils/exportTransactions';

const transactionStore = useTransactionStore();
const companyStore = useCompanyStore();
const tagStore = useTagStore();

onMounted(async () => {
  if (companyStore.company.hasCompany) {
    await transactionStore.fetchTransactions();
    await transactionStore.fetchAccountValue();
  }
});

const accountValue = computed(() => transactionStore.accountValue);

const activeTagName = computed(
  () => tagStore.tags.find((tag) => tag.id === tagStore.activeTagId)?.name,
);

const filteredTransactions = computed(() => {
  const activeTagId = tagStore.activeTagId;
  if (!activeTagId) return transactionStore.transactions;

  return transactionStore.transactions.filter((transaction) =>
    tagStore.transactionHasTag(transaction.id, activeTagId),
  );
});

const formattedAccountValue = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(accountValue.value);
});

const income = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.entryType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
});

const expense = computed(() => {
  return filteredTransactions.value
    .filter((t) => t.entryType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
});

const netTotal = computed(() => income.value - expense.value);

const formattedIncome = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income.value),
);

const formattedExpense = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expense.value),
);

const formattedNetTotal = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(netTotal.value)),
);

const transactionCount = computed(() => filteredTransactions.value.length);

const handleExport = (format: 'csv' | 'pdf') => {
  if (format === 'csv') {
    exportTransactionsCsv(filteredTransactions.value, tagStore.transactionTagsMap);
  } else {
    exportTransactionsPdf(
      filteredTransactions.value,
      tagStore.transactionTagsMap,
      companyStore.company.name,
    );
  }
};
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 80px);
  padding: 32px 20px 64px;
  background: var(--color-bg);
}

.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1240px;
  margin: 0 auto;
}

/* Superfície de Resumo Financeiro Hierárquico */
.financial-summary-surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px 32px;
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 36px;
  align-items: center;
}

.primary-balance-tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 28px;
  border-right: 1px solid var(--color-border);
}

.balance-kicker {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.balance-value {
  font-family: var(--font-display);
  font-size: clamp(32px, 3.5vw, 42px);
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  margin: 4px 0;
}

.balance-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.secondary-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.metric-val {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.text-income {
  color: var(--color-success-dark, #065F46);
}

[data-theme='dark'] .text-income {
  color: #6EE7B7;
}

.text-expense {
  color: var(--color-danger, #E52124);
}

[data-theme='dark'] .text-expense {
  color: #FF6B6D;
}

.metric-footnote {
  font-size: 11px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

/* Grid de Gráficos: Movimentação (8 cols) + Tags (4 cols) */
.charts-section {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: stretch;
}

.chart-col-main,
.chart-col-side {
  display: flex;
  flex-direction: column;
}

.insights-section,
.transactions-section {
  display: flex;
  flex-direction: column;
}

@media (max-width: 960px) {
  .financial-summary-surface {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }

  .primary-balance-tile {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-right: 0;
    padding-bottom: 20px;
  }

  .secondary-metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
