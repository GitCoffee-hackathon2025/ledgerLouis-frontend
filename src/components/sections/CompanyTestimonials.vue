<script setup lang="ts">
import gitcoffeImg from '@/assets/img/Gitcoffeimg.png';
import healthupImg from '@/assets/img/healthupimg.png';
import aquaImg from '@/assets/img/AQUAimg.png';

const featured = {
  name: 'AQUA',
  niche: 'Dados hidrometeorológicos',
  quote: 'A melhor ferramenta para controle de fluxo de caixa que já utilizamos. Ganhamos o Hackathon por causa dela.',
  image: aquaImg,
};

const others = [
  {
    name: 'GitCoffe',
    niche: 'Empresa de software',
    quote: 'O Ledger Louis trouxe uma clareza financeira que nunca tivemos. Interface intuitiva e prática.',
    image: gitcoffeImg,
  },
  {
    name: 'HealthUp',
    niche: 'Saúde e bem-estar',
    quote: 'Gerenciar os custos fixos ficou muito mais simples no nosso dia a dia.',
    image: healthupImg,
  },
];
</script>

<template>
  <section class="section">
    <header class="section-heading">
      <h2>Empresas que já usam o <span class="gradient-text">Ledger Louis</span></h2>
    </header>

    <div class="voices">
      <figure v-reveal class="voice voice--featured">
        <blockquote>{{ featured.quote }}</blockquote>
        <figcaption>
          <img :src="featured.image" :alt="`Logo ${featured.name}`" loading="lazy" />
          <div>
            <strong>{{ featured.name }}</strong>
            <span>{{ featured.niche }}</span>
          </div>
        </figcaption>
      </figure>

      <figure v-for="(item, index) in others" :key="item.name" v-reveal="index + 1" class="voice">
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
/* Um depoimento em destaque (2 linhas) e dois menores empilhados ao lado. */
.voices {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 900px) {
  .voices {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }

  .voice--featured {
    grid-row: span 2;
  }
}

.voice {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, var(--color-surface-2), var(--color-surface));
}

.voice--featured {
  padding: clamp(var(--space-6), 4vw, var(--space-10));
  background: var(--gradient-panel);
  border-color: var(--color-primary-ring);
}

blockquote {
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.voice--featured blockquote {
  font-size: clamp(1.4rem, 3vw, 2.15rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.035em;
}

figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

figcaption img {
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  object-fit: cover;
}

figcaption div {
  display: flex;
  flex-direction: column;
}

figcaption strong {
  font-size: var(--text-sm);
  font-weight: 600;
}

figcaption span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
