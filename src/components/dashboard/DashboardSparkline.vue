<script setup lang="ts">
import { computed } from 'vue';
import { useChartTheme } from '@/utils/chartTheme';

const props = withDefaults(
  defineProps<{ data: number[]; tone?: 'positive' | 'negative' | 'neutral' }>(),
  { tone: 'positive' },
);

const { colors } = useChartTheme();

const color = computed(() => {
  if (props.tone === 'negative') return colors.value.expense;
  if (props.tone === 'neutral') return colors.value.axis;
  return colors.value.income;
});

const series = computed(() => [{ name: 'Movimento', data: props.data }]);

const options = computed(() => ({
  chart: { type: 'area', sparkline: { enabled: true }, animations: { enabled: false } },
  colors: [color.value],
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.4, opacityFrom: 0.22, opacityTo: 0, stops: [0, 95, 100] },
  },
  tooltip: { enabled: false },
}));
</script>

<template>
  <div class="sparkline">
    <apexchart type="area" height="56" :options="options" :series="series" />
  </div>
</template>

<style scoped>
.sparkline {
  min-height: 56px;
  margin-top: var(--space-2);
}
</style>
