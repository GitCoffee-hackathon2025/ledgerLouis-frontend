<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { colorForTag } from '@/utils/tagColor';
import { useChartTheme } from '@/utils/chartTheme';
import { formatCompactCurrency, formatCurrency } from '@/utils/format';
import BaseSwitch from '@/components/ui/BaseSwitch.vue';

const analyticsStore = useAnalyticsStore();
const { isDark, colors, axisLabelStyle } = useChartTheme();

onMounted(() => {
  if (!analyticsStore.overallStats) analyticsStore.fetchOverallStats();
});

const groupByTag = computed({
  get: () => analyticsStore.groupByTag,
  set: (value: boolean) => analyticsStore.setGroupByTag(value),
});

const periodLabel = (period: string) => {
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

const overall = computed(() => analyticsStore.overallStats);

const sortedByTagStats = computed(() =>
  [...analyticsStore.byTagStats]
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.mean - a.mean),
);

const overallChartCategories = computed(() => {
  if (!overall.value) return [];
  return [...overall.value.months.map((point) => periodLabel(point.period)), 'Previsão'];
});

const overallChartSeries = computed(() => {
  if (!overall.value) return [];

  const actualData: (number | null)[] = overall.value.months.map((point) => point.total);
  const forecastLead: (number | null)[] = overall.value.months.map(() => null);

  // Ancora o último ponto real no início da série de previsão, para o segmento
  // tracejado conectar visualmente ao fim da linha em vez de aparecer como um ponto solto.
  if (forecastLead.length > 0) {
    forecastLead[forecastLead.length - 1] = actualData[actualData.length - 1] ?? null;
  }

  return [
    { name: 'Gastos mensais', data: [...actualData, null] },
    {
      name: 'Previsão',
      data: [...forecastLead, overall.value.forecastNextMonth],
    },
  ];
});

const axisLabelColor = computed(() => colors.value.axis);

// Faixa de ±1 desvio padrão em torno da média: com menos de 2 meses a variância
// não tem significado (fica 0), então a faixa fica escondida para não sugerir precisão falsa.
const deviationAnnotations = computed(() => {
  if (!overall.value || overall.value.months.length < 2) return [];

  const { mean: meanValue, standardDeviation } = overall.value;

  return [
    {
      y: meanValue - standardDeviation,
      y2: meanValue + standardDeviation,
      borderColor: 'transparent',
      fillColor: colors.value.income,
      opacity: 0.12,
      label: {
        text: '± 1 desvio padrão',
        position: 'left',
        offsetX: 10,
        style: {
          color: axisLabelColor.value,
          background: 'transparent',
          fontSize: '11px',
          fontWeight: 600,
        },
      },
    },
    {
      y: meanValue,
      borderColor: colors.value.reference,
      strokeDashArray: 4,
      label: {
        text: 'Média',
        position: 'right',
        offsetX: -10,
        style: {
          color: axisLabelColor.value,
          background: 'transparent',
          fontSize: '11px',
          fontWeight: 600,
        },
      },
    },
  ];
});

const overallChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
  },
  colors: [colors.value.income, colors.value.forecast],
  stroke: {
    curve: 'smooth',
    width: [3, 3],
    dashArray: [0, 6],
  },
  markers: {
    size: [4, 7],
    strokeWidth: [0, 2],
    strokeColors: colors.value.markerStroke,
    hover: { size: 9 },
  },
  fill: {
    type: ['gradient', 'solid'],
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.28,
      opacityTo: 0.02,
    },
    opacity: [1, 0],
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
    formatter: (value: number) => (value ? formatCurrency(value) : ''),
    offsetY: -14,
    style: {
      fontSize: '12px',
      fontWeight: 800,
      colors: [colors.value.forecast],
    },
    background: {
      enabled: true,
      foreColor: colors.value.forecast,
      borderColor: colors.value.forecast,
      borderWidth: 1.5,
      padding: 5,
      opacity: isDark.value ? 0.16 : 0.1,
    },
  },
  grid: {
    borderColor: colors.value.grid,
    strokeDashArray: 4,
  },
  xaxis: {
    categories: overallChartCategories.value,
    labels: { style: axisLabelStyle.value },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: axisLabelStyle.value,
      formatter: formatCompactCurrency,
    },
  },
  legend: { show: false },
  annotations: {
    yaxis: deviationAnnotations.value,
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: {
      formatter: (value: number, opts?: { seriesIndex?: number }) => {
        const isForecast = opts?.seriesIndex === 1;
        if (isForecast && overall.value) {
          return `${formatCurrency(value)} (± ${formatCurrency(overall.value.standardDeviation)})`;
        }
        return formatCurrency(value);
      },
    },
  },
}));

// Sparkline por tag: mesma série mensal já retornada pelo backend para a visão
// "Agrupar por tag", só que hoje descartada — aqui vira um mini-gráfico de área.
const tagSparklineOptions = (tagId: string) => ({
  chart: { type: 'area', sparkline: { enabled: true } },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.4, opacityFrom: 0.35, opacityTo: 0.02 },
  },
  colors: [colorForTag(tagId)],
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (value: number) => formatCurrency(value) },
  },
});
</script>

<template>
  <section class="card">
    <header class="card-header">
      <div>
        <p class="card-kicker">Estatísticas de gastos</p>
        <h2 class="card-title">Variação e previsão</h2>
      </div>

      <BaseSwitch v-model="groupByTag">Agrupar por tag</BaseSwitch>
    </header>

    <div v-if="analyticsStore.loading && !overall && sortedByTagStats.length === 0" class="empty-state">
      Calculando estatísticas...
    </div>

    <template v-else>
      <div v-if="!analyticsStore.groupByTag" class="overall-view">
        <div v-if="!overall || overall.count === 0" class="empty-state">
          Ainda não há despesas suficientes para calcular estatísticas.
        </div>

        <template v-else>
          <div class="stat-tiles">
            <div class="stat-tile">
              <span class="stat-tile-label">Média mensal</span>
              <strong class="stat-tile-value">{{ formatCurrency(overall.mean) }}</strong>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">Desvio padrão</span>
              <strong class="stat-tile-value">{{ formatCurrency(overall.standardDeviation) }}</strong>
            </div>
            <div class="stat-tile stat-tile--forecast">
              <span class="stat-tile-label">Previsão próx. mês</span>
              <strong class="stat-tile-value">
                {{ overall.forecastNextMonth !== null ? formatCurrency(overall.forecastNextMonth) : '-' }}
              </strong>
            </div>
          </div>

          <div class="chart-wrapper">
            <apexchart
              :key="`${overall?.months.length ?? 0}-${isDark}`"
              type="line"
              height="220"
              :options="overallChartOptions"
              :series="overallChartSeries"
            />
          </div>
        </template>
      </div>

      <ul v-else class="tag-stats-list">
        <li v-if="sortedByTagStats.length === 0" class="empty-state">
          Nenhuma tag com despesas registradas ainda.
        </li>

        <li v-for="stat in sortedByTagStats" :key="stat.tagId" class="tag-stats-row">
          <span class="tag-stats-dot" :style="{ backgroundColor: colorForTag(stat.tagId) }"></span>

          <div class="tag-stats-info">
            <strong>{{ stat.tagName }}</strong>
            <span>{{ stat.count }} despesa(s)</span>
          </div>

          <div v-if="stat.months.length > 1" class="tag-stats-sparkline">
            <apexchart
              type="area"
              height="36"
              width="90"
              :options="tagSparklineOptions(stat.tagId)"
              :series="[{ data: stat.months.map((m) => m.total) }]"
            />
          </div>

          <div class="tag-stats-metrics">
            <div>
              <span>Média</span>
              <strong>{{ formatCurrency(stat.mean) }}</strong>
            </div>
            <div>
              <span>Desvio</span>
              <strong>{{ formatCurrency(stat.standardDeviation) }}</strong>
            </div>
            <div>
              <span>Previsão</span>
              <strong>{{ stat.forecastNextMonth !== null ? formatCurrency(stat.forecastNextMonth) : '-' }}</strong>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.stat-tiles {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-tile {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-tile--forecast {
  background: var(--color-warning-soft);
}

.stat-tile-label {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.stat-tile-value {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stat-tile--forecast .stat-tile-label {
  color: var(--color-warning-strong);
}

.chart-wrapper {
  margin-left: -10px;
}

.tag-stats-list {
  display: grid;
  gap: 10px;
}

.tag-stats-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.tag-stats-sparkline {
  flex-shrink: 0;
  line-height: 0;
}

.tag-stats-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.tag-stats-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tag-stats-info strong {
  color: var(--color-text);
  font-size: 14px;
}

.tag-stats-info span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.tag-stats-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px 16px;
}

.tag-stats-metrics > div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.tag-stats-metrics span {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.tag-stats-metrics strong {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 800;
}

@media (min-width: 560px) {
  .stat-tiles {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .tag-stats-row {
    grid-template-columns: 1fr;
  }

  .tag-stats-sparkline {
    display: none;
  }

  .tag-stats-metrics {
    justify-content: space-between;
  }

  .tag-stats-metrics > div {
    align-items: flex-start;
  }
}

</style>
