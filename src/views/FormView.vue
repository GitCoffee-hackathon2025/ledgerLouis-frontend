<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { BarChart3, Repeat, ShieldCheck } from 'lucide-vue-next';
import AuthLogin from '@/components/forms/AuthLogin.vue';
import AuthRegister from '@/components/forms/AuthRegister.vue';
import NavAuth from '@/components/forms/NavAuth.vue';
import AppLogo from '@/components/layout/AppLogo.vue';

const route = useRoute();
const isLogin = computed(() => route.meta.tab === 'login');

const highlights = [
  { icon: BarChart3, text: 'Relatórios com média, desvio e previsão do próximo mês' },
  { icon: Repeat, text: 'Despesas fixas lançadas automaticamente' },
  { icon: ShieldCheck, text: 'Equipe com papéis de owner, admin e viewer' },
];
</script>

<template>
  <div class="auth-page">
    <aside class="auth-aside" aria-hidden="true">
      <div class="aside-glow" />
      <AppLogo inverted />
      <div class="aside-copy">
        <h2>As finanças da sua empresa, <span class="gradient-text">sem planilha.</span></h2>
        <ul class="aside-list">
          <li v-for="item in highlights" :key="item.text">
            <span class="aside-icon"><component :is="item.icon" :size="16" /></span>
            {{ item.text }}
          </li>
        </ul>
      </div>
      <p class="aside-footer">Feito pela equipe GitCoffee.</p>
    </aside>

    <main class="auth-main">
      <div class="auth-container">
        <header>
          <h1>{{ isLogin ? 'Bem-vindo de volta' : 'Crie sua conta' }}</h1>
          <p class="auth-description">
            {{
              isLogin
                ? 'Entre com seu e-mail e senha para continuar.'
                : 'Leva menos de um minuto para organizar as finanças do seu negócio.'
            }}
          </p>
        </header>

        <NavAuth :active-tab="isLogin ? 'login' : 'register'" />

        <AuthLogin v-if="isLogin" />
        <AuthRegister v-else />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: calc(100vh - var(--topbar-height) - var(--bottom-nav-height));
}

@media (min-width: 1024px) {
  .auth-page {
    grid-template-columns: minmax(380px, 0.9fr) 1.1fr;
    min-height: calc(100vh - var(--topbar-height));
  }
}

.auth-aside {
  display: none;
}

@media (min-width: 1024px) {
  .auth-aside {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--space-10);
    background: var(--gradient-ink);
    color: #fff;
  }
}

.aside-glow {
  position: absolute;
  width: 420px;
  height: 420px;
  right: -160px;
  top: -120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(50, 213, 131, 0.35), transparent 65%);
  pointer-events: none;
}

.aside-copy {
  position: relative;
  max-width: 400px;
}

.aside-copy h2 {
  margin-bottom: var(--space-8);
  font-size: clamp(1.8rem, 2.6vw, 2.4rem);
  font-weight: 800;
  color: #fff;
}

.aside-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.aside-list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: rgba(255, 255, 255, 0.78);
}

.aside-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #4ade94;
}

.aside-footer {
  position: relative;
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.45);
}

.auth-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-4);
}

.auth-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 400px;
}

.auth-container h1 {
  font-size: var(--text-2xl);
  font-weight: 800;
}

.auth-description {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
}
</style>
