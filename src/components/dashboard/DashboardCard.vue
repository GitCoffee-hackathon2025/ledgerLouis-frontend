<script setup lang="ts">
import { computed, type Component } from 'vue';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-vue-next';
import DashboardSparkline from './DashboardSparkline.vue';

type Tone = 'positive' | 'negative' | 'neutral';

/** Metrica em linha: rotulo, valor em destaque, tendencia e o tracado dos ultimos meses. */
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
  <article v-spotlight class="metric spotlight" :data-tone="tone">
    <div class="metric-main">
      <p class="metric-title">
        <component :is="icon" :size="15" :stroke-width="1.75" />
        {{ title }}
      </p>
      <p class="metric-value figure">{{ value }}</p>
      <p class="metric-footer">
        <span v-if="trendLabel" class="trend" :data-tone="trendTone">
          <component :is="trendIcon" :size="12" />
          {{ trendLabel }}
        </span>
        <span class="metric-description">{{ description }}</span>
      </p>
    </div>

    <DashboardSparkline v-if="hasSeries" :data="series ?? []" :tone="tone" class="metric-spark" />
  </article>
</template>

<style scoped>
.metric {
  --tone-color: var(--color-text-muted);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
}

.metric[data-tone='positive'] {
  --tone-color: var(--color-primary);
}

.metric[data-tone='negative'] {
  --tone-color: var(--color-danger);
}

.metric-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.metric-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.metric-title svg {
  color: var(--tone-color);
}

.metric-value {
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: 500;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.metric-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  font-size: var(--text-xs);
}

.trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 7px 1px 5px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 11px;
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
}

.metric-spark {
  flex-shrink: 0;
}
</style>
