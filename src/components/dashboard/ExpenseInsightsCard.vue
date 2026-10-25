<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useThemeStore } from '@/stores/themeStore';
import { colorForTag } from '@/utils/tagColor';

const analyticsStore = useAnalyticsStore();
const themeStore = useThemeStore();

onMounted(() => {
  if (!analyticsStore.overallStats) analyticsStore.fetchOverallStats();
});

const onToggle = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  analyticsStore.setGroupByTag(checked);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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

const isDark = computed(() => themeStore.theme === 'dark');
const axisLabelColor = computed(() => (isDark.value ? '#a3aab8' : '#64748b'));
const gridLineColor = computed(() =>
  isDark.value ? 'rgba(163, 170, 184, 0.14)' : 'rgba(148, 163, 184, 0.16)',
);
const meanLineColor = computed(() => (isDark.value ? '#7c8494' : '#94a3b8'));

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
      fillColor: '#27B969',
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
      borderColor: meanLineColor.value,
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
    fontFamily: 'var(--font-body)',
  },
  colors: isDark.value ? ['#6EE7B7', '#FBBF24'] : ['#065F46', '#D97706'],
  stroke: {
    curve: 'straight',
    width: [2, 2],
    dashArray: [0, 5],
  },
  markers: {
    size: [3, 4],
    strokeWidth: [0, 1],
    strokeColors: '#fff',
    hover: { size: 6 },
  },
  fill: {
    type: ['solid', 'solid'],
    opacity: [0.08, 0],
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
    formatter: (value: number) => (value ? formatCurrency(value) : ''),
    offsetY: -14,
    style: {
      fontSize: '12px',
      fontWeight: 800,
      colors: ['#f59e0b'],
    },
    background: {
      enabled: true,
      foreColor: '#f59e0b',
      borderColor: '#f59e0b',
      borderWidth: 1.5,
      padding: 5,
      opacity: isDark.value ? 0.16 : 0.1,
    },
  },
  grid: {
    borderColor: gridLineColor.value,
    strokeDashArray: 4,
  },
  xaxis: {
    categories: overallChartCategories.value,
    labels: { style: { colors: axisLabelColor.value, fontSize: '12px' } },
  },
  yaxis: {
    labels: {
      style: { colors: axisLabelColor.value, fontSize: '12px' },
      formatter: (value: number) => `R$ ${Math.round(value / 100) / 10}k`,
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
  <section class="chart-card insights-card">
    <header class="chart-header">
      <div>
        <p class="chart-kicker">Estatísticas de gastos</p>
        <h2>Variação e previsão</h2>
      </div>

      <label class="toggle">
        <input
          type="checkbox"
          :checked="analyticsStore.groupByTag"
          @change="onToggle"
        />
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">Agrupar por tag</span>
      </label>
    </header>

    <div v-if="analyticsStore.loading && !overall && sortedByTagStats.length === 0" class="insights-empty">
      Calculando estatísticas...
    </div>

    <template v-else>
      <div v-if="!analyticsStore.groupByTag" class="overall-view">
        <div v-if="!overall || overall.count === 0" class="insights-empty">
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
                {{ overall.forecastNextMonth !== null ? formatCurrency(overall.forecastNextMonth) : '—' }}
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
        <li v-if="sortedByTagStats.length === 0" class="insights-empty">
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
              <strong>{{ stat.forecastNextMonth !== null ? formatCurrency(stat.forecastNextMonth) : '—' }}</strong>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.chart-card {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.chart-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.chart-kicker {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

h2 {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--color-border);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.16);
  transition: transform 0.2s ease;
}

.toggle input:checked + .toggle-track {
  background: var(--color-success-gradient);
}

.toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(16px);
}

.toggle-label {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.insights-empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
  background: var(--color-surface-soft);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
}

.stat-tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.stat-tile {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-tile--forecast {
  background: var(--color-surface-soft);
  border-left: 3px solid var(--color-primary);
}

.stat-tile-label {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.stat-tile-value {
  color: var(--color-text);
  font-size: 15px;
  font-weight: 800;
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
  border-radius: 14px;
  background: var(--color-surface-soft);
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
  color: var(--color-text-secondary);
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
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.tag-stats-metrics strong {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 800;
}

:deep(.apexcharts-text),
:deep(.apexcharts-legend-text) {
  font-family: var(--font-body) !important;
}

@media (min-width: 560px) {
  .stat-tiles {
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

@media (min-width: 768px) {
  .chart-card {
    padding: 24px;
  }
}
</style>
