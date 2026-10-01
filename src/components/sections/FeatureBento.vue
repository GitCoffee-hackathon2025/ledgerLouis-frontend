<script setup lang="ts">
import { ref } from 'vue';
import AnimatedNumber from '@/components/ui/AnimatedNumber.vue';
import { useGsapScope } from '@/composables/useGsapScope';
import { formatCurrency } from '@/utils/format';
import { smoothPath, toPoints } from '@/utils/sparkPath';

/** Dados de exemplo para ilustrar o relatorio. */
const W = 520;
const H = 190;
const spend = [8.2, 9.6, 8.9, 11.4, 10.1, 12.3];
const forecast = [12.3, 13.1];
const pts = toPoints([...spend, forecast[1]!], W, H, 20);
const split = spend.length - 1;
const actual = smoothPath(pts.slice(0, split + 1));
const projected = smoothPath(pts.slice(split));
const band = `${projected} L${pts[split + 1]!.x},${pts[split + 1]!.y + 26} L${pts[split]!.x},${pts[split]!.y + 18} Z`;

const tags = [
  { name: 'Fornecedores', color: '#34b585' },
  { name: 'Marketing', color: '#7dd3fc' },
  { name: 'Folha', color: '#e8b24a' },
  { name: 'Impostos', color: '#ee6b78' },
  { name: 'Estoque', color: '#a3e635' },
];

const roles = [
  { role: 'owner', scope: 'Gerencia tudo' },
  { role: 'admin', scope: 'Lança e convida' },
  { role: 'viewer', scope: 'Só consulta' },
];

const root = ref<HTMLElement>();
const actualLine = ref<SVGPathElement>();

useGsapScope(root, ({ gsap }) => {
  if (!actualLine.value) return;
  const length = actualLine.value.getTotalLength();
  gsap.fromTo(
    actualLine.value,
    { strokeDasharray: length, strokeDashoffset: length },
    {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: { trigger: actualLine.value, start: 'top 85%', end: 'top 40%', scrub: true },
    },
  );
});
</script>

<template>
  <section id="recursos" ref="root" class="section">
    <header class="section-heading">
      <p class="section-eyebrow">Recursos</p>
      <h2>Tudo o que sua empresa precisa para <span class="gradient-text">controlar o caixa</span></h2>
    </header>

    <div class="bento">
      <article v-tilt="2.5" class="cell cell--report tilt spotlight">
        <div class="cell-copy">
          <h3>Relatórios com previsão</h3>
          <p>Média mensal, desvio padrão e a estimativa de gastos do próximo mês.</p>
        </div>
        <svg class="report-chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Gastos mensais com previsão (exemplo)">
          <defs>
            <linearGradient id="bento-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#e8b24a" stop-opacity="0.22" />
              <stop offset="1" stop-color="#e8b24a" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path :d="band" fill="url(#bento-band)" />
          <path ref="actualLine" :d="actual" fill="none" stroke="#34b585" stroke-width="3" stroke-linecap="round" />
          <path :d="projected" fill="none" stroke="#e8b24a" stroke-width="2.5" stroke-dasharray="4 7" stroke-linecap="round" />
          <circle :cx="pts[split]!.x" :cy="pts[split]!.y" r="5" fill="#34b585" />
          <circle :cx="pts[split + 1]!.x" :cy="pts[split + 1]!.y" r="5" fill="#101211" stroke="#e8b24a" stroke-width="2" />
        </svg>
      </article>

      <article v-reveal="1" v-spotlight class="cell cell--quick spotlight">
        <h3>Lançamentos em segundos</h3>
        <p>Valor, descrição e pronto.</p>
        <p class="quick-figure figure"><AnimatedNumber :value="1280" :format="formatCurrency" :duration="1800" /></p>
      </article>

      <article v-reveal="2" v-spotlight class="cell cell--recurring spotlight">
        <h3>Despesas fixas no automático</h3>
        <p>Aluguel, salários e assinaturas entram sozinhos quando a data chega.</p>
      </article>

      <article v-reveal v-spotlight class="cell cell--tags spotlight">
        <div class="cell-copy">
          <h3>Organização por tags</h3>
          <p>Rotule transações e filtre qualquer relatório pelo rótulo.</p>
        </div>
        <ul class="tag-cloud" aria-hidden="true">
          <li v-for="tag in tags" :key="tag.name" class="tag" :style="{ '--tag-color': tag.color }">{{ tag.name }}</li>
        </ul>
      </article>

      <article v-reveal="1" v-spotlight class="cell cell--team spotlight">
        <div class="cell-copy">
          <h3>Equipe na mesma página</h3>
          <p>Convide sócios e colaboradores como owner, admin ou viewer.</p>
        </div>
        <dl class="roles" aria-hidden="true">
          <div v-for="item in roles" :key="item.role">
            <dt>{{ item.role }}</dt>
            <dd>{{ item.scope }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* 6 colunas x 3 linhas: relatorio 4x2 + dois blocos 2x1 + dois blocos 3x1 = 18 celulas, sem vazios. */
.bento {
  display: grid;
  grid-auto-flow: dense;
  gap: var(--space-4);
}

@media (min-width: 900px) {
  .bento {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-auto-rows: minmax(190px, auto);
  }

  .cell--report {
    grid-column: span 4;
    grid-row: span 2;
  }

  .cell--quick,
  .cell--recurring {
    grid-column: span 2;
  }

  .cell--tags,
  .cell--team {
    grid-column: span 3;
  }
}

.cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, var(--color-surface-2), var(--color-surface));
  transition: border-color var(--duration) ease;
}

.cell:hover {
  border-color: var(--color-border-strong);
}

.cell h3 {
  font-size: var(--text-lg);
  font-weight: 600;
}

.cell p {
  max-width: 44ch;
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text-muted);
}

.cell-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Relatorio: painel grande com gradiente proprio. */
.cell--report {
  justify-content: space-between;
  background: var(--gradient-panel);
}

.report-chart {
  width: 100%;
  height: auto;
  margin-top: var(--space-4);
  overflow: visible;
}

/* Lancamento rapido: o valor e a imagem. */
.cell--quick {
  justify-content: flex-start;
}

.cell .quick-figure {
  margin-top: auto;
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  font-weight: 500;
  line-height: 1.1;
  color: var(--color-text);
}

/* Fixas: fundo pontilhado, ritmo de calendario. */
.cell--recurring {
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(180deg, var(--color-surface-2), var(--color-surface));
  background-size: 18px 18px, auto;
}

/* Tags: tinta esmeralda. */
.cell--tags {
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(52, 181, 133, 0.06), transparent 60%), var(--color-surface);
  border-color: var(--color-primary-ring);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.cell--team {
  justify-content: space-between;
}

.roles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.roles div {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-strong);
}

.roles dt {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-primary);
}

.roles dd {
  margin-top: 2px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
</style>
