import { createRouter, createWebHistory } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    description?: string;
    /** Rota só faz sentido com uma empresa selecionada; sem ela, vai para /company. */
    requiresCompany?: boolean;
    /** Aba inicial da tela de autenticação. */
    tab?: 'login' | 'register';
    /** Tipo de lançamento da tela de nova transação. */
    entryType?: 'credit' | 'debit';
  }
}

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
      path: '/entrar',
      name: 'entrar',
      component: () => import('../views/FormView.vue'),
      meta: { title: 'Entrar', tab: 'login' },
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/FormView.vue'),
      meta: { title: 'Criar conta', tab: 'register' },
    },

    // Empresa
    {
      path: '/company',
      name: 'company',
      component: () => import('../views/CompanyOnboardingView.vue'),
      meta: { title: 'Empresas' },
    },
    {
      path: '/company/create',
      name: 'companyCreate',
      component: () => import('../views/CompanyCreateView.vue'),
      meta: { title: 'Criar empresa' },
    },
    {
      path: '/company/settings',
      name: 'companySettings',
      component: () => import('../views/CompanySettingsView.vue'),
      meta: { title: 'Gerenciamento', requiresCompany: true },
    },
    {
      path: '/company/recurring',
      name: 'recurring',
      component: () => import('../views/RecurringTransactionsView.vue'),
      meta: { title: 'Lançamentos recorrentes', requiresCompany: true },
    },
    { path: '/management', redirect: { name: 'companySettings' } },

    // Convites
    {
      path: '/invitations',
      name: 'invitations',
      component: () => import('../views/InvitationsView.vue'),
      meta: { title: 'Convites' },
    },
    {
      path: '/invitations/:token',
      name: 'invitationDetails',
      component: () => import('../views/InvitationsView.vue'),
      meta: { title: 'Convite' },
    },

    // Finanças
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Relatórios', requiresCompany: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionsView.vue'),
      meta: { title: 'Transações', requiresCompany: true },
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/TagsManagementView.vue'),
      meta: { title: 'Tags', requiresCompany: true },
    },
    {
      path: '/add/income',
      name: 'addIncome',
      component: () => import('../views/TransactionFormView.vue'),
      meta: { title: 'Nova entrada', entryType: 'credit', requiresCompany: true },
    },
    {
      path: '/add/expense',
      name: 'addExpense',
      component: () => import('../views/TransactionFormView.vue'),
      meta: { title: 'Nova saída', entryType: 'debit', requiresCompany: true },
    },

    // Usuário
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/UserSettingsView.vue'),
      meta: { title: 'Configurações' },
    },
    { path: '/userInfo', redirect: { name: 'settings' } },

    {
      path: '/testUploader',
      name: 'testUploader',
      component: () => import('@/components/dev/UploaderTest.vue'),
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
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresCompany && !useCompanyStore().company.hasCompany) {
    return { name: 'company' };
  }
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Ledger Louis` : 'Ledger Louis';
});

export default router;
