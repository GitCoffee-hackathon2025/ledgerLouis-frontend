<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue';
import TagFilterChips from '@/components/dashboard/TagFilterChips.vue';
import DashboardHeroCard from '@/components/dashboard/DashboardHeroCard.vue';
import RevenueChart from '@/components/dashboard/RevenueChart.vue';
import TagsDistributionCard from '@/components/dashboard/TagsDistributionCard.vue';
import RecurringProjectionCard from '@/components/dashboard/RecurringProjectionCard.vue';
import ExpenseInsightsCard from '@/components/dashboard/ExpenseInsightsCard.vue';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useTagStore } from '@/stores/tagStore';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { exportTransactionsCsv, exportTransactionsPdf } from '@/utils/exportTransactions';
import { todayISO } from '@/utils/recurrence';

const transactionStore = useTransactionStore();
const companyStore = useCompanyStore();
const tagStore = useTagStore();
const recurringStore = useRecurringTransactionStore();

const selectedPeriod = ref('monthly');

onMounted(async () => {
  if (companyStore.company.hasCompany) {
    await Promise.all([
      transactionStore.fetchTransactions(),
      transactionStore.fetchAccountValue(),
      recurringStore.fetchRecurringTransactions(),
      tagStore.fetchTags(),
    ]);
  }
});

const accountValue = computed(() => transactionStore.accountValue);

// Filtro inicial por tag
const tagFilteredTransactions = computed(() => {
  const activeTagId = tagStore.activeTagId;
  if (!activeTagId) return transactionStore.transactions;
  return transactionStore.transactions.filter((t) =>
    tagStore.transactionHasTag(t.id, activeTagId),
  );
});

// Filtro secundário por período de calendário
const periodTransactions = computed(() => {
  const list = tagFilteredTransactions.value;
  if (selectedPeriod.value === 'all') return list;

  const today = todayISO();
  const [currentYear, currentMonth, currentDay] = today.split('-').map(Number) as [number, number, number];

  let fromDate = '';

  if (selectedPeriod.value === 'daily') {
    // Últimos 7 dias
    const d = new Date(currentYear, currentMonth - 1, currentDay - 7);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (selectedPeriod.value === 'weekly') {
    // Últimas 4 semanas (28 dias)
    const d = new Date(currentYear, currentMonth - 1, currentDay - 28);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (selectedPeriod.value === 'monthly') {
    // Últimos 6 meses
    const d = new Date(currentYear, currentMonth - 1 - 6, 1);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  } else if (selectedPeriod.value === 'annual') {
    // Últimos 5 anos
    fromDate = `${currentYear - 5}-01-01`;
  }

  if (!fromDate) return list;
  return list.filter((t) => t.date.slice(0, 10) >= fromDate);
});

const periodLabels: Record<string, string> = {
  daily: 'últimos 7 dias',
  weekly: 'últimas 4 semanas',
  monthly: 'últimos 6 meses',
  annual: 'últimos 5 anos',
  all: 'todo o histórico',
};

const handleExport = (format: 'csv' | 'pdf') => {
  if (format === 'csv') {
    exportTransactionsCsv(periodTransactions.value, tagStore.transactionTagsMap);
  } else {
    exportTransactionsPdf(
      periodTransactions.value,
      tagStore.transactionTagsMap,
      companyStore.company.name,
    );
  }
};
</script>

<template>
  <main class="lg-page">
    <!-- Cabeçalho -->
    <DashboardHeader
      v-model:period="selectedPeriod"
      @export="handleExport"
    />

    <!-- Linha discreta de tags -->
    <TagFilterChips />

    <!-- Hero: Saldo Acumulado -->
    <DashboardHeroCard
      :transactions="periodTransactions"
      :account-value="accountValue"
      :period-label="periodLabels[selectedPeriod] || selectedPeriod"
    />

    <!-- Grid 1: Entradas e saídas por mês (7) + Para onde vai o dinheiro (5) -->
    <div class="lg-grid">
      <div class="lg-span-7">
        <RevenueChart :transactions="periodTransactions" />
      </div>
      <div class="lg-span-5">
        <TagsDistributionCard :transactions="periodTransactions" />
      </div>
    </div>

    <!-- Grid 2: Compromissos recorrentes (7) + Variação e previsão (5) -->
    <div class="lg-grid">
      <div class="lg-span-7">
        <RecurringProjectionCard />
      </div>
      <div class="lg-span-5">
        <ExpenseInsightsCard />
      </div>
    </div>

    <!-- Atividade Recente -->
    <RecentTransactions :transactions="tagFilteredTransactions" />
  </main>
</template>
