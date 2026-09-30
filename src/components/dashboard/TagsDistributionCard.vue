<script setup lang="ts">
import { computed } from 'vue';
import { useTagStore } from '@/stores/tagStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { colorForTag } from '@/utils/tagColor';
import type { TransactionDto } from '@/services/transactionService';
import { useChartTheme } from '@/utils/chartTheme';
import { formatCurrency } from '@/utils/format';

const props = defineProps<{ transactions?: TransactionDto[] }>();

const tagStore = useTagStore();
const transactionStore = useTransactionStore();
const { isDark, colors } = useChartTheme();
const source = computed(() => props.transactions ?? transactionStore.transactions);

interface TagAggregate {
  id: string;
  label: string;
  total: number;
  color: string;
}

const aggregates = computed<TagAggregate[]>(() => {
  const totals = new Map<string, number>();

  for (const transaction of source.value) {
    const tags = tagStore.transactionTagsMap[transaction.id] ?? [];
    for (const tag of tags) {
      totals.set(tag.id, (totals.get(tag.id) ?? 0) + transaction.amount);
    }
  }

  return tagStore.tags
    .map((tag) => ({
      id: tag.id,
      label: tag.name,
      total: totals.get(tag.id) ?? 0,
      color: colorForTag(tag.id),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
});

const grandTotal = computed(() => aggregates.value.reduce((sum, item) => sum + item.total, 0));

const chartSeries = computed(() => aggregates.value.map((item) => item.total));

const percentage = (value: number) => {
  if (grandTotal.value === 0) return 0;
  return Math.round((value / grandTotal.value) * 100);
};

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
  },
  labels: aggregates.value.map((item) => item.label),
  colors: aggregates.value.map((item) => item.color),
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: {
    width: 2,
    colors: [colors.value.markerStroke],
  },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        // Labels nativos do Apex desligados — o centro é renderizado por cima
        // com HTML/CSS nosso (.donut-center), que dá controle total do
        // espaçamento sem brigar com o posicionamento interno do Apex.
        labels: { show: false },
      },
    },
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: {
      formatter: (value: number) => formatCurrency(value),
    },
  },
}));
</script>

<template>
  <section class="card">
    <header class="card-header">
      <div>
        <p class="card-kicker">Distribuição por tag</p>
        <h2 class="card-title">Onde o dinheiro se concentra</h2>
      </div>
    </header>

    <div v-if="aggregates.length === 0" class="empty-state">
      Marque suas transações com tags para ver a distribuição aqui.
    </div>

    <div v-else class="distribution">
      <div class="donut">
        <apexchart
          :key="`${aggregates.length}-${isDark}`"
          type="donut"
          height="240"
          :options="chartOptions"
          :series="chartSeries"
        />
        <div class="donut-center" aria-hidden="true">
          <span>Total marcado</span>
          <strong class="tabular">{{ formatCurrency(grandTotal) }}</strong>
        </div>
      </div>

      <ul class="breakdown" aria-label="Totais por tag">
        <li v-for="item in aggregates" :key="item.id">
          <span class="dot" :style="{ backgroundColor: item.color }" />
          <span class="breakdown-name">{{ item.label }}</span>
          <span class="breakdown-value tabular">{{ formatCurrency(item.total) }}</span>
          <span class="breakdown-bar" aria-hidden="true">
            <span :style="{ width: `${percentage(item.total)}%`, backgroundColor: item.color }" />
          </span>
          <span class="breakdown-pct tabular">{{ percentage(item.total) }}%</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.distribution {
  display: grid;
  gap: var(--space-4);
}

.donut {
  position: relative;
  max-width: 260px;
  width: 100%;
  margin: 0 auto;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
  text-align: center;
}

.donut-center span {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
}

.donut-center strong {
  max-width: 60%;
  font-family: var(--font-display);
  font-size: var(--text-md);
  overflow-wrap: anywhere;
}

.breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.breakdown li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'dot name value'
    'bar bar pct';
  align-items: center;
  gap: 6px var(--space-2);
  font-size: var(--text-sm);
}

.breakdown .dot {
  grid-area: dot;
}

.breakdown-name {
  grid-area: name;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breakdown-value {
  grid-area: value;
  font-weight: 700;
}

.breakdown-bar {
  grid-area: bar;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  overflow: hidden;
}

.breakdown-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.breakdown-pct {
  grid-area: pct;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-muted);
  text-align: right;
}
</style>
