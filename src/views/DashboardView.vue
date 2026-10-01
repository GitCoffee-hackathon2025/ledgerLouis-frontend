<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowDownToLine, ArrowUpFromLine, Plus, ReceiptText } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ExportMenu from '@/components/ui/ExportMenu.vue';
import BalanceHero from '@/components/dashboard/BalanceHero.vue';
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
import { useGsapScope } from '@/composables/useGsapScope';
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

const monthLabels = computed(() =>
  monthKeys.value.map((key) => {
    const [year, month] = key.split('-').map(Number);
    return new Date(year!, month! - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }),
);

const monthsNet = computed(() => monthly.value.map((m, i) => ({ label: monthLabels.value[i]!, net: m.income - m.expense })));

// Entrada em cascata dos blocos: o olhar desce do saldo para o detalhe.
const root = ref<HTMLElement>();
useGsapScope(root, ({ gsap }) => {
  gsap.from('.stage', { opacity: 0, y: 22, duration: 0.8, stagger: 0.09, ease: 'power3.out', clearProps: 'all' });
});

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
  <div ref="root" class="page">
    <div class="page-shell">
      <PageHeader
        class="stage"
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

      <TagFilterChips class="stage" />

      <section class="overview stage" aria-label="Resumo financeiro">
        <BalanceHero
          :balance="accountValue"
          :income="current.income"
          :expense="current.expense"
          :months="monthsNet"
        />

        <div class="metric-stack card list-divided">
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
        </div>
      </section>

      <section class="charts-grid stage" aria-label="Gráficos financeiros">
        <RevenueChart :transactions="filteredTransactions" />
        <TagsDistributionCard :transactions="filteredTransactions" />
      </section>

      <ExpenseInsightsCard class="stage" />

      <RecentTransactions class="stage" :transactions="filteredTransactions" />
    </div>
  </div>
</template>

<style scoped>
.overview,
.charts-grid {
  display: grid;
  gap: var(--space-4);
}

/* Metricas empilhadas em um unico painel: lidas como um bloco, divididas por filetes. */
.metric-stack {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
}

.metric-stack > :deep(*) {
  flex: 1;
}

.metric-stack > :deep(* + *) {
  border-top: 1px solid var(--color-border);
}

@media (min-width: 1100px) {
  .overview {
    grid-template-columns: minmax(0, 1.7fr) minmax(320px, 1fr);
    align-items: stretch;
  }

  .charts-grid {
    grid-template-columns: minmax(0, 1.55fr) minmax(320px, 1fr);
    align-items: stretch;
  }
}
</style>
