<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TransactionService from '@/services/transactionService';
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
const accountValue = ref<number | null>(null);
const accountValueLoading = ref(false);
const accountValueError = ref<string | null>(null);

const fetchAccountBalance = async () => {
  accountValueLoading.value = true;
  accountValueError.value = null;
  try {
    const service = new TransactionService();
    const val = await service.getAccountValue();
    accountValue.value = typeof val === 'number' && !isNaN(val) ? val : null;
    if (accountValue.value !== null) {
      transactionStore.setAccountValue(accountValue.value);
    }
  } catch (err) {
    accountValueError.value = 'Não foi possível consultar o saldo da conta.';
    accountValue.value = null;
  } finally {
    accountValueLoading.value = false;
  }
};

const retryTransactions = async () => {
  await transactionStore.fetchTransactions();
};

const retryRanking = async () => {
  const tasks: Promise<unknown>[] = [];
  if (transactionStore.error) {
    tasks.push(transactionStore.fetchTransactions());
  }
  if (tagStore.error || tagStore.tags.length === 0) {
    tasks.push(tagStore.fetchTags());
  }
  if (tasks.length === 0) {
    tasks.push(transactionStore.fetchTransactions(), tagStore.fetchTags());
  }
  await Promise.allSettled(tasks);
};

const loadData = async () => {
  if (!companyStore.company.hasCompany) {
    return;
  }
  await Promise.allSettled([
    transactionStore.fetchTransactions(),
    fetchAccountBalance(),
    recurringStore.fetchRecurringTransactions(),
    tagStore.fetchTags(),
  ]);
};

onMounted(loadData);

// Filtro inicial por tag
const tagFilteredTransactions = computed(() => {
  const activeTagId = tagStore.activeTagId;
  if (!activeTagId) return transactionStore.transactions;
  return transactionStore.transactions.filter((t) =>
    tagStore.transactionHasTag(t.id, activeTagId),
  );
});

// Filtro secundário por período de calendário (com limites inferior e superior)
const periodTransactions = computed(() => {
  const list = tagFilteredTransactions.value;
  const today = todayISO();
  const [currentYear, currentMonth, currentDay] = today.split('-').map(Number) as [number, number, number];

  let fromDate = '';

  if (selectedPeriod.value === 'daily') {
    // 7 dias de calendário: hoje e os 6 dias anteriores (offset 6)
    const d = new Date(currentYear, currentMonth - 1, currentDay - 6);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (selectedPeriod.value === 'weekly') {
    // 4 semanas (28 dias de calendário): hoje e os 27 dias anteriores (offset 27)
    const d = new Date(currentYear, currentMonth - 1, currentDay - 27);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (selectedPeriod.value === 'monthly') {
    // 6 meses de calendário: mês atual e os 5 meses anteriores
    const d = new Date(currentYear, currentMonth - 1 - 5, 1);
    fromDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  } else if (selectedPeriod.value === 'annual') {
    // 5 anos de calendário: ano atual e os 4 anos anteriores
    fromDate = `${currentYear - 4}-01-01`;
  }

  return list.filter((t) => {
    const d = t.date.slice(0, 10);
    // Limite superior estrito: nunca inclui datas futuras
    if (d > today) return false;
    // Limite inferior estrito
    if (fromDate && d < fromDate) return false;
    return true;
  });
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
      :account-value-loading="accountValueLoading"
      :account-value-error="accountValueError"
      :loading="transactionStore.loading"
      :error="transactionStore.error"
      :period-label="periodLabels[selectedPeriod] || selectedPeriod"
      @retry="retryTransactions"
      @retry-balance="fetchAccountBalance"
    />

    <!-- Grid 1: Entradas e saídas por período (7) + Valores por tag (5) -->
    <div class="lg-grid">
      <div class="lg-span-7">
        <RevenueChart
          :transactions="periodTransactions"
          :period="selectedPeriod"
          :period-label="periodLabels[selectedPeriod] || selectedPeriod"
          :loading="transactionStore.loading"
          :error="transactionStore.error"
          @retry="retryTransactions"
        />
      </div>
      <div class="lg-span-5">
        <TagsDistributionCard
          :transactions="periodTransactions"
          :loading="transactionStore.loading || tagStore.loading"
          :error="transactionStore.error || tagStore.error"
          @retry="retryRanking"
        />
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

    <!-- Atividade Recente (mesmo recorte do período) -->
    <RecentTransactions
      :transactions="periodTransactions"
      :loading="transactionStore.loading"
      :error="transactionStore.error"
      @retry="retryTransactions"
    />
  </main>
</template>
