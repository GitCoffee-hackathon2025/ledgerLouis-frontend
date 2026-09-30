<script setup lang="ts">
import { ArrowRight, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';

defineEmits<{ signup: [] }>();

const stats = [
  { value: '100%', label: 'Gratuito' },
  { value: '24/7', label: 'Na nuvem' },
  { value: '5 min', label: 'Para começar' },
];

const bars = [42, 58, 36, 70, 52, 84, 66];

const scrollToFeatures = () => {
  document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<template>
  <section class="hero">
    <div class="hero-grid" aria-hidden="true" />
    <div class="hero-glow hero-glow--1" aria-hidden="true" />
    <div class="hero-glow hero-glow--2" aria-hidden="true" />

    <div class="hero-inner">
      <div class="hero-content">
        <span class="hero-pill">
          <span class="hero-pill-dot" />
          Gestão financeira para pequenas empresas
        </span>

        <h1 class="hero-title">
          Transforme suas <span class="gradient-text">finanças</span> em resultados
        </h1>

        <p class="hero-description">
          Registre entradas e saídas em segundos, automatize despesas fixas e acompanhe relatórios com previsão do
          próximo mês — tudo em um só lugar, com sua equipe.
        </p>

        <div class="hero-actions">
          <BaseButton size="lg" @click="$emit('signup')">
            Começar gratuitamente
            <ArrowRight :size="18" />
          </BaseButton>
          <button type="button" class="hero-secondary" @click="scrollToFeatures">Conhecer recursos</button>
        </div>

        <dl class="hero-stats">
          <div v-for="stat in stats" :key="stat.label">
            <dt>{{ stat.label }}</dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="mock mock--main">
          <div class="mock-head">
            <span class="mock-label">Saldo total</span>
            <span class="mock-trend"><TrendingUp :size="13" /> +12,5%</span>
          </div>
          <p class="mock-balance">R$ 48.920,00</p>
          <div class="mock-bars">
            <span v-for="(height, index) in bars" :key="index" :style="{ height: `${height}%` }" />
          </div>
        </div>

        <div class="mock mock--float mock--income">
          <span class="mock-icon"><ArrowUpRight :size="16" /></span>
          <div>
            <p>Venda · Loja</p>
            <strong>+ R$ 2.450,00</strong>
          </div>
        </div>

        <div class="mock mock--float mock--expense">
          <span class="mock-icon"><ArrowDownRight :size="16" /></span>
          <div>
            <p>Aluguel · recorrente</p>
            <strong>- R$ 3.200,00</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: calc(100vh - var(--topbar-height));
  padding: var(--space-12) var(--space-5) 88px;
  background: var(--gradient-ink);
  color: #fff;
  isolation: isolate;
}

.hero-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%);
}

.hero-glow {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.hero-glow--1 {
  width: 480px;
  height: 480px;
  top: -160px;
  right: -120px;
  background: rgba(50, 213, 131, 0.35);
}

.hero-glow--2 {
  width: 360px;
  height: 360px;
  bottom: -160px;
  left: -120px;
  background: rgba(18, 183, 106, 0.22);
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
    grid-template-columns: 1.1fr 0.9fr;
  }
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-6);
  padding: 6px 14px 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  font-size: var(--text-sm);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.hero-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #32d583;
  box-shadow: 0 0 0 4px rgba(50, 213, 131, 0.2);
}

.hero-title {
  max-width: 14ch;
  margin-bottom: var(--space-5);
  font-size: var(--text-3xl);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: #fff;
}

.hero-description {
  max-width: 52ch;
  margin-bottom: var(--space-8);
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.68);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-10);
}

.hero-secondary {
  min-height: 52px;
  padding: 0 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  font-weight: 700;
  color: #fff;
  transition: background-color var(--duration-fast) ease, border-color var(--duration-fast) ease;
}

.hero-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.hero-stats div {
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
}

.hero-stats dd {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.hero-stats dt {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.5);
}

/* Mockup */
.hero-visual {
  position: relative;
  display: none;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .hero-visual {
    display: block;
  }
}

.mock {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
}

.mock--main {
  padding: var(--space-6);
}

.mock-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mock-label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
}

.mock-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(50, 213, 131, 0.16);
  font-size: var(--text-xs);
  font-weight: 700;
  color: #4ade94;
}

.mock-balance {
  margin: var(--space-2) 0 var(--space-6);
  font-family: var(--font-display);
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.mock-bars {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 140px;
}

.mock-bars span {
  flex: 1;
  border-radius: 8px 8px 3px 3px;
  background: linear-gradient(180deg, #32d583 0%, rgba(18, 183, 106, 0.35) 100%);
  transform-origin: bottom;
  animation: grow 900ms var(--ease-out) both;
}

.mock-bars span:nth-child(2n) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%);
}

.mock-bars span:nth-child(1) { animation-delay: 60ms; }
.mock-bars span:nth-child(2) { animation-delay: 120ms; }
.mock-bars span:nth-child(3) { animation-delay: 180ms; }
.mock-bars span:nth-child(4) { animation-delay: 240ms; }
.mock-bars span:nth-child(5) { animation-delay: 300ms; }
.mock-bars span:nth-child(6) { animation-delay: 360ms; }
.mock-bars span:nth-child(7) { animation-delay: 420ms; }

@keyframes grow {
  from {
    transform: scaleY(0);
  }
}

.mock--float {
  position: absolute;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: rgba(17, 24, 39, 0.78);
  animation: float 6s ease-in-out infinite;
}

.mock--float p {
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.6);
}

.mock--float strong {
  font-size: var(--text-sm);
}

.mock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}

.mock--income {
  top: 44%;
  right: -44px;
}

.mock--income .mock-icon {
  background: rgba(50, 213, 131, 0.18);
  color: #4ade94;
}

.mock--expense {
  bottom: -30px;
  left: -44px;
  animation-delay: -3s;
}

.mock--expense .mock-icon {
  background: rgba(255, 107, 110, 0.18);
  color: #ff8587;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
