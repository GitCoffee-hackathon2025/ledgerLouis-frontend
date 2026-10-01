<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next';
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue';
import { useGsapScope } from '@/composables/useGsapScope';
import { formatCurrency } from '@/utils/format';
import { smoothPath, toPoints } from '@/utils/sparkPath';

/** Pre-visualizacao viva do produto. Dados de exemplo, fixos de proposito. */
defineProps<{ compact?: boolean }>();

const W = 420;
const H = 150;
const history = [21.4, 24.1, 22.8, 27.9, 29.6, 28.2, 33.5, 36.1, 35.4, 41.2, 44.8, 48.3];
const forecast = [48.3, 50.9, 53.4];

const all = [...history, ...forecast.slice(1)];
const points = toPoints(all.map((v) => v), W - 16, H, 14).map((p) => ({ x: p.x + 4, y: p.y }));
const splitAt = history.length - 1;

const linePath = computed(() => smoothPath(points.slice(0, splitAt + 1)));
const forecastPath = computed(() => smoothPath(points.slice(splitAt)));
const areaPath = computed(() => `${linePath.value} L${points[splitAt]!.x},${H} L0,${H} Z`);
const lastPoint = points[splitAt]!;

const root = ref<HTMLElement>();
const line = ref<SVGPathElement>();

useGsapScope(root, ({ gsap }) => {
  if (!line.value) return;
  const length = line.value.getTotalLength();
  gsap.set(line.value, { strokeDasharray: length, strokeDashoffset: length });
  gsap
    .timeline({ delay: 0.5 })
    .to(line.value, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut' })
    .from('.hl-area, .hl-forecast, .hl-dot', { opacity: 0, duration: 0.8, stagger: 0.15 }, '-=0.6')
    .from('.hl-row', { opacity: 0, y: 14, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.8');
});
</script>

<template>
  <div ref="root" class="ledger-scene">
    <article v-tilt="5" class="ledger tilt" :class="{ 'ledger--compact': compact }" aria-label="Pré-visualização do painel, com dados de exemplo">
      <header class="ledger-head">
        <p>Saldo da empresa</p>
        <span class="ledger-trend"><ArrowUpRight :size="13" /> 8,4% no mês</span>
      </header>

      <p class="ledger-balance figure"><AnimatedNumber :value="48317.52" :format="formatCurrency" :duration="1400" /></p>

      <svg class="ledger-chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Evolução do saldo e previsão">
        <defs>
          <linearGradient id="hl-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#34b585" stop-opacity="0.28" />
            <stop offset="1" stop-color="#34b585" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path class="hl-area" :d="areaPath" fill="url(#hl-fill)" />
        <path ref="line" :d="linePath" fill="none" stroke="#34b585" stroke-width="2.5" stroke-linecap="round" />
        <path class="hl-forecast" :d="forecastPath" fill="none" stroke="#6b7771" stroke-width="2" stroke-dasharray="4 6" stroke-linecap="round" />
        <circle class="hl-dot" :cx="lastPoint.x" :cy="lastPoint.y" r="9" fill="#34b585" opacity="0.18" />
        <circle class="hl-dot" :cx="lastPoint.x" :cy="lastPoint.y" r="4" fill="#34b585" />
      </svg>

      <footer class="ledger-legend">
        <span><i class="dot" style="background: var(--color-primary)" /> Realizado</span>
        <span><i class="dot" style="background: var(--color-text-subtle)" /> Previsão do próximo mês</span>
      </footer>

      <!-- Camada elevada: desloca-se mais que o card ao inclinar. -->
      <ul class="ledger-rows">
        <li class="hl-row ledger-row ledger-row--in">
          <span class="row-icon"><ArrowUpRight :size="15" /></span>
          <span class="row-copy"><strong>Venda no balcão</strong><small>Hoje, 14:32</small></span>
          <strong class="figure">+ R$ 2.450,00</strong>
        </li>
        <li v-if="!compact" class="hl-row ledger-row ledger-row--out">
          <span class="row-icon"><ArrowDownRight :size="15" /></span>
          <span class="row-copy"><strong>Aluguel</strong><small>Recorrente, dia 5</small></span>
          <strong class="figure">- R$ 3.200,00</strong>
        </li>
      </ul>
    </article>
  </div>
</template>

<style scoped>
.ledger-scene {
  width: 100%;
  max-width: 520px;
  margin-inline: auto;
  perspective: 1200px;
}

.ledger {
  position: relative;
  padding: var(--space-6) var(--space-6) 100px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  background: var(--gradient-panel);
  box-shadow: var(--shadow-lg), var(--glow-primary);
}

.ledger--compact {
  padding-bottom: 60px;
}

.ledger-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.ledger-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 9px 3px 6px;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-primary-strong);
}

.ledger-balance {
  margin: var(--space-2) 0 var(--space-4);
  font-size: clamp(2rem, 4.4vw, 2.75rem);
  font-weight: 500;
  line-height: 1;
}

.ledger-chart {
  width: 100%;
  height: auto;
}

.ledger-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}

.ledger-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ledger-rows {
  position: absolute;
  left: var(--space-4);
  right: calc(var(--space-4) * -1);
  bottom: -28px;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transform: translateZ(60px);
}

.ledger-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-2) 94%, transparent);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(12px);
}

.ledger-row:nth-child(2) {
  margin-right: var(--space-8);
}

.row-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
}

.ledger-row--in .row-icon {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.ledger-row--out .row-icon {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.row-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: var(--text-sm);
}

.row-copy small {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}

.ledger-row .figure {
  font-size: var(--text-sm);
  font-weight: 500;
}

.ledger-row--in .figure {
  color: var(--color-primary-strong);
}

.ledger-row--out .figure {
  color: var(--color-danger);
}

@media (max-width: 520px) {
  .ledger {
    padding-inline: var(--space-4);
  }

  .ledger-rows {
    right: var(--space-4);
  }

  .ledger-row:nth-child(2) {
    margin-right: 0;
  }
}
</style>
