<template>
  <section class="hero">
    <div class="banner-container">
      <img src="@/assets/hero-banner.png" alt="Banner Ledger" class="banner-img" />
    </div>

    <div class="hero-content">
      <h1>Bem vindo ao Ledger <span class="user-name">Louis</span></h1>
      <p class="hero-subtitle">
        Sua gestão financeira simplificada, prática e direto ao ponto.
      </p>

      <button class="btn-signup" @click="$emit('signup')">
        Cadastre-se
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background-color: var(--color-surface);
  padding-bottom: 2rem;
}

.banner-img {
  width: 100%;
  height: auto;
  display: block;
}

.hero-content {
  padding: 0 25px;
  margin-top: 20px;
}

h1 {
  font-size: 26px;
  color: var(--color-success-dark);
  margin-bottom: 12px;
  line-height: 1.2;
}

.user-name {
  display: block;
}

.hero-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}

.btn-signup {
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

.btn-signup:active {
  transform: scale(0.96);
}
</style>
