<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';

defineEmits<{ signup: [] }>();
</script>

<template>
  <section class="cta-wrap">
    <div class="cta">
      <div class="cta-glow" aria-hidden="true" />
      <h2>E agora, já se <span class="gradient-text">decidiu?</span></h2>
      <p>Entre no Ledger Louis agora mesmo. É gratuito, simples e focado no que importa: o seu lucro.</p>
      <BaseButton size="lg" @click="$emit('signup')">
        Começar agora
        <ArrowRight :size="18" />
      </BaseButton>
      <span class="cta-note">Sempre grátis para começar · sem cartão de crédito</span>
    </div>
  </section>
</template>

<style scoped>
.cta-wrap {
  padding: var(--space-12) var(--space-5) 96px;
}

.cta {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 880px;
  margin: 0 auto;
  padding: var(--space-12) var(--space-6);
  border-radius: 28px;
  background: var(--gradient-ink);
  box-shadow: var(--shadow-lg);
  text-align: center;
  isolation: isolate;
}

.cta-glow {
  position: absolute;
  z-index: -1;
  width: 520px;
  height: 260px;
  top: -140px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(50, 213, 131, 0.3);
  filter: blur(80px);
}

.cta h2 {
  font-size: clamp(1.75rem, 4vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fff;
}

.cta p {
  max-width: 46ch;
  margin-bottom: var(--space-3);
  color: rgba(255, 255, 255, 0.68);
}

.cta-note {
  font-size: var(--text-xs);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
}
</style>
