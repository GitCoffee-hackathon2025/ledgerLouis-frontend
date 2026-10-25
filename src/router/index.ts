import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: '/company',
      name: 'company',
      component: () => import('../views/CompanyOnboardingView.vue'),
      meta: { title: 'Empresas', description: 'Escolha criar ou entrar em uma empresa.' },
    },
    {
      path: '/company/create',
      name: 'companyCreate',
      component: () => import('../views/CompanyCreateView.vue'),
      meta: { title: 'Criar Empresa', description: 'Informe os dados da sua empresa para começar.' },
    },
    {
      path: '/company/settings',
      name: 'companySettings',
      component: () => import('../views/CompanySettingsView.vue'),
      meta: { title: 'Configurações da Empresa', description: 'Gerencie sua empresa e atualize seus dados.' },
    },
    {
      path: '/invitations',
      name: 'invitations',
      component: () => import('../views/InvitationsView.vue'),
      meta: { title: 'Convites', description: 'Veja e aceite convites para participar de empresas.' },
    },
    {
      path: '/invitations/:token',
      name: 'invitationDetails',
      component: () => import('../views/InvitationsView.vue'),
      meta: { title: 'Convite', description: 'Aceite o convite para participar de uma empresa.' },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/testUploader',
      name: 'testUploader',
      component: () => import('@/components/dev/UploaderTest.vue'),
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
      component: () => import('../views/CompanySettingsView.vue'),
      meta: { title: 'Configurações da Empresa', description: 'Gerencie sua empresa, membros e configurações.' },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionsView.vue'),
      meta: { title: 'Transações', description: 'Consulte e exporte todas as transações registradas.' },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Relatórios', description: 'Acompanhe seu desempenho financeiro mês a mês.' },
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../views/TagsManagementView.vue'),
      meta: { title: 'Tags', description: 'Gerencie as tags usadas para catalogar suas transações.' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/UserSettingsView.vue'),
      meta: { title: 'Configurações', description: 'Ajuste seu perfil e preferências do app.' },
    },
    {
      path: '/add/income',
      name: 'addIncome',
      component: () => import('../views/TransactionFormView.vue'),
      meta: { title: 'Adicionar Entrada', description: 'Cadastre uma nova entrada financeira.' },
    },
    {
      path: '/add/expense',
      name: 'addExpense',
      component: () => import('../views/TransactionFormView.vue'),
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

