import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/FormView.vue'),
      meta: { tab: 'register' },
    },
    {
      path: '/entrar',
      name: 'entrar',
      component: () => import('../views/FormView.vue'),
      meta: { tab: 'login' },
    },
    {
      path: '/management',
      name: 'management',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Gerenciamento', description: 'Visão geral das suas finanças e controles.' },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Relatórios', description: 'Acompanhe seu desempenho financeiro mês a mês.' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Configurações', description: 'Ajuste seu perfil e preferências do app.' },
    },
    {
      path: '/add/income',
      name: 'addIncome',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Adicionar Entrada', description: 'Cadastre uma nova entrada financeira.' },
    },
    {
      path: '/add/expense',
      name: 'addExpense',
      component: () => import('../views/PlaceholderView.vue'),
      meta: { title: 'Adicionar Saída', description: 'Cadastre uma nova despesa financeira.' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../views/PlaceholderView.vue'),
      meta: {
        title: 'Página não encontrada',
        description: 'A rota que você tentou acessar não existe. Volte ao início para continuar.',
      },
    },
    {
      path: '/userInfo',
      name: 'userInfo',
      component: () => import('../views/UserInfoView.vue'),
      meta: { title: 'Informações do Usuário', description: 'Visualize e edite suas informações pessoais.' },
    }
  ],
});

export default router;

