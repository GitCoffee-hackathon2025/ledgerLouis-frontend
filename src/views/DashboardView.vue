<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ArrowDownToLine, ArrowUpFromLine, Plus, ReceiptText, WalletMinimal } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ExportMenu from '@/components/ui/ExportMenu.vue';
import DashboardCard from '@/components/dashboard/DashboardCard.vue';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import RevenueChart from '@/components/dashboard/RevenueChart.vue';
import TagFilterChips from '@/components/dashboard/TagFilterChips.vue';
import TagsDistributionCard from '@/components/dashboard/TagsDistributionCard.vue';
import ExpenseInsightsCard from '@/components/dashboard/ExpenseInsightsCard.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useTagStore } from '@/stores/tagStore';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/utils/exportTransactions';
import { formatCurrency } from '@/utils/format';

const SPARKLINE_MONTHS = 6;

const transactionStore = useTransactionStore();
const companyStore = useCompanyStore();
const tagStore = useTagStore();

onMounted(async () => {
  await Promise.all([transactionStore.fetchTransactions(), transactionStore.fetchAccountValue()]);
});

const activeTagName = computed(() => tagStore.tags.find((tag) => tag.id === tagStore.activeTagId)?.name);

const filteredTransactions = computed(() => {
  const activeTagId = tagStore.activeTagId;
  if (!activeTagId) return transactionStore.transactions;
  return transactionStore.transactions.filter((t) => tagStore.transactionHasTag(t.id, activeTagId));
});

// Chaves "YYYY-MM" dos últimos N meses (o último é o mês atual).
const monthKeys = computed(() => {
  const now = new Date();
  return Array.from({ length: SPARKLINE_MONTHS }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (SPARKLINE_MONTHS - 1 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
});

const monthly = computed(() => {
  const buckets = new Map(monthKeys.value.map((key) => [key, { income: 0, expense: 0, count: 0 }]));
  for (const transaction of filteredTransactions.value) {
    const bucket = buckets.get(transaction.date.slice(0, 7));
    if (!bucket) continue;
    bucket.count += 1;
    if (transaction.entryType === 'credit') bucket.income += transaction.amount;
    else bucket.expense += transaction.amount;
  }
  return monthKeys.value.map((key) => buckets.get(key)!);
});

const current = computed(() => monthly.value[monthly.value.length - 1]!);
const previous = computed(() => monthly.value[monthly.value.length - 2]!);

const percentChange = (now: number, before: number) => (before === 0 ? null : ((now - before) / before) * 100);

const accountValue = computed(() => transactionStore.accountValue);

const tagSuffix = computed(() => (activeTagName.value ? ` · ${activeTagName.value}` : ''));

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
    <div class="page-shell">
      <PageHeader
        eyebrow="Relatórios"
        title="Visão geral"
        :description="`Saldo, entradas e saídas de ${companyStore.company.name || 'sua empresa'} em uma leitura rápida.`"
      >
        <template #actions>
          <ExportMenu @export="handleExport" />
          <BaseButton :to="{ name: 'addExpense' }">
            <Plus :size="18" />
            Novo lançamento
          </BaseButton>
        </template>
      </PageHeader>

      <TagFilterChips />

      <section class="metrics-grid" aria-label="Resumo financeiro">
        <DashboardCard
          title="Saldo total"
          :value="formatCurrency(accountValue)"
          :icon="WalletMinimal"
          :tone="accountValue >= 0 ? 'positive' : 'negative'"
          description="Saldo disponível"
          :series="monthly.map((m) => m.income - m.expense)"
        />
        <DashboardCard
          title="Entradas do mês"
          :value="formatCurrency(current.income)"
          :icon="ArrowDownToLine"
          tone="positive"
          :trend="percentChange(current.income, previous.income)"
          :description="`vs mês anterior${tagSuffix}`"
          :series="monthly.map((m) => m.income)"
        />
        <DashboardCard
          title="Saídas do mês"
          :value="formatCurrency(current.expense)"
          :icon="ArrowUpFromLine"
          tone="negative"
          invert-trend
          :trend="percentChange(current.expense, previous.expense)"
          :description="`vs mês anterior${tagSuffix}`"
          :series="monthly.map((m) => m.expense)"
        />
        <DashboardCard
          title="Transações do mês"
          :value="current.count.toString()"
          :icon="ReceiptText"
          :trend="percentChange(current.count, previous.count)"
          :description="`vs mês anterior${tagSuffix}`"
          :series="monthly.map((m) => m.count)"
        />
      </section>

      <section class="charts-grid" aria-label="Gráficos financeiros">
        <RevenueChart :transactions="filteredTransactions" />
        <TagsDistributionCard :transactions="filteredTransactions" />
      </section>

      <ExpenseInsightsCard />

      <RecentTransactions :transactions="filteredTransactions" />
    </div>
  </div>
</template>

<style scoped>
.metrics-grid,
.charts-grid {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .metrics-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .charts-grid {
    grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr);
    align-items: stretch;
  }
}
</style>
