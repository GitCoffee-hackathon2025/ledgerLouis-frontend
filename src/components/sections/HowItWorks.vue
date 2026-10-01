<script setup lang="ts">
import { ref } from 'vue';
import { useGsapScope } from '@/composables/useGsapScope';

const steps = [
  {
    title: 'Cadastre',
    description: 'Crie sua conta e monte a empresa em menos de um minuto, sem burocracia.',
  },
  {
    title: 'Lance',
    description: 'Registre o que entra e o que sai em poucos toques e deixe as despesas fixas no automático.',
  },
  {
    title: 'Entenda',
    description: 'Relatórios e gráficos claros mostram para onde o dinheiro vai e o que esperar do próximo mês.',
  },
];

const root = ref<HTMLElement>();

// A linha de progresso acompanha a leitura da lista; cada etapa acende ao chegar no centro da tela.
useGsapScope(root, ({ gsap }) => {
  gsap.fromTo(
    '.timeline-fill',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.steps-wrap', start: 'top 60%', end: 'bottom 60%', scrub: true },
    },
  );

  gsap.utils.toArray<HTMLElement>('.step').forEach((step) => {
    gsap.fromTo(
      step,
      { opacity: 0.35 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: step, start: 'top 75%', end: 'top 50%', scrub: true },
      },
    );
  });
});
</script>

<template>
  <section ref="root" class="section how">
    <div class="how-layout">
      <header class="how-heading">
        <h2>Do cadastro ao primeiro relatório, em minutos</h2>
      </header>

      <div class="steps-wrap">
        <span class="timeline" aria-hidden="true"><span class="timeline-fill" /></span>
        <ol class="steps">
        <li v-for="step in steps" :key="step.title" class="step">
          <span class="step-marker" aria-hidden="true" />
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-layout {
  display: grid;
  gap: var(--space-10);
}

@media (min-width: 900px) {
  .how-layout {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
    gap: var(--space-12);
    align-items: start;
  }

  /* O titulo fica preso enquanto a lista passa. */
  .how-heading {
    position: sticky;
    top: calc(var(--topbar-height) + var(--space-10));
  }
}

.how-heading h2 {
  max-width: 14ch;
  font-size: clamp(2rem, 4.4vw, 3.4rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.steps-wrap {
  position: relative;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: clamp(64px, 12vw, 140px);
  padding-left: 56px;
}

.timeline {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 17px;
  width: 2px;
  background: var(--color-border-strong);
}

.timeline-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  box-shadow: 0 0 10px rgba(52, 181, 133, 0.55);
  transform-origin: top;
}

.step {
  position: relative;
}

.step-marker {
  position: absolute;
  left: -43px;
  top: 14px;
  width: 11px;
  height: 11px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  background: var(--color-bg);
}

.step h3 {
  margin-bottom: var(--space-2);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.035em;
}

.step p {
  max-width: 44ch;
  line-height: 1.65;
  color: var(--color-text-muted);
}
</style>
