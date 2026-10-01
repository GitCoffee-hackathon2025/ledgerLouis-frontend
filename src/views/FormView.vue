<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AuthLogin from '@/components/forms/AuthLogin.vue';
import AuthRegister from '@/components/forms/AuthRegister.vue';
import NavAuth from '@/components/forms/NavAuth.vue';

const route = useRoute();
const isLogin = computed(() => route.meta.tab === 'login');

// Direcao da troca: ir para "Criar conta" empurra o conteudo para a esquerda; voltar, para a direita.
const direction = ref(1);
watch(isLogin, (login) => (direction.value = login ? -1 : 1), { flush: 'sync' });

// O formulario de cadastro e mais alto que o de login: a altura anima em vez de saltar.
const swapBox = ref<HTMLElement>();
let heightBefore = 0;

const onBeforeLeave = () => {
  heightBefore = swapBox.value?.offsetHeight ?? 0;
};

const onEnter = () => {
  const box = swapBox.value;
  if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heightAfter = box.offsetHeight;
  if (heightAfter === heightBefore) return;
  // Recorta so durante o movimento, para nao cortar o halo de foco dos campos depois.
  box.classList.add('is-resizing');
  box
    .animate([{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }], {
      duration: 420,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    })
    .finished.finally(() => box.classList.remove('is-resizing'));
};

const highlights = [
  { title: 'Relatórios com previsão', text: 'Média, desvio padrão e a estimativa de gastos do próximo mês.' },
  { title: 'Despesas fixas no automático', text: 'Aluguel, salários e assinaturas lançados na data certa.' },
  { title: 'Equipe com papéis', text: 'Owner, admin e viewer, cada um com o acesso que precisa.' },
];
</script>

<template>
  <div class="auth-page">
    <aside class="auth-aside" aria-hidden="true">
      <div class="aside-aurora" />

      <h2 class="aside-title">As finanças da sua empresa, <span class="gradient-text">sem planilha.</span></h2>

      <ul class="aside-list">
        <li v-for="(item, index) in highlights" :key="item.title" :style="{ '--i': index }">
          <strong>{{ item.title }}</strong>
          <span>{{ item.text }}</span>
        </li>
      </ul>

      <p class="aside-footer">Feito pela equipe GitCoffee.</p>
    </aside>

    <main class="auth-main">
      <div class="auth-container" :style="{ '--dir': direction }">
        <Transition name="auth-swap" mode="out-in">
          <header :key="String(isLogin)">
            <h1>{{ isLogin ? 'Bem-vindo de volta' : 'Crie sua conta' }}</h1>
            <p class="auth-description">
              {{
                isLogin
                  ? 'Entre com seu e-mail e senha para continuar.'
                  : 'Leva menos de um minuto para organizar as finanças do seu negócio.'
              }}
            </p>
          </header>
        </Transition>

        <NavAuth :active-tab="isLogin ? 'login' : 'register'" />

        <div ref="swapBox" class="auth-swap-box">
          <Transition name="auth-swap" mode="out-in" @before-leave="onBeforeLeave" @enter="onEnter">
            <AuthLogin v-if="isLogin" key="login" />
            <AuthRegister v-else key="register" />
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: calc(100dvh - var(--topbar-height));
  padding-top: 0;
}

@media (min-width: 1024px) {
  .auth-page {
    grid-template-columns: minmax(420px, 1fr) minmax(0, 1fr);
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
    gap: var(--space-10);
    padding: var(--space-12);
    border-right: 1px solid var(--color-border);
    background: var(--gradient-panel);
    isolation: isolate;
  }
}

/* Aurora: duas manchas grandes e lentas atras do texto. So transform, barato para a GPU. */
.aside-aurora {
  position: absolute;
  inset: -20%;
  z-index: -1;
  background:
    radial-gradient(38% 34% at 72% 70%, rgba(52, 181, 133, 0.17), transparent 70%),
    radial-gradient(30% 28% at 18% 18%, rgba(52, 181, 133, 0.09), transparent 70%);
  animation: aurora-drift 22s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes aurora-drift {
  from {
    transform: translate3d(-3%, -2%, 0) scale(1);
  }
  to {
    transform: translate3d(4%, 3%, 0) scale(1.08);
  }
}

/* Titulo no topo, argumentos ancorados embaixo: o texto ocupa a coluna de ponta a ponta. */
.aside-title {
  max-width: 14ch;
  font-size: clamp(2.5rem, 4.2vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.05em;
  line-height: 1.02;
}

.aside-list {
  display: flex;
  flex-direction: column;
  max-width: 460px;
}

.aside-list li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--space-5) 0;
  border-top: 1px solid var(--color-border-strong);
}

.aside-list strong {
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.aside-list span {
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--color-text-muted);
}

.aside-title,
.aside-list li,
.aside-footer {
  animation: aside-in 700ms var(--ease-out) backwards;
}

.aside-list li {
  animation-delay: calc(120ms + var(--i) * 90ms);
}

.aside-footer {
  animation-delay: 480ms;
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}

@keyframes aside-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
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
  max-width: 420px;
  padding: var(--space-8) var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.auth-container header {
  /* Reserva duas linhas de descricao: a altura do cartao so muda pelo formulario, que anima. */
  min-height: calc(var(--text-2xl) * 1.15 + var(--space-2) + 2 * 1.55 * var(--text-base));
}

.auth-container h1 {
  font-size: var(--text-2xl);
  font-weight: 600;
}

.auth-swap-box.is-resizing {
  overflow: hidden;
}

/* Saida rapida, entrada mais lenta: o olho acompanha o que chega, nao o que sai. */
.auth-swap-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease-in;
}

.auth-swap-enter-active {
  transition:
    opacity 360ms var(--ease-out),
    transform 460ms var(--ease-out);
}

.auth-swap-enter-from {
  opacity: 0;
  transform: translateX(calc(var(--dir) * 28px));
}

.auth-swap-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--dir) * -28px));
}

/* Campos sobem em cascata ao entrar. */
.auth-swap-box :deep(.auth-swap-enter-active > *) {
  animation: auth-field-in 520ms var(--ease-out) backwards;
}

.auth-swap-box :deep(.auth-swap-enter-active > :nth-child(2)) {
  animation-delay: 50ms;
}

.auth-swap-box :deep(.auth-swap-enter-active > :nth-child(3)) {
  animation-delay: 100ms;
}

.auth-swap-box :deep(.auth-swap-enter-active > :nth-child(4)) {
  animation-delay: 150ms;
}

.auth-swap-box :deep(.auth-swap-enter-active > :nth-child(5)) {
  animation-delay: 200ms;
}

@keyframes auth-field-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

.auth-description {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
}
</style>
