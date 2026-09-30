<script setup lang="ts">
import { Quote } from 'lucide-vue-next';
import gitcoffeImg from '@/assets/img/Gitcoffeimg.png';
import healthupImg from '@/assets/img/healthupimg.png';
import aquaImg from '@/assets/img/AQUAimg.png';

const testimonials = [
  {
    name: 'GitCoffe',
    niche: 'Empresa de software',
    quote: 'O Ledger Louis trouxe uma clareza financeira que nunca tivemos. Interface muito intuitiva e prática.',
    image: gitcoffeImg,
  },
  {
    name: 'HealthUp',
    niche: 'Saúde e bem-estar',
    quote: 'Gerenciar os custos fixos ficou muito mais simples. Um benefício real para o nosso dia a dia.',
    image: healthupImg,
  },
  {
    name: 'AQUA',
    niche: 'Dados hidrometeorológicos',
    quote:
      'A melhor ferramenta para controle de fluxo de caixa que já utilizamos nos últimos anos. Ganhamos o Hackathon por causa dela.',
    image: aquaImg,
  },
];
</script>

<template>
  <section class="section">
    <header class="section-heading">
      <p class="section-eyebrow">Depoimentos</p>
      <h2>Empresas que já usam o <span class="gradient-text">Ledger Louis</span></h2>
    </header>

    <div class="testimonials">
      <figure v-for="item in testimonials" :key="item.name" class="testimonial">
        <Quote :size="22" class="testimonial-quote-icon" />
        <blockquote>{{ item.quote }}</blockquote>
        <figcaption>
          <img :src="item.image" :alt="`Logo ${item.name}`" loading="lazy" />
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.niche }}</span>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
/* Mobile: carrossel com scroll-snap; desktop: grade de 3 colunas. */
.testimonials {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(85%, 340px);
  gap: var(--space-4);
  margin: 0 calc(var(--space-5) * -1);
  padding: 4px var(--space-5) var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

@media (min-width: 900px) {
  .testimonials {
    grid-auto-flow: row;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    overflow: visible;
  }
}

.testimonial {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  scroll-snap-align: start;
}

.testimonial-quote-icon {
  color: var(--color-primary);
}

blockquote {
  flex: 1;
  line-height: 1.7;
  color: var(--color-text);
}

figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

figcaption img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

figcaption div {
  display: flex;
  flex-direction: column;
}

figcaption strong {
  font-size: var(--text-sm);
}

figcaption span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
