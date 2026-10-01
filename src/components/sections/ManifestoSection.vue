<script setup lang="ts">
import { ref } from 'vue';
import { useGsapScope } from '@/composables/useGsapScope';

const text =
  'Cada entrada e cada saída conta uma parte da história da sua empresa. O Ledger Louis junta tudo em uma leitura clara do caixa, do primeiro real ao fechamento do mês.';
const words = text.split(' ');

const root = ref<HTMLElement>();

// As palavras acendem conforme a rolagem avanca: o ritmo de leitura vira o ritmo da pagina.
useGsapScope(root, ({ gsap }) => {
  gsap.from('.manifesto-word', {
    opacity: 0.14,
    ease: 'none',
    stagger: 0.1,
    scrollTrigger: {
      trigger: root.value,
      start: 'top 78%',
      end: 'bottom 55%',
      scrub: true,
    },
  });
});
</script>

<template>
  <section ref="root" class="section manifesto">
    <p class="manifesto-text">
      <span v-for="(word, index) in words" :key="index" class="manifesto-word">{{ word }}</span>
    </p>
  </section>
</template>

<style scoped>
.manifesto-text {
  font-size: clamp(1.75rem, 4.6vw, 3.75rem);
  font-weight: 500;
  line-height: 1.12;
  letter-spacing: -0.04em;
  max-width: 20em;
  text-wrap: pretty;
}

/* Sem espaco entre os spans (o compilador remove): a margem faz o papel do espaco. */
.manifesto-word {
  display: inline-block;
  margin-right: 0.26em;
}
</style>
