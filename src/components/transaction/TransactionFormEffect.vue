<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { useChartTheme, brl } from '@/utils/chartTheme';
import { occurrencesBetween, projectRecurring, todayISO } from '@/utils/recurrence';
import { formatDateBr } from '@/utils/dateUtils';

const props = defineProps<{
  entryType: 'debit' | 'credit';
  amount: number | null;
  isRecurring: boolean;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  currentBalance: number;
}>();

const chartTheme = useChartTheme();

// 1. Efeito para Lançamento Único
const safeAmount = computed(() => props.amount || 0);

const projectedBalance = computed(() => {
  if (props.entryType === 'credit') {
    return props.currentBalance + safeAmount.value;
  }
  return props.currentBalance - safeAmount.value;
});

// Proporções para barra comparativa
const barMax = computed(() =>
  Math.max(Math.abs(props.currentBalance), Math.abs(projectedBalance.value), 1),
);

const currentBarWidth = computed(() =>
  `${Math.min(100, Math.round((Math.abs(props.currentBalance) / barMax.value) * 100))}%`,
);

const projectedBarWidth = computed(() =>
  `${Math.min(100, Math.round((Math.abs(projectedBalance.value) / barMax.value) * 100))}%`,
);

// 2. Efeito para Lançamento Recorrente
const nextDates = computed(() => {
  if (!props.isRecurring || !props.startDate) return [];
  const today = todayISO();
  const from = props.startDate > today ? props.startDate : today;
  return occurrencesBetween(
    {
      startDate: props.startDate,
      endDate: props.endDate || null,
      frequency: props.frequency,
      intervalValue: 1,
    },
    from,
    '2099-12-31',
  ).slice(0, 6);
});

// Projeção em 12 meses para esta regra
const mockRule = computed(() => ({
  id: 'temp',
  companyId: 'temp',
  description: 'Simulação',
  amount: safeAmount.value,
  entryType: props.entryType,
  frequency: props.frequency,
  intervalValue: 1,
  status: 'active' as const,
  startDate: props.startDate || todayISO(),
  endDate: props.endDate || null,
  nextRunDate: props.startDate || todayISO(),
  lastRunDate: null,
  createdAt: todayISO(),
  updatedAt: todayISO(),
}));

const projectionBuckets = computed(() => {
  if (!props.isRecurring || safeAmount.value <= 0) return [];
  return projectRecurring([mockRule.value], 12);
});

// Total acumulado mês a mês nos 12 meses
const accumulatedData = computed(() => {
  let running = 0;
  return projectionBuckets.value.map((b) => {
    running += props.entryType === 'credit' ? b.credit : b.debit;
    return running;
  });
});

const total12Months = computed(() => {
  if (accumulatedData.value.length === 0) return 0;
  return accumulatedData.value[accumulatedData.value.length - 1] ?? 0;
});

const chartSeries = computed(() => [
  {
    name: props.entryType === 'credit' ? 'Receita acumulada' : 'Despesa acumulada',
    data: accumulatedData.value,
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const theme = chartTheme.value;
  const isIncome = props.entryType === 'credit';
  const color = isIncome ? theme.colors.income : theme.colors.expense;

  return {
    ...theme.base,
    chart: {
      ...theme.base.chart,
      type: 'area',
    },
    colors: [color],
    stroke: {
      curve: 'straight',
      width: 2,
    },
    fill: {
      type: 'solid',
      opacity: 0.1,
    },
    xaxis: {
      ...theme.base.xaxis,
      categories: projectionBuckets.value.map((b) => b.label),
    },
  };
});
</script>

<template>
  <aside class="lg-section effect-panel" aria-label="Efeito financeiro previsto">
    <header class="lg-section-head">
      <div>
        <h2 class="lg-h2">Efeito no caixa</h2>
        <p class="lg-note">
          {{ isRecurring ? 'Datas de execução e valor acumulado em 12 meses.' : 'Saldo hoje e projeção após o lançamento.' }}
        </p>
      </div>
    </header>

    <!-- Cenário A: Lançamento Único -->
    <div v-if="!isRecurring" class="single-effect-content">
      <div class="lg-figures">
        <div class="lg-figure">
          <span class="lg-figure-label">Saldo atual em conta</span>
          <span class="lg-figure-value">
            <MoneyValue :value="currentBalance" />
          </span>
        </div>

        <div class="lg-figure">
          <span class="lg-figure-label">Saldo após este lançamento</span>
          <span
            class="lg-figure-value"
            :class="projectedBalance >= 0 ? 'is-income' : 'is-expense'"
          >
            <MoneyValue :value="projectedBalance" />
          </span>
        </div>
      </div>

      <!-- Barra Comparativa Neutra -->
      <div class="balance-bars-wrapper" aria-hidden="true">
        <div class="bar-line">
          <span class="bar-label">Hoje</span>
          <div class="bar-track">
            <div class="bar-fill current" :style="{ width: currentBarWidth }"></div>
          </div>
        </div>

        <div class="bar-line">
          <span class="bar-label">Depois</span>
          <div class="bar-track">
            <div
              class="bar-fill projected"
              :class="entryType === 'credit' ? 'is-income' : 'is-expense'"
              :style="{ width: projectedBarWidth }"
            ></div>
          </div>
        </div>
      </div>

      <p class="lg-note effect-explanation">
        O valor de
        <strong :class="entryType === 'credit' ? 'is-income' : 'is-expense'">
          <MoneyValue :value="entryType === 'credit' ? safeAmount : -safeAmount" :signed="true" />
        </strong>
        será incorporado imediatamente ao saldo bancário da empresa após a gravação.
      </p>
    </div>

    <!-- Cenário B: Lançamento Recorrente -->
    <div v-else class="recurring-effect-content">
      <!-- Próximas 6 datas -->
      <div class="upcoming-dates-block">
        <h3 class="upcoming-title">Próximas 6 execuções</h3>

        <div v-if="nextDates.length === 0" class="lg-empty" style="padding: 12px 0;">
          Defina a data de início para visualizar o calendário.
        </div>

        <ul v-else class="upcoming-list" role="list">
          <li v-for="d in nextDates" :key="d" class="upcoming-item">
            <span class="upcoming-date">{{ formatDateBr(d) }}</span>
            <span class="upcoming-amount" :class="entryType === 'credit' ? 'is-income' : 'is-expense'">
              <MoneyValue :value="entryType === 'credit' ? safeAmount : -safeAmount" :signed="true" />
            </span>
          </li>
        </ul>
      </div>

      <!-- Gráfico de área do total acumulado em 12 meses -->
      <div v-if="safeAmount > 0" class="chart-block">
        <header class="chart-block-head">
          <h3 class="upcoming-title">Acumulado projetado em 12 meses</h3>
          <div class="lg-legend">
            <span :class="entryType === 'credit' ? 'is-income' : 'is-expense'">
              Total: {{ brl(total12Months) }}
            </span>
          </div>
        </header>

        <div class="lg-chart" style="min-height: 200px;">
          <apexchart
            type="area"
            height="200"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.effect-panel {
  position: sticky;
  top: 24px;
}

.single-effect-content,
.recurring-effect-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.balance-bars-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--lg-sunken);
  border-radius: var(--lg-radius-sm);
  border: 1px solid var(--lg-line);
}

.bar-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  font-size: 0.8125rem;
  color: var(--lg-ink-3);
  min-width: 48px;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: var(--lg-line);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.bar-fill.current {
  background: var(--lg-ink-3);
}

.bar-fill.projected.is-income {
  background: var(--lg-income);
}

.bar-fill.projected.is-expense {
  background: var(--lg-expense);
}

.effect-explanation {
  margin-top: 4px;
  line-height: 1.5;
}

.upcoming-dates-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upcoming-title {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lg-ink-2);
}

.upcoming-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upcoming-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--lg-sunken);
  border: 1px solid var(--lg-line);
  border-radius: var(--lg-radius-sm);
  font-size: 0.8125rem;
}

.upcoming-date {
  color: var(--lg-ink-2);
  font-weight: 500;
}

.upcoming-amount {
  font-weight: 600;
}

.chart-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--lg-line);
}

.chart-block-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
</style>
