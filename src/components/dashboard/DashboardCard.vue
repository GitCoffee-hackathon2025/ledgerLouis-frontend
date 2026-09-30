<script setup lang="ts">
import { computed, type Component } from 'vue';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-vue-next';
import DashboardSparkline from './DashboardSparkline.vue';

type Tone = 'positive' | 'negative' | 'neutral';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string;
    icon: Component;
    tone?: Tone;
    description?: string;
    /** Variação percentual vs período anterior; `null` quando não há base de comparação. */
    trend?: number | null;
    /** Se subir é ruim (ex: despesas), inverte a cor da tendência. */
    invertTrend?: boolean;
    series?: number[];
  }>(),
  { tone: 'neutral', description: undefined, trend: null, invertTrend: false, series: undefined },
);

// Série toda zerada vira só uma linha no rodapé do card; nesse caso não desenha.
const hasSeries = computed(() => !!props.series && props.series.length > 1 && props.series.some((v) => v !== 0));

const trendLabel = computed(() => {
  if (props.trend === null) return null;
  const rounded = Math.round(props.trend * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded.toLocaleString('pt-BR')}%`;
});

const trendTone = computed(() => {
  if (!props.trend) return 'neutral';
  const isUp = props.trend > 0;
  return isUp !== props.invertTrend ? 'good' : 'bad';
});

const trendIcon = computed(() => {
  if (!props.trend) return Minus;
  return props.trend > 0 ? ArrowUpRight : ArrowDownRight;
});
</script>

<template>
  <article class="metric-card" :data-tone="tone">
    <header class="metric-top">
      <p class="metric-title">{{ title }}</p>
      <span class="metric-icon"><component :is="icon" :size="18" /></span>
    </header>

    <p class="metric-value tabular">{{ value }}</p>

    <div class="metric-footer">
      <span v-if="trendLabel" class="trend" :data-tone="trendTone">
        <component :is="trendIcon" :size="13" />
        {{ trendLabel }}
      </span>
      <span class="metric-description">{{ description }}</span>
    </div>

    <DashboardSparkline v-if="hasSeries" :data="series ?? []" :tone="tone" class="metric-spark" />
  </article>
</template>

<style scoped>
.metric-card {
  --tone-color: var(--color-text-muted);
  --tone-soft: var(--color-surface-3);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 100%;
  padding: var(--space-5);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
}

.metric-card[data-tone='positive'] {
  --tone-color: var(--color-primary);
  --tone-soft: var(--color-primary-soft);
}

.metric-card[data-tone='negative'] {
  --tone-color: var(--color-danger);
  --tone-soft: var(--color-danger-soft);
}

.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.metric-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--tone-soft);
  color: var(--tone-color);
}

.metric-value {
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.metric-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-size: var(--text-xs);
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px 2px 6px;
  border-radius: var(--radius-full);
  font-weight: 700;
  background: var(--color-surface-3);
  color: var(--color-text-muted);
}

.trend[data-tone='good'] {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.trend[data-tone='bad'] {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.metric-description {
  color: var(--color-text-subtle);
  font-weight: 600;
}

.metric-spark {
  margin: auto calc(var(--space-5) * -1) calc(var(--space-5) * -1);
}
</style>
