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
const isLoading = ref(true);
const loadError = ref<string | null>(null);

const loadData = async () => {
  if (!companyStore.company.hasCompany) {
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  loadError.value = null;
  try {
    await Promise.all([
      transactionStore.fetchTransactions(),
      transactionStore.fetchAccountValue(),
      recurringStore.fetchRecurringTransactions(),
      tagStore.fetchTags(),
    ]);
  } catch (err) {
    console.error('Erro ao carregar relatórios:', err);
    loadError.value = 'Não foi possível carregar os dados financeiros.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

const accountValue = computed(() => transactionStore.accountValue);

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

    <!-- Estado de Erro -->
    <div v-if="loadError" class="lg-section" role="alert" style="border-color: var(--lg-expense);">
      <div class="lg-section-head">
        <div>
          <h2 class="lg-h2 is-expense">Falha ao carregar relatórios</h2>
          <p class="lg-note">{{ loadError }}</p>
        </div>
        <button type="button" class="lg-btn lg-btn--primary" @click="loadData">
          Tentar novamente
        </button>
      </div>
    </div>

    <!-- Estado de Carregamento -->
    <div v-else-if="isLoading" class="lg-section">
      <div class="lg-empty">Carregando dados financeiros e relatórios...</div>
    </div>

    <!-- Conteúdo Principal -->
    <template v-else>
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
          <RevenueChart
            :transactions="periodTransactions"
            :period="selectedPeriod"
            :period-label="periodLabels[selectedPeriod] || selectedPeriod"
          />
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

      <!-- Atividade Recente (mesmo recorte do período) -->
      <RecentTransactions :transactions="periodTransactions" />
    </template>
  </main>
</template>
