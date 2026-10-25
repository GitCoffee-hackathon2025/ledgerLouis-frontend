<template>
  <section class="chart-card chart-card--revenue" aria-labelledby="revenue-chart-title">
    <header class="chart-header">
      <div>
        <p class="chart-kicker">Entradas vs Saídas</p>
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
        <span>Entradas ({{ incomePercentage }}%)</span>
      </span>
      <span class="legend-item">
        <i class="legend-dot legend-dot--expense" aria-hidden="true"></i>
        <span>Saídas ({{ expensePercentage }}%)</span>
      </span>
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

const props = defineProps<{ transactions?: TransactionDto[] }>();

const transactionStore = useTransactionStore();
const themeStore = useThemeStore();
const isDark = computed(() => themeStore.theme === 'dark');
const selectedPeriod = ref('monthly');
const source = computed(() => props.transactions ?? transactionStore.transactions);

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

const totalIncome = computed(() =>
  source.value
    .filter((t) => t.entryType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0),
);

const totalExpense = computed(() =>
  source.value
    .filter((t) => t.entryType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0),
);

const total = computed(() => totalIncome.value + totalExpense.value);

const incomePercentage = computed(() => {
  const totalVal = total.value;
  if (totalVal === 0) return 0;
  return Math.round((totalIncome.value / totalVal) * 100);
});

const expensePercentage = computed(() => {
  const totalVal = total.value;
  if (totalVal === 0) return 0;
  return Math.round((totalExpense.value / totalVal) * 100);
});

const periodData = computed(() => {
  const now = new Date();
  let categories: string[] = [];
  let incomeData: number[] = [];
  let expenseData: number[] = [];

  if (selectedPeriod.value === 'daily') {
    // Últimos 7 dias
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      categories.push(`${dayName} (${date.getDate()})`);

      const dayIncome = source.value
        .filter((t) => t.entryType === 'credit' && t.date === dateString)
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = source.value
        .filter((t) => t.entryType === 'debit' && t.date === dateString)
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(dayIncome);
      expenseData.push(dayExpense);
    }
  } else if (selectedPeriod.value === 'weekly') {
    // Últimas 4 semanas com limites explícitos de calendário
    categories = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
    incomeData = [0, 0, 0, 0];
    expenseData = [0, 0, 0, 0];

    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayTime = todayLocal.getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    source.value.forEach((t) => {
      const parts = t.date.split('T')[0].split('-');
      if (parts.length !== 3) return;
      const txLocal = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0, 0);
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
    // Últimos 6 meses
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      categories.push(`${monthName}/${year}`);

      const monthIncome = source.value
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            t.entryType === 'credit' &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = source.value
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            t.entryType === 'debit' &&
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(monthIncome);
      expenseData.push(monthExpense);
    }
  } else if (selectedPeriod.value === 'annual') {
    // Últimos 5 anos
    const currentYear = now.getFullYear();
    categories = [];
    incomeData = [];
    expenseData = [];

    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      categories.push(year.toString());

      const yearIncome = source.value
        .filter((t) => {
          const date = new Date(t.date);
          return t.entryType === 'credit' && date.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const yearExpense = source.value
        .filter((t) => {
          const date = new Date(t.date);
          return t.entryType === 'debit' && date.getFullYear() === year;
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
  margin-bottom: 12px;
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
