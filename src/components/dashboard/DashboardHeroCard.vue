<script setup lang="ts">
import { computed } from 'vue';
import type { ApexOptions } from 'apexcharts';
import type { TransactionDto } from '@/services/transactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { useChartTheme, brl } from '@/utils/chartTheme';
import { formatShortDate, formatDateBr } from '@/utils/dateUtils';

const props = defineProps<{
  transactions: TransactionDto[];
  accountValue: number;
  periodLabel: string;
}>();

const theme = useChartTheme();

const periodIncome = computed(() =>
  props.transactions
    .filter((t) => t.entryType === 'credit')
    .reduce((sum, t) => sum + t.amount, 0),
);

const periodExpense = computed(() =>
  props.transactions
    .filter((t) => t.entryType === 'debit')
    .reduce((sum, t) => sum + t.amount, 0),
);

const periodNet = computed(() => periodIncome.value - periodExpense.value);

interface DailyPoint {
  date: string;
  timestamp: number;
  label: string;
  delta: number;
  cumulative: number;
}

const points = computed<DailyPoint[]>(() => {
  if (props.transactions.length === 0) return [];

  // Ordena por data de calendário (YYYY-MM-DD)
  const sorted = [...props.transactions].sort((a, b) =>
    a.date.slice(0, 10).localeCompare(b.date.slice(0, 10)),
  );

  const byDate = new Map<string, number>();
  for (const t of sorted) {
    const d = t.date.slice(0, 10);
    const delta = t.entryType === 'credit' ? t.amount : -t.amount;
    byDate.set(d, (byDate.get(d) ?? 0) + delta);
  }

  const result: DailyPoint[] = [];
  let current = 0;

  for (const [date, delta] of byDate.entries()) {
    current += delta;
    const [year, month, day] = date.split('-').map(Number) as [number, number, number];
    const timestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();
    result.push({
      date,
      timestamp,
      label: formatShortDate(date),
      delta,
      cumulative: current,
    });
  }

  return result;
});

const series = computed(() => [
  {
    name: 'Saldo acumulado',
    data: points.value.map((p) => [p.timestamp, p.cumulative]),
  },
]);

const chartOptions = computed<ApexOptions>(() => {
  const { colors, base } = theme.value;
  return {
    ...base,
    chart: {
      ...base.chart,
      type: 'area',
      sparkline: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2.5,
      colors: [colors.ink],
    },
    colors: [colors.income],
    fill: {
      type: 'solid',
      opacity: 0.12,
    },
    xaxis: {
      ...base.xaxis,
      type: 'datetime',
      tickAmount: 6,
      labels: {
        rotate: 0,
        rotateAlways: false,
        hideOverlappingLabels: true,
        formatter: (val: string | number, timestamp?: number) => {
          const ts = typeof val === 'number' ? val : (timestamp ?? new Date(val).getTime());
          if (isNaN(ts)) return String(val);
          const d = new Date(ts);
          const day = String(d.getDate()).padStart(2, '0');
          const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').slice(0, 3);
          return `${day} ${month}`;
        },
        style: { fontSize: '11px', colors: [colors.muted] },
      },
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

const minBalance = computed(() =>
  points.value.length ? Math.min(...points.value.map((p) => p.cumulative)) : 0,
);

const maxBalance = computed(() =>
  points.value.length ? Math.max(...points.value.map((p) => p.cumulative)) : 0,
);
</script>

<template>
  <section class="lg-section hero-section" aria-labelledby="hero-balance-title">
    <div class="lg-section-head">
      <div>
        <h2 id="hero-balance-title" class="lg-h2">Evolução do saldo no período</h2>
        <p class="lg-note">Visão consolidada da conta e fluxo acumulado no recorte selecionado</p>
      </div>
      <div class="lg-legend" aria-label="Legenda do gráfico de saldo">
        <span class="is-income">Saldo acumulado</span>
      </div>
    </div>

    <!-- Indicadores no topo do Hero -->
    <div class="lg-figures">
      <div class="lg-figure">
        <span class="lg-figure-label">Saldo total da conta</span>
        <div class="lg-figure-value lg-figure-value--hero">
          <MoneyValue :value="accountValue" />
        </div>
      </div>

      <div class="lg-figure">
        <span class="lg-figure-label">Entradas no período</span>
        <div class="lg-figure-value is-income">
          <MoneyValue :value="periodIncome" signed />
        </div>
      </div>

      <div class="lg-figure">
        <span class="lg-figure-label">Saídas no período</span>
        <div class="lg-figure-value is-expense">
          <MoneyValue :value="-periodExpense" signed />
        </div>
      </div>

      <div class="lg-figure">
        <span class="lg-figure-label">Resultado líquido</span>
        <div class="lg-figure-value" :class="periodNet >= 0 ? 'is-income' : 'is-expense'">
          <MoneyValue :value="periodNet" signed />
        </div>
      </div>
    </div>

    <!-- Gráfico de Área Sangrando até a borda -->
    <div v-if="points.length > 0" class="lg-chart lg-chart--hero">
      <apexchart
        type="area"
        height="300"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <div v-else class="lg-empty">
      Nenhuma movimentação registrada no período selecionado.
    </div>

    <!-- Resumo textual de 1 frase -->
    <p v-if="points.length > 0" class="lg-note hero-summary-text" aria-live="polite">
      No período analisado, o fluxo acumulado oscilou entre
      <MoneyValue :value="minBalance" signed /> e
      <MoneyValue :value="maxBalance" signed />, totalizando um saldo líquido de
      <MoneyValue :value="periodNet" signed />.
    </p>

    <!-- Tabela Acessível Opcional -->
    <details v-if="points.length > 0" class="lg-details">
      <summary>Ver evolução diária em tabela</summary>
      <table class="lg-table">
        <caption class="sr-only">Evolução diária do saldo acumulado</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col" class="lg-num">Movimentação do dia</th>
            <th scope="col" class="lg-num">Saldo acumulado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in points" :key="point.date">
            <td>{{ formatDateBr(point.date) }}</td>
            <td class="lg-num" :class="point.delta >= 0 ? 'is-income' : 'is-expense'">
              <MoneyValue :value="point.delta" signed />
            </td>
            <td class="lg-num">
              <MoneyValue :value="point.cumulative" />
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>

<style scoped>
.hero-section {
  overflow: hidden;
}

.hero-summary-text {
  margin-top: 16px;
}
</style>
