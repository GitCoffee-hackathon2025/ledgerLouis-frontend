<template>
  <section class="chart-card chart-card--revenue" aria-labelledby="revenue-chart-title">
    <header class="chart-header">
      <div>
        <p class="chart-kicker">Recorte do gráfico · {{ periodLabels[selectedPeriod] }}</p>
        <h2 id="revenue-chart-title" class="chart-title">Movimentação financeira</h2>
      </div>

      <div class="chart-controls">
        <label for="period-select-control" class="sr-only">Selecione o período de agregação</label>
        <select id="period-select-control" v-model="selectedPeriod" class="period-select">
          <option value="daily">Últimos 7 dias</option>
          <option value="weekly">Últimas 4 semanas</option>
          <option value="monthly">Últimos 6 meses</option>
          <option value="annual">Últimos 5 anos</option>
        </select>
      </div>
    </header>

    <div class="chart-legend" aria-label="Legendas do gráfico">
      <span class="legend-item">
        <i class="legend-dot legend-dot--income" aria-hidden="true"></i>
        <span>Entradas no período: {{ formatCurrency(periodIncomeTotal) }} ({{ incomePercentage }}%)</span>
      </span>
      <span class="legend-item">
        <i class="legend-dot legend-dot--expense" aria-hidden="true"></i>
        <span>Saídas no período: {{ formatCurrency(periodExpenseTotal) }} ({{ expensePercentage }}%)</span>
      </span>
    </div>

    <p class="chart-summary-text" aria-live="polite">
      {{ chartSummaryText }}
    </p>

    <div class="chart-actions-bar">
      <button
        type="button"
        class="data-table-toggle-btn"
        :aria-expanded="showDataTable"
        aria-controls="revenue-data-table"
        @click="showDataTable = !showDataTable"
      >
        {{ showDataTable ? 'Ocultar tabela de dados' : 'Ver dados do período em tabela' }}
      </button>
    </div>

    <!-- Tabela Acessível com Valores do Período -->
    <div
      v-show="showDataTable"
      id="revenue-data-table"
      class="chart-table-container"
    >
      <table class="chart-table">
        <caption class="sr-only">Valores de entradas e saídas por {{ periodLabels[selectedPeriod] }}</caption>
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th scope="col" class="num-col">Entradas</th>
            <th scope="col" class="num-col">Saídas</th>
            <th scope="col" class="num-col">Saldo</th>
          </tr>
        </thead>
        <tbody v-if="periodTotal > 0">
          <tr v-for="(cat, idx) in periodData.categories" :key="cat">
            <th scope="row">{{ cat }}</th>
            <td class="num-col text-income">{{ formatCurrency(periodData.income[idx] ?? 0) }}</td>
            <td class="num-col text-expense">{{ formatCurrency(periodData.expense[idx] ?? 0) }}</td>
            <td
              class="num-col"
              :class="(periodData.income[idx] ?? 0) - (periodData.expense[idx] ?? 0) >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ formatCurrency((periodData.income[idx] ?? 0) - (periodData.expense[idx] ?? 0)) }}
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="4" class="empty-period-cell">Nenhuma movimentação registrada neste período.</td>
          </tr>
        </tbody>
        <tfoot v-if="periodTotal > 0">
          <tr>
            <th scope="row">Total do período</th>
            <td class="num-col text-income">{{ formatCurrency(periodIncomeTotal) }}</td>
            <td class="num-col text-expense">{{ formatCurrency(periodExpenseTotal) }}</td>
            <td
              class="num-col"
              :class="periodBalance >= 0 ? 'text-income' : 'text-expense'"
            >
              {{ periodBalance >= 0 ? '+' : '-' }} {{ formatCurrency(Math.abs(periodBalance)) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="chart-wrapper">
      <apexchart
        :key="`${selectedPeriod}-${source.length}-${isDark}`"
        type="bar"
        height="320"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useThemeStore } from '@/stores/themeStore';
import type { TransactionDto } from '@/services/transactionService';
import { parseCalendarDate, toLocalMidnight } from '@/utils/dateUtils';

const props = defineProps<{ transactions?: TransactionDto[] }>();

const transactionStore = useTransactionStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.theme === 'dark');
const selectedPeriod = ref('monthly');
const showDataTable = ref(false);
const source = computed(() => props.transactions ?? transactionStore.transactions);

const periodLabels: Record<string, string> = {
  daily: 'últimos 7 dias',
  weekly: 'últimas 4 semanas',
  monthly: 'últimos 6 meses',
  annual: 'últimos 5 anos',
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const chartSeries = computed(() => [
  {
    name: 'Entradas (+)',
    data: periodData.value?.income || [],
  },
  {
    name: 'Saídas (-)',
    data: periodData.value?.expense || [],
  },
]);

const periodIncomeTotal = computed(() =>
  (periodData.value?.income || []).reduce((sum, v) => sum + v, 0),
);

const periodExpenseTotal = computed(() =>
  (periodData.value?.expense || []).reduce((sum, v) => sum + v, 0),
);

const periodTotal = computed(() => periodIncomeTotal.value + periodExpenseTotal.value);
const periodBalance = computed(() => periodIncomeTotal.value - periodExpenseTotal.value);

const incomePercentage = computed(() => {
  if (periodTotal.value === 0) return 0;
  return Math.round((periodIncomeTotal.value / periodTotal.value) * 100);
});

const expensePercentage = computed(() => {
  if (periodTotal.value === 0) return 0;
  return Math.round((periodExpenseTotal.value / periodTotal.value) * 100);
});

const chartSummaryText = computed(() => {
  if (periodTotal.value === 0) {
    return `Nenhuma movimentação registrada no recorte (${periodLabels[selectedPeriod.value]}).`;
  }
  const balSignal = periodBalance.value >= 0 ? '+' : '-';
  return `No período selecionado (${periodLabels[selectedPeriod.value]}): Entradas de ${formatCurrency(
    periodIncomeTotal.value,
  )} (${incomePercentage.value}%) e Saídas de ${formatCurrency(
    periodExpenseTotal.value,
  )} (${expensePercentage.value}%), com saldo do período de ${balSignal} ${formatCurrency(
    Math.abs(periodBalance.value),
  )}.`;
});

const periodData = computed(() => {
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  let categories: string[] = [];
  let incomeData: number[] = [];
  let expenseData: number[] = [];

  if (selectedPeriod.value === 'daily') {
    // Últimos 7 dias
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 6; i >= 0; i--) {
      const dateRef = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate() - i, 0, 0, 0, 0);
      const targetY = dateRef.getFullYear();
      const targetM = dateRef.getMonth() + 1;
      const targetD = dateRef.getDate();
      const dayName = dateRef.toLocaleDateString('pt-BR', { weekday: 'short' });
      categories.push(`${dayName} (${targetD})`);

      const dayIncome = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return t.entryType === 'credit' && p && p.year === targetY && p.month === targetM && p.day === targetD;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return t.entryType === 'debit' && p && p.year === targetY && p.month === targetM && p.day === targetD;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(dayIncome);
      expenseData.push(dayExpense);
    }
  } else if (selectedPeriod.value === 'weekly') {
    // Últimas 4 semanas com limites explícitos de calendário
    categories = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    incomeData = [0, 0, 0, 0];
    expenseData = [0, 0, 0, 0];

    const todayTime = todayLocal.getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    source.value.forEach((t) => {
      const txLocal = toLocalMidnight(t.date);
      if (!txLocal) return;
      const diffDays = Math.floor((todayTime - txLocal.getTime()) / MS_PER_DAY);

      // Limite estrito de 28 dias: passado distante (>=28) e futuro (<0) não entram. Sem Math.abs nem clamp.
      if (diffDays >= 0 && diffDays < 28) {
        const weekBucket = Math.floor(diffDays / 7); // 0 = mais recente (Semana 4), 3 = mais antiga (Semana 1)
        const reverseIndex = 3 - weekBucket;
        if (t.entryType === 'credit') {
          incomeData[reverseIndex] = (incomeData[reverseIndex] ?? 0) + t.amount;
        } else {
          expenseData[reverseIndex] = (expenseData[reverseIndex] ?? 0) + t.amount;
        }
      }
    });
  } else if (selectedPeriod.value === 'monthly') {
    // Últimos 6 meses (calendário real, sem shift de fuso horário UTC)
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const monthRef = new Date(todayLocal.getFullYear(), todayLocal.getMonth() - i, 1, 12, 0, 0);
      const targetMonth = monthRef.getMonth() + 1; // 1-12
      const targetYear = monthRef.getFullYear();
      const monthName = monthRef.toLocaleDateString('pt-BR', { month: 'short' });
      const year = targetYear.toString().slice(-2);
      categories.push(`${monthName}/${year}`);

      const monthIncome = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return (
            t.entryType === 'credit' &&
            p &&
            p.month === targetMonth &&
            p.year === targetYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return (
            t.entryType === 'debit' &&
            p &&
            p.month === targetMonth &&
            p.year === targetYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(monthIncome);
      expenseData.push(monthExpense);
    }
  } else if (selectedPeriod.value === 'annual') {
    // Últimos 5 anos
    const currentYear = todayLocal.getFullYear();
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      categories.push(year.toString());

      const yearIncome = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return t.entryType === 'credit' && p && p.year === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const yearExpense = source.value
        .filter((t) => {
          const p = parseCalendarDate(t.date);
          return t.entryType === 'debit' && p && p.year === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(yearIncome);
      expenseData.push(yearExpense);
    }
  }

  return { income: incomeData, expense: expenseData, categories };
});

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'var(--font-body)',
    background: 'transparent',
  },
  colors: isDark.value ? ['#6EE7B7', '#FF6B6D'] : ['#065F46', '#E52124'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '48%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: isDark.value ? '#2A2F3A' : '#F3F4F6',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: periodData.value?.categories || [],
    labels: {
      style: {
        colors: isDark.value ? '#a3aab8' : '#64748b',
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: isDark.value ? '#a3aab8' : '#64748b',
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
      },
      formatter: (value: number) => {
        if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
        return `R$ ${Math.round(value)}`;
      },
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: {
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    },
  },
}));
</script>

<style scoped>
.chart-card {
  padding: 24px;
  border-radius: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.chart-kicker {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.chart-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.period-select {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  min-height: 38px;
}

.period-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.chart-summary-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-surface-soft);
  padding: 10px 14px;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary);
  margin: 0 0 12px 0;
}

.chart-actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.data-table-toggle-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  min-height: 38px;
  transition: all 0.15s ease;
}

.data-table-toggle-btn:hover {
  background: var(--color-surface-soft);
  color: var(--color-text);
}

.data-table-toggle-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.chart-table-container {
  overflow-x: auto;
  margin-bottom: 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}

.chart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.chart-table th,
.chart-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
}

.chart-table th[scope='col'] {
  background: var(--color-surface-soft);
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-table th[scope='row'] {
  font-weight: 500;
  color: var(--color-text);
}

.chart-table tfoot th,
.chart-table tfoot td {
  font-weight: 700;
  background: var(--color-surface-soft);
  border-bottom: none;
}

.num-col {
  text-align: right;
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

.empty-period-cell {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 20px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.legend-dot--income {
  background: var(--color-success-dark, #065F46);
}

[data-theme='dark'] .legend-dot--income {
  background: #6EE7B7;
}

.legend-dot--expense {
  background: var(--color-danger, #E52124);
}

.chart-wrapper {
  flex: 1;
  min-height: 320px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
