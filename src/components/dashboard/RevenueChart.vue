<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import type { TransactionDto } from '@/services/transactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { useChartTheme, brl } from '@/utils/chartTheme';
import { parseCalendarDate } from '@/utils/dateUtils';

const props = defineProps<{
  transactions?: TransactionDto[];
}>();

const theme = useChartTheme();

interface MonthBucket {
  key: string; // YYYY-MM
  label: string;
  income: number;
  expense: number;
}

const monthBuckets = computed<MonthBucket[]>(() => {
  const txs = props.transactions ?? [];
  if (txs.length === 0) return [];

  // Gera últimos 6 meses ordenados
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
    buckets.push({ key, label, income: 0, expense: 0 });
  }

  for (const t of txs) {
    const parsed = parseCalendarDate(t.date);
    if (!parsed) continue;
    const key = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;
    const bucket = buckets.find((b) => b.key === key);
    if (!bucket) continue;
    if (t.entryType === 'credit') {
      bucket.income += t.amount;
    } else {
      bucket.expense += t.amount;
    }
  }

  return buckets;
});

const totalIncome = computed(() => monthBuckets.value.reduce((sum, b) => sum + b.income, 0));
const totalExpense = computed(() => monthBuckets.value.reduce((sum, b) => sum + b.expense, 0));
const netResult = computed(() => totalIncome.value - totalExpense.value);

const hasData = computed(() => totalIncome.value > 0 || totalExpense.value > 0);

const series = computed(() => [
  {
    name: 'Entradas',
    data: monthBuckets.value.map((b) => b.income),
  },
  {
    name: 'Saídas',
    data: monthBuckets.value.map((b) => b.expense),
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const { colors, base } = theme.value;
  return {
    ...base,
    chart: {
      ...base.chart,
      type: 'bar',
    },
    colors: [colors.income, colors.expense],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      ...base.xaxis,
      categories: monthBuckets.value.map((b) => b.label),
    },
    yaxis: {
      ...base.yaxis,
      labels: {
        formatter: brl,
        style: { fontSize: '11px', colors: [colors.muted] },
      },
    },
  };
});
</script>

<template>
  <section class="lg-section" aria-labelledby="revenue-chart-title">
    <div class="lg-section-head">
      <div>
        <h2 id="revenue-chart-title" class="lg-h2">Entradas e saídas por mês</h2>
        <p class="lg-note">Comparativo mensal de receitas e despesas registradas</p>
      </div>

      <div class="lg-legend" aria-label="Legenda das movimentações">
        <span class="is-income">Entradas: <MoneyValue :value="totalIncome" /></span>
        <span class="is-expense">Saídas: <MoneyValue :value="totalExpense" /></span>
      </div>
    </div>

    <!-- Gráfico -->
    <div v-if="hasData" class="lg-chart">
      <apexchart
        type="bar"
        height="280"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <div v-else class="lg-empty">
      Nenhuma movimentação mensal registrada nos últimos meses.
    </div>

    <!-- Resumo textual -->
    <p v-if="hasData" class="lg-note" aria-live="polite">
      No período analisado, as entradas totalizaram
      <MoneyValue :value="totalIncome" signed /> e as saídas
      <MoneyValue :value="-totalExpense" signed />, com resultado de
      <MoneyValue :value="netResult" signed :class="netResult >= 0 ? 'is-income' : 'is-expense'" />.
    </p>

    <!-- Tabela Acessível -->
    <details v-if="hasData" class="lg-details">
      <summary>Ver comparativo mensal em tabela</summary>
      <table class="lg-table">
        <caption class="sr-only">Comparativo mensal de entradas e saídas</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col" class="lg-num">Entradas</th>
            <th scope="col" class="lg-num">Saídas</th>
            <th scope="col" class="lg-num">Resultado líquido</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in monthBuckets" :key="b.key">
            <td>{{ b.label }}</td>
            <td class="lg-num is-income">
              <MoneyValue :value="b.income" signed />
            </td>
            <td class="lg-num is-expense">
              <MoneyValue :value="-b.expense" signed />
            </td>
            <td class="lg-num" :class="b.income - b.expense >= 0 ? 'is-income' : 'is-expense'">
              <MoneyValue :value="b.income - b.expense" signed />
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>
