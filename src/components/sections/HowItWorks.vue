<script setup lang="ts">
const steps = [
  {
    title: 'Crie sua conta',
    description: 'Cadastre-se de graça e monte sua empresa em menos de um minuto, sem burocracia.',
  },
  {
    title: 'Registre o que entra e sai',
    description: 'Lance suas movimentações em poucos toques e deixe as fixas no automático.',
  },
  {
    title: 'Entenda para onde vai o dinheiro',
    description: 'Relatórios e gráficos claros para decidir com mais confiança.',
  },
];
</script>

<template>
  <section class="section how">
    <header class="section-heading">
      <p class="section-eyebrow">Como funciona</p>
      <h2>Do cadastro ao primeiro relatório, em minutos</h2>
    </header>

    <ol class="steps">
      <li v-for="(step, index) in steps" :key="step.title" class="step">
        <span class="step-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.description }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.steps {
  display: grid;
  gap: var(--space-4);
  counter-reset: step;
}

@media (min-width: 860px) {
  .steps {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.step {
  position: relative;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: var(--space-5);
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  box-shadow: var(--shadow-primary);
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--color-on-primary);
}

.step h3 {
  margin-bottom: var(--space-2);
  font-size: var(--text-lg);
}

.step p {
  font-size: var(--text-sm);
  line-height: 1.65;
  color: var(--color-text-muted);
}

/* Conector entre os passos no desktop */
@media (min-width: 860px) {
  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: calc(var(--space-6) + 22px);
    left: calc(var(--space-6) + 56px);
    right: calc(var(--space-4) * -1 + 8px);
    border-top: 2px dashed var(--color-border-strong);
  }
}
</style>
