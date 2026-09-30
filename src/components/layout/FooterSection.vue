<script setup lang="ts">
import AppLogo from './AppLogo.vue';

const year = new Date().getFullYear();

const groups = [
  {
    title: 'Produto',
    links: [
      { to: '/', label: 'Início' },
      { to: '/company', label: 'Empresas' },
      { to: '/reports', label: 'Relatórios' },
    ],
  },
  {
    title: 'Conta',
    links: [
      { to: '/entrar', label: 'Entrar' },
      { to: '/cadastro', label: 'Criar conta' },
    ],
  },
];
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <AppLogo />
        <p>Controle financeiro simples para empresas que querem crescer.</p>
      </div>

      <nav v-for="group in groups" :key="group.title" class="footer-links" :aria-label="group.title">
        <p class="footer-title">{{ group.title }}</p>
        <RouterLink v-for="link in group.links" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
      </nav>
    </div>

    <p class="footer-bottom">© {{ year }} Ledger Louis · Feito pela equipe GitCoffee.</p>
  </footer>
</template>

<style scoped>
.footer {
  padding: var(--space-10) var(--space-5) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.footer-inner {
  display: grid;
  gap: var(--space-8);
  max-width: var(--shell-width);
  margin: 0 auto;
}

@media (min-width: 700px) {
  .footer-inner {
    grid-template-columns: 2fr 1fr 1fr;
  }
}

.footer-brand p {
  max-width: 320px;
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-title {
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.footer-links a {
  width: fit-content;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  transition: color var(--duration-fast) ease;
}

.footer-links a:hover {
  color: var(--color-primary-strong);
}

.footer-bottom {
  max-width: var(--shell-width);
  margin: var(--space-8) auto 0;
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}
</style>
