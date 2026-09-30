<template>
  <section class="card chart-card">
    <header class="card-header">
      <div>
        <p class="card-kicker">Entradas vs saídas</p>
        <h2 class="card-title">Movimentação financeira</h2>
      </div>

      <label class="sr-only" for="revenue-period">Período</label>
      <select id="revenue-period" v-model="selectedPeriod" class="input input--sm period-select">
        <option value="daily">Últimos 7 dias</option>
        <option value="weekly">Últimas 4 semanas</option>
        <option value="monthly">Mensal</option>
        <option value="annual">Anual</option>
      </select>
    </header>

    <div class="chart-legend">
      <span><i class="dot" :style="{ background: colors.income }" /> Entradas · {{ incomePercentage }}%</span>
      <span><i class="dot" :style="{ background: colors.expense }" /> Saídas · {{ expensePercentage }}%</span>
    </div>

    <div class="chart-wrapper">
      <apexchart
        :key="`${selectedPeriod}-${source.length}-${isDark}`"
        type="bar"
        height="300"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionDto } from '@/services/transactionService';
import { useChartTheme } from '@/utils/chartTheme';
import { formatCompactCurrency, formatCurrency } from '@/utils/format';

const props = defineProps<{ transactions?: TransactionDto[] }>();

const transactionStore = useTransactionStore();
const { isDark, colors, axisLabelStyle } = useChartTheme();
const selectedPeriod = ref('monthly');
const source = computed(() => props.transactions ?? transactionStore.transactions);

const chartSeries = computed(() => [
  {
    name: 'Entradas',
    data: periodData.value?.income || [],
  },
  {
    name: 'Saídas',
    data: periodData.value?.expense || [],
  },
]);

const totalIncome = computed(() => 
  source.value
    .filter(t => t.entryType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
);

const totalExpense = computed(() => 
  source.value
    .filter(t => t.entryType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)
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
      const dateStr = date.toISOString().split('T')[0];
      categories.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }));
      
      const dayIncome = source.value
        .filter(t => t.entryType === 'credit' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = source.value
        .filter(t => t.entryType === 'debit' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      
      incomeData.push(dayIncome);
      expenseData.push(dayExpense);
    }
  } else if (selectedPeriod.value === 'weekly') {
    // Últimas 4 semanas
    categories = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    incomeData = [0, 0, 0, 0];
    expenseData = [0, 0, 0, 0];
    
    source.value.forEach((transaction) => {
      const date = new Date(transaction.date);
      const weekNum = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      if (weekNum >= 0 && weekNum < 4) {
        if (transaction.entryType === 'credit') {
          incomeData[3 - weekNum] = (incomeData[3 - weekNum] ?? 0) + transaction.amount;
        } else {
          expenseData[3 - weekNum] = (expenseData[3 - weekNum] ?? 0) + transaction.amount;
        }
      }
    });
  } else if (selectedPeriod.value === 'monthly') {
    // Últimos 12 meses
    categories = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    incomeData = Array.from({ length: 12 }, () => 0);
    expenseData = Array.from({ length: 12 }, () => 0);
    
    source.value.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      
      if (transaction.entryType === 'credit') {
        incomeData[month] = (incomeData[month] ?? 0) + transaction.amount;
      } else {
        expenseData[month] = (expenseData[month] ?? 0) + transaction.amount;
      }
    });
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
        .filter(t => {
          const date = new Date(t.date);
          return t.entryType === 'credit' && date.getFullYear() === year;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      const yearExpense = source.value
        .filter(t => {
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
  },
  colors: [colors.value.income, colors.value.expense],
  plotOptions: {
    bar: {
      borderRadius: 6,
      borderRadiusApplication: 'end',
      columnWidth: '52%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    borderColor: colors.value.grid,
    strokeDashArray: 4,
  },
  xaxis: {
    categories: periodData.value?.categories || [],
    labels: { style: axisLabelStyle.value },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    decimalsInFloat: 1,
    labels: { style: axisLabelStyle.value, formatter: formatCompactCurrency },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: {
      formatter: formatCurrency,
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '58%',
          },
        },
      },
    },
  ],
}));

</script>

<style scoped>
.period-select {
  width: auto;
  border-radius: var(--radius-full);
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin: calc(var(--space-2) * -1) 0 var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chart-wrapper {
  margin: 0 -8px -8px -12px;
}
</style>
