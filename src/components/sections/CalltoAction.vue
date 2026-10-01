<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';

defineEmits<{ signup: [] }>();
</script>

<template>
  <section class="cta">
    <div class="cta-glow" aria-hidden="true" />
    <h2 v-reveal>Pronto para ver o caixa com clareza?</h2>
    <p v-reveal="1">É gratuito, simples e funciona como app instalado no celular.</p>
    <div v-reveal="2" class="cta-action">
      <BaseButton v-magnetic="8" size="lg" @click="$emit('signup')">
        Começar gratuitamente
        <ArrowRight :size="18" />
      </BaseButton>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  max-width: var(--shell-width);
  margin: clamp(80px, 12vw, 160px) auto 0;
  padding: 0 var(--space-5) clamp(80px, 12vw, 160px);
  isolation: isolate;
}

.cta-glow {
  position: absolute;
  z-index: -1;
  left: 50%;
  bottom: 0;
  width: min(900px, 100%);
  height: 340px;
  transform: translateX(-50%);
  background: radial-gradient(50% 60% at 50% 100%, rgba(52, 181, 133, 0.07), transparent 70%);
  pointer-events: none;
}

.cta h2 {
  max-width: 14ch;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 0.98;
}

.cta p {
  max-width: 40ch;
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}
</style>
