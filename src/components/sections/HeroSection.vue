<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import HeroLedger from './HeroLedger.vue';
import { useGsapScope } from '@/composables/useGsapScope';

defineEmits<{ signup: [] }>();

const root = ref<HTMLElement>();

const scrollToFeatures = () => {
  document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
};

// Entrada em sequencia: titulo, texto, acoes. Hierarquia de leitura, nao enfeite.
useGsapScope(root, ({ gsap }) => {
  gsap
    .timeline({ defaults: { ease: 'power4.out' } })
    .from('.hero-line', { yPercent: 110, duration: 1.1, stagger: 0.12 })
    .from('.hero-description', { opacity: 0, y: 16, duration: 0.8 }, '-=0.7')
    .from('.hero-actions > *', { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, '-=0.6');
});
</script>

<template>
  <section ref="root" class="hero">
    <div class="hero-inner">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-mask"><span class="hero-line">Transforme suas</span></span>
          <span class="hero-mask"><span class="hero-line"><em>finanças</em> em resultados</span></span>
        </h1>

        <p class="hero-description">
          Registre entradas e saídas em segundos, automatize despesas fixas e veja a previsão do próximo mês.
        </p>

        <div class="hero-actions">
          <BaseButton v-magnetic="6" size="lg" @click="$emit('signup')">
            Começar gratuitamente
            <ArrowRight :size="18" />
          </BaseButton>
          <BaseButton variant="secondary" size="lg" @click="scrollToFeatures">Conhecer recursos</BaseButton>
        </div>
      </div>

      <HeroLedger />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  min-height: calc(100dvh - var(--topbar-height));
  padding: var(--space-10) var(--space-5) 96px;
}

.hero-inner {
  display: grid;
  gap: var(--space-12);
  align-items: center;
  width: 100%;
  max-width: var(--shell-width);
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: var(--space-8);
  }
}

.hero-title {
  margin-bottom: var(--space-5);
  font-size: clamp(2.5rem, 5.6vw, 5rem);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: -0.05em;
}

/* Cada linha nasce de uma mascara: a subida revela o texto sem mover o layout. */
.hero-mask {
  display: block;
  overflow: hidden;
  padding-bottom: 0.12em;
  margin-bottom: -0.12em;
}

.hero-line {
  display: block;
}

.hero-title em {
  font-style: normal;
  color: var(--color-primary);
}

.hero-description {
  max-width: 46ch;
  margin-bottom: var(--space-8);
  font-size: clamp(1rem, 1.5vw, 1.1875rem);
  line-height: 1.65;
  color: var(--color-text-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
