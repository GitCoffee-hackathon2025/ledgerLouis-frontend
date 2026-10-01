<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next';
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue';
import { formatCurrency } from '@/utils/format';
import { smoothPath, toPoints } from '@/utils/sparkPath';

const props = defineProps<{
  balance: number;
  income: number;
  expense: number;
  /** Resultado liquido (entradas - saidas) de cada mes, do mais antigo ao atual. */
  months: { label: string; net: number }[];
  companyName?: string;
}>();

const W = 640;
const H = 170;

const hasChart = computed(() => props.months.length > 1 && props.months.some((m) => m.net !== 0));
// Margem horizontal de 10 unidades: o marcador do mes nao encosta na borda do svg.
const points = computed(() =>
  toPoints(props.months.map((m) => m.net), W - 20, H, 22).map((p) => ({ x: p.x + 10, y: p.y })),
);
const line = computed(() => smoothPath(points.value));
const area = computed(() => `${line.value} L${W},${H} L0,${H} Z`);

// Eixo do zero: separa meses positivos de negativos.
const zeroY = computed(() => {
  const nets = props.months.map((m) => m.net);
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (min >= 0 || max <= 0) return null;
  return 22 + (1 - (0 - min) / (max - min)) * (H - 44);
});

// Progressive disclosure: o mes sob o cursor ganha destaque; por padrao, o mes atual.
const hovered = ref<number | null>(null);
const active = computed(() => hovered.value ?? props.months.length - 1);
const activeMonth = computed(() => props.months[active.value]);

const onMove = (event: PointerEvent) => {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  hovered.value = Math.round(ratio * (props.months.length - 1));
};

const monthNet = computed(() => props.income - props.expense);
</script>

<template>
  <section v-tilt="2.5" class="balance tilt" aria-label="Saldo da empresa">
    <header class="balance-head">
      <p>Saldo total{{ companyName ? `, ${companyName}` : '' }}</p>
      <span class="balance-month" :class="monthNet >= 0 ? 'is-up' : 'is-down'">
        <component :is="monthNet >= 0 ? ArrowUpRight : ArrowDownRight" :size="13" />
        {{ formatCurrency(Math.abs(monthNet)) }} no mês
      </span>
    </header>

    <p class="balance-figure figure" :class="{ 'is-negative': balance < 0 }">
      <AnimatedNumber :value="balance" :format="formatCurrency" :duration="1100" />
    </p>

    <dl class="balance-split">
      <div>
        <dt><i class="dot" style="background: var(--color-primary)" /> Entradas do mês</dt>
        <dd class="figure text-income">{{ formatCurrency(income) }}</dd>
      </div>
      <div>
        <dt><i class="dot" style="background: var(--color-danger)" /> Saídas do mês</dt>
        <dd class="figure text-expense">{{ formatCurrency(expense) }}</dd>
      </div>
    </dl>

    <div v-if="hasChart" class="balance-chart">
      <p class="balance-readout" aria-live="polite">
        <span>Resultado em {{ activeMonth?.label }}</span>
        <strong class="figure" :class="(activeMonth?.net ?? 0) >= 0 ? 'text-income' : 'text-expense'">
          {{ formatCurrency(activeMonth?.net ?? 0) }}
        </strong>
      </p>
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="none"
        role="img"
        aria-label="Resultado líquido dos últimos meses"
        @pointermove="onMove"
        @pointerleave="hovered = null"
      >
        <defs>
          <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#34b585" stop-opacity="0.3" />
            <stop offset="1" stop-color="#34b585" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line v-if="zeroY !== null" x1="0" :y1="zeroY" :x2="W" :y2="zeroY" stroke="rgba(255,255,255,0.14)" stroke-dasharray="3 5" />
        <path :d="area" fill="url(#balance-fill)" />
        <path :d="line" fill="none" stroke="#34b585" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" />
        <line :x1="points[active]!.x" y1="0" :x2="points[active]!.x" :y2="H" stroke="rgba(255,255,255,0.18)" />
        <circle :cx="points[active]!.x" :cy="points[active]!.y" r="5" fill="#34b585" stroke="#101211" stroke-width="2" vector-effect="non-scaling-stroke" />
      </svg>

      <div class="balance-axis" aria-hidden="true">
        <span v-for="(m, i) in months" :key="m.label + i" :class="{ 'is-active': i === active }">{{ m.label }}</span>
      </div>

    </div>

    <p v-else class="balance-empty">O gráfico aparece assim que houver movimentações nos últimos meses.</p>
  </section>
</template>

<style scoped>
.balance {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  background: var(--gradient-panel);
  box-shadow: var(--shadow-md), var(--glow-primary);
}

@media (min-width: 768px) {
  .balance {
    padding: var(--space-8);
  }
}

.balance-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.balance-month {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px 3px 7px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 11px;
}

.balance-month.is-up {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.balance-month.is-down {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.balance-figure {
  font-size: var(--text-figure);
  font-weight: 400;
  line-height: 1;
  overflow-wrap: anywhere;
}

.balance-figure.is-negative {
  color: var(--color-danger);
}

.balance-split {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-10);
}

.balance-split dt {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}

.balance-split dd {
  font-size: var(--text-lg);
  font-weight: 500;
}

.balance-chart {
  position: relative;
  margin-top: var(--space-2);
}

.balance-chart svg {
  width: 100%;
  height: 150px;
  cursor: crosshair;
  touch-action: pan-y;
}

.balance-axis {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-subtle);
  text-transform: capitalize;
}

.balance-axis .is-active {
  color: var(--color-text);
}

.balance-readout {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}

.balance-readout strong {
  font-size: var(--text-md);
  font-weight: 500;
}

.balance-empty {
  padding: var(--space-6) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}
</style>
