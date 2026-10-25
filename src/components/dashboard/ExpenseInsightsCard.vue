<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { ApexOptions } from 'apexcharts';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useChartTheme, brl } from '@/utils/chartTheme';
import MoneyValue from '@/components/ui/MoneyValue.vue';

const analyticsStore = useAnalyticsStore();
const theme = useChartTheme();

onMounted(() => {
  if (!analyticsStore.overallStats) analyticsStore.fetchOverallStats();
});

const overall = computed(() => analyticsStore.overallStats);

const periodLabel = (period: string) => {
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
};

const hasEnoughData = computed(() => (overall.value?.months.length ?? 0) >= 2);
const forecastValue = computed(() => overall.value?.forecastNextMonth ?? 0);
const hasForecast = computed(() => hasEnoughData.value && overall.value?.forecastNextMonth != null);

const categories = computed(() => {
  if (!overall.value || !hasEnoughData.value) return [];
  return [...overall.value.months.map((m) => periodLabel(m.period)), 'Previsão'];
});

const series = computed(() => {
  if (!overall.value || !hasEnoughData.value) return [];
  const actual = overall.value.months.map((m) => m.total);
  const forecast = overall.value.months.map(() => null as number | null);

  // Conecta o último ponto real ao primeiro ponto de previsão para linha contínua
  if (forecast.length > 0) {
    forecast[forecast.length - 1] = actual[actual.length - 1] ?? null;
  }
  forecast.push(overall.value.forecastNextMonth);

  return [
    {
      name: 'Despesa mensal',
      data: [...actual, null],
    },
    {
      name: 'Previsão estimada',
      data: forecast,
    },
  ];
});

const chartOptions = computed<ApexOptions>(() => {
  const { colors, base } = theme.value;
  const meanVal = overall.value?.mean ?? 0;

  return {
    ...base,
    chart: {
      ...base.chart,
      type: 'line',
    },
    colors: [colors.expense, colors.projection],
    stroke: {
      width: [2.5, 2.5],
      curve: 'smooth',
      dashArray: [0, 5],
    },
    markers: {
      size: [4, 5],
      strokeWidth: [0, 1],
      hover: { size: 6 },
    },
    annotations: {
      yaxis: [
        {
          y: meanVal,
          borderColor: colors.muted,
          strokeDashArray: 4,
          label: {
            text: `Média: ${brl(meanVal)}`,
            position: 'right',
            offsetX: -8,
            style: {
              color: colors.muted,
              background: 'transparent',
              fontSize: '11px',
              fontWeight: 600,
            },
          },
        },
      ],
    },
    xaxis: {
      ...base.xaxis,
      categories: categories.value,
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
  <section class="lg-section" aria-labelledby="insights-title">
    <div class="lg-section-head">
      <div>
        <h2 id="insights-title" class="lg-h2">Variação e previsão</h2>
        <p class="lg-note">Média histórica e estimativa de gastos futuros</p>
      </div>

      <div v-if="overall && hasForecast" class="lg-legend" aria-label="Legenda de previsão">
        <span class="is-expense">Histórico mensal</span>
        <span class="is-projection">Previsão: <MoneyValue :value="forecastValue" /></span>
      </div>
    </div>

    <!-- Gráfico -->
    <div v-if="overall && hasForecast" class="lg-chart">
      <apexchart
        type="line"
        height="280"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <div v-else class="lg-empty">
      Dados históricos insuficientes para calcular previsão (são necessários ao menos 2 meses com lançamentos).
    </div>

    <!-- Resumo textual de 1 frase -->
    <p v-if="overall && hasForecast" class="lg-note" aria-live="polite">
      A despesa média mensal foi de
      <MoneyValue :value="overall.mean" />, com oscilação padrão de ±
      <MoneyValue :value="overall.standardDeviation" /> e projeção de
      <MoneyValue :value="forecastValue" /> para o próximo mês.
    </p>

    <!-- Tabela Acessível -->
    <details v-if="overall && hasForecast" class="lg-details">
      <summary>Ver valores históricos e previsão em tabela</summary>
      <table class="lg-table">
        <caption class="sr-only">Histórico mensal e previsão estimada de gastos</caption>
        <thead>
          <tr>
            <th scope="col">Período</th>
            <th scope="col" class="lg-num">Valor</th>
            <th scope="col">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in overall.months" :key="point.period">
            <td>{{ periodLabel(point.period) }}</td>
            <td class="lg-num is-expense">
              <MoneyValue :value="point.total" />
            </td>
            <td>Registrado</td>
          </tr>
          <tr>
            <td>Próximo mês</td>
            <td class="lg-num is-projection">
              <MoneyValue :value="forecastValue" />
            </td>
            <td>Previsão projetada</td>
          </tr>
        </tbody>
      </table>
    </details>
  </section>
</template>
