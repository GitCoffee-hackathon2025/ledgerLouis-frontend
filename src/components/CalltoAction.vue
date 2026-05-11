<template>
  <section class="decision-cta">
    <div class="cta-content">
      <h2 class="cta-title">E agora, já se <span class="highlight">decidiu?</span></h2>
      <p class="cta-subtitle">
        Entre no <span class="brand-text">Ledger Louis</span> agora mesmo. É gratuito, simples e focado no que importa: seu lucro.
      </p>

      <button class="btn-signup-cta" @click="$emit('signup')">
        Começar agora
      </button>
      
      <p class="free-badge">Sempre grátis para começar</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Emitindo o mesmo evento do seu Hero para manter o padrão
defineEmits(['signup']);
</script>

<style scoped>
.decision-cta {
  background-color: var(--color-surface);
  padding: 60px 25px;
  text-align: left; /* Mantendo o alinhamento à esquerda igual ao seu Hero */
}

.cta-content {
  max-width: 400px;
}

h2.cta-title {
  font-size: 26px;
  color: var(--color-success-dark);
  margin-bottom: 12px;
  line-height: 1.2;
}

.highlight {
  display: block; /* Quebra de linha igual ao "Louis" do seu Hero */
}

.cta-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.brand-text {
  color: var(--color-success-dark);
  font-weight: 600;
}

.btn-signup-cta {
  background: var(--color-success-gradient);
  color: var(--color-surface);
  border: none;
  padding: 12px 35px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-signup-cta:active {
  transform: scale(0.96);
}

.free-badge {
  display: block;
  margin-top: 15px;
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>