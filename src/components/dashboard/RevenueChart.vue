<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import type { TransactionDto } from '@/services/transactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { useChartTheme, brl, brlExact } from '@/utils/chartTheme';
import { parseCalendarDate, formatShortDate } from '@/utils/dateUtils';
import { todayISO } from '@/utils/recurrence';

const props = defineProps<{
  transactions?: TransactionDto[];
  period?: string;
  periodLabel?: string;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const theme = useChartTheme();

interface PeriodBucket {
  key: string;
  label: string;
  income: number;
  expense: number;
}

const periodBuckets = computed<PeriodBucket[]>(() => {
  const txs = props.transactions ?? [];
  const today = todayISO();
  const [currentYear, currentMonth, currentDay] = today.split('-').map(Number) as [number, number, number];
  const buckets: PeriodBucket[] = [];

  if (props.period === 'daily') {
    // 7 buckets diários (hoje e 6 dias anteriores)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, currentDay - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      buckets.push({ key, label: formatShortDate(key), income: 0, expense: 0 });
    }
    for (const t of txs) {
      const d = t.date.slice(0, 10);
      const bucket = buckets.find((b) => b.key === d);
      if (bucket) {
        if (t.entryType === 'credit') bucket.income += t.amount;
        else bucket.expense += t.amount;
      }
    }
  } else if (props.period === 'weekly') {
    // 4 semanas (blocos de 7 dias)
    for (let w = 3; w >= 0; w--) {
      const startD = new Date(currentYear, currentMonth - 1, currentDay - (w * 7 + 6));
      const endD = new Date(currentYear, currentMonth - 1, currentDay - w * 7);
      const startKey = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
      const endKey = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;
      const label = `${formatShortDate(startKey)} a ${formatShortDate(endKey)}`;
      buckets.push({ key: `${startKey}_${endKey}`, label, income: 0, expense: 0 });
    }
    for (const t of txs) {
      const d = t.date.slice(0, 10);
      const bucket = buckets.find((b) => {
        const parts = b.key.split('_');
        const startKey = parts[0] ?? '';
        const endKey = parts[1] ?? '';
        return d >= startKey && d <= endKey;
      });
      if (bucket) {
        if (t.entryType === 'credit') bucket.income += t.amount;
        else bucket.expense += t.amount;
      }
    }
  } else if (props.period === 'annual') {
    // 5 anos (ano atual e 4 anteriores)
    for (let y = currentYear - 4; y <= currentYear; y++) {
      buckets.push({ key: String(y), label: String(y), income: 0, expense: 0 });
    }
    for (const t of txs) {
      const y = t.date.slice(0, 4);
      const bucket = buckets.find((b) => b.key === y);
      if (bucket) {
        if (t.entryType === 'credit') bucket.income += t.amount;
        else bucket.expense += t.amount;
      }
    }
  } else if (props.period === 'all') {
    // Todo o histórico: calcular extensão em meses desde a primeira data; mensal até 24 meses, anual acima
    const validDates = txs
      .map((t) => t.date.slice(0, 10))
      .filter((d) => /^\d{4}-\d{2}-\d{2}/.test(d))
      .sort();

    if (validDates.length > 0) {
      const [firstYearStr, firstMonthStr] = (validDates[0] ?? '').split('-');
      const firstYear = Number(firstYearStr);
      const firstMonth = Number(firstMonthStr);
      const monthSpan = (currentYear - firstYear) * 12 + (currentMonth - firstMonth) + 1;

      if (monthSpan > 24) {
        // Mais de 24 meses: agrupa por ano desde o ano da primeira transação até o ano atual
        for (let y = firstYear; y <= currentYear; y++) {
          buckets.push({ key: String(y), label: String(y), income: 0, expense: 0 });
        }
        for (const t of txs) {
          const y = t.date.slice(0, 4);
          const bucket = buckets.find((b) => b.key === y);
          if (bucket) {
            if (t.entryType === 'credit') bucket.income += t.amount;
            else bucket.expense += t.amount;
          }
        }
      } else {
        // Mensal até 24 meses (cobre exatamente todos os meses desde firstMonth/firstYear até o mês atual)
        const safeSpan = Math.max(1, monthSpan);
        for (let i = safeSpan - 1; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - 1 - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
          buckets.push({ key, label, income: 0, expense: 0 });
        }
        for (const t of txs) {
          const key = t.date.slice(0, 7);
          const bucket = buckets.find((b) => b.key === key);
          if (bucket) {
            if (t.entryType === 'credit') bucket.income += t.amount;
            else bucket.expense += t.amount;
          }
        }
      }
    }
  } else {
    // Padrão 'monthly': exatamente os 6 meses do período (mês atual e 5 anteriores)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
      buckets.push({ key, label, income: 0, expense: 0 });
    }
    for (const t of txs) {
      const key = t.date.slice(0, 7);
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) {
        if (t.entryType === 'credit') bucket.income += t.amount;
        else bucket.expense += t.amount;
      }
    }
  }

  return buckets;
});

const totalIncome = computed(() => periodBuckets.value.reduce((sum, b) => sum + b.income, 0));
const totalExpense = computed(() => periodBuckets.value.reduce((sum, b) => sum + b.expense, 0));
const netResult = computed(() => totalIncome.value - totalExpense.value);

const hasData = computed(() => totalIncome.value > 0 || totalExpense.value > 0);

const series = computed(() => [
  {
    name: 'Entradas',
    data: periodBuckets.value.map((b) => b.income),
  },
  {
    name: 'Saídas',
    data: periodBuckets.value.map((b) => b.expense),
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
    tooltip: {
      ...base.tooltip,
      y: { formatter: brlExact },
    },
    xaxis: {
      ...base.xaxis,
      categories: periodBuckets.value.map((b) => b.label),
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
        <h2 id="revenue-chart-title" class="lg-h2">Entradas e saídas por período</h2>
        <p class="lg-note">Comparativo de receitas e despesas ({{ periodLabel || 'período selecionado' }})</p>
      </div>

      <div v-if="!loading && !error" class="lg-legend" aria-label="Legenda das movimentações">
        <span class="is-income">Entradas: <MoneyValue :value="totalIncome" /></span>
        <span class="is-expense">Saídas: <MoneyValue :value="totalExpense" /></span>
      </div>
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="loading" class="lg-empty">
      Carregando fluxo financeiro...
    </div>

    <!-- Estado de Erro -->
    <div v-else-if="error" class="lg-empty">
      <p class="lg-error">{{ error }}</p>
      <button
        type="button"
        class="lg-btn lg-btn--quiet"
        style="margin-top: 8px;"
        @click="emit('retry')"
      >
        Tentar carregar fluxo novamente
      </button>
    </div>

    <template v-else>
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
        Nenhuma movimentação registrada para {{ periodLabel || 'o período selecionado' }}.
      </div>

      <!-- Resumo textual -->
      <p v-if="hasData" class="lg-note" aria-live="polite">
        No período analisado ({{ periodLabel || 'selecionado' }}), as entradas totalizaram
        <MoneyValue :value="totalIncome" signed /> e as saídas
        <MoneyValue :value="-totalExpense" signed />, com resultado de
        <MoneyValue :value="netResult" signed :class="netResult >= 0 ? 'is-income' : 'is-expense'" />.
      </p>

      <!-- Tabela Acessível -->
      <details v-if="hasData" class="lg-details">
        <summary>Ver comparativo do período em tabela</summary>
        <table class="lg-table">
          <caption class="sr-only">Comparativo de entradas e saídas por período</caption>
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col" class="lg-num">Entradas</th>
              <th scope="col" class="lg-num">Saídas</th>
              <th scope="col" class="lg-num">Resultado líquido</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in periodBuckets" :key="b.key">
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
    </template>
  </section>
</template>
