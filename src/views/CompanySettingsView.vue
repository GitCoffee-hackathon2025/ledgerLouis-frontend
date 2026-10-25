<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import CompanyService, {
  type CompanyMemberDto,
  type CompanyRole,
  type InvitationDto,
} from '@/services/companyService';
import CompanyOverviewSection from '@/components/company/CompanyOverviewSection.vue';
import CompanyMembersSection from '@/components/company/CompanyMembersSection.vue';
import TagManager from '@/components/company/TagManager.vue';
import RecurringTransactionManager from '@/components/company/RecurringTransactionManager.vue';

const router = useRouter();
const route = useRoute();
const companyStore = useCompanyStore();
const recurringStore = useRecurringTransactionStore();
const service = new CompanyService();

const validTabs = ['geral', 'pessoas', 'tags', 'recorrencias'] as const;
type TabType = typeof validTabs[number];

const activeTab = ref<TabType>(
  validTabs.includes(route.query.tab as TabType) ? (route.query.tab as TabType) : 'geral',
);

const isOwner = computed(() => companyStore.company.role === 'owner');

const members = ref<CompanyMemberDto[]>([]);
const membersLoading = ref(false);
const membersError = ref<string | null>(null);

const invitations = ref<InvitationDto[]>([]);
const invitationsLoading = ref(false);
const invitationsError = ref<string | null>(null);

const setTab = (tab: TabType) => {
  activeTab.value = tab;
  router.replace({ name: 'management', query: { ...route.query, tab } });
};

const setCompanyFromUserCompany = (userCompany: {
  companyId: string;
  companyName: string;
  cnpj?: string;
  email?: string | null;
  phone?: string | null;
  role: string;
}) => {
  const safeRole: CompanyRole =
    userCompany.role === 'owner' || userCompany.role === 'admin' || userCompany.role === 'viewer'
      ? userCompany.role
      : 'viewer';

  companyStore.setCompanyData({
    id: userCompany.companyId,
    name: userCompany.companyName,
    cnpj: userCompany.cnpj,
    email: userCompany.email || undefined,
    phone: userCompany.phone || undefined,
    role: safeRole,
    hasCompany: true,
  });
};

const ensureCompanyId = async () => {
  if (companyStore.company.id) return;
  try {
    const userCompanies = await service.getUserCompanies();
    if (userCompanies.length > 0) {
      setCompanyFromUserCompany(userCompanies[0]!);
    }
  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error);
  }
};

const loadMembers = async () => {
  if (!companyStore.company.id) return;
  membersLoading.value = true;
  membersError.value = null;
  try {
    const response = await service.getCompanyMembers(companyStore.company.id);
    members.value = response.items;
  } catch (error) {
    membersError.value = 'Não foi possível carregar os membros da empresa.';
    members.value = [];
  } finally {
    membersLoading.value = false;
  }
};

const loadInvitations = async () => {
  if (!companyStore.company.id || !isOwner.value) return;
  invitationsLoading.value = true;
  invitationsError.value = null;
  try {
    const response = await service.listInvitations(companyStore.company.id, { limit: 50 });
    invitations.value = response.items;
  } catch (error) {
    invitationsError.value = 'Não foi possível carregar os convites da empresa.';
    invitations.value = [];
  } finally {
    invitationsLoading.value = false;
  }
};

const leaveCompany = () => {
  companyStore.clearCompany();
  router.replace({ name: 'company' });
};

watch(
  () => route.query.tab,
  (newTab) => {
    if (validTabs.includes(newTab as TabType) && newTab !== activeTab.value) {
      activeTab.value = newTab as TabType;
    }
  },
);

onMounted(async () => {
  if (!companyStore.company.hasCompany) {
    router.replace({ name: 'company' });
    return;
  }
  await ensureCompanyId();
  await Promise.allSettled([
    loadMembers(),
    recurringStore.fetchRecurringTransactions(),
    isOwner.value ? loadInvitations() : Promise.resolve(),
  ]);
});
</script>

<template>
  <main class="lg-page">
    <!-- Cabeçalho Institucional da Empresa -->
    <header class="lg-page-head">
      <div>
        <h1 class="lg-title">
          {{ companyStore.company.name || 'Minha Empresa' }}
        </h1>

        <dl class="company-meta is-muted">
          <span v-if="companyStore.company.cnpj">CNPJ {{ companyStore.company.cnpj }}</span>
          <span v-if="companyStore.company.email">{{ companyStore.company.email }}</span>
          <span v-if="companyStore.company.phone">{{ companyStore.company.phone }}</span>
        </dl>
      </div>

      <div class="lg-actions">
        <button
          type="button"
          class="lg-btn lg-btn--quiet lg-btn--danger"
          @click="leaveCompany"
        >
          Sair da empresa
        </button>
      </div>
    </header>

    <!-- Layout com Índice Local de 200px e Conteúdo Principal -->
    <div class="management-layout">
      <!-- Índice Local (200px no desktop, rolável no mobile) -->
      <nav class="local-index" aria-label="Seções de gestão">
        <button
          type="button"
          class="local-nav-item"
          :class="{ 'is-active': activeTab === 'geral' }"
          :aria-current="activeTab === 'geral' ? 'page' : undefined"
          @click="setTab('geral')"
        >
          Visão geral
        </button>

        <button
          type="button"
          class="local-nav-item"
          :class="{ 'is-active': activeTab === 'pessoas' }"
          :aria-current="activeTab === 'pessoas' ? 'page' : undefined"
          @click="setTab('pessoas')"
        >
          Pessoas
        </button>

        <button
          type="button"
          class="local-nav-item"
          :class="{ 'is-active': activeTab === 'tags' }"
          :aria-current="activeTab === 'tags' ? 'page' : undefined"
          @click="setTab('tags')"
        >
          Tags
        </button>

        <button
          type="button"
          class="local-nav-item"
          :class="{ 'is-active': activeTab === 'recorrencias' }"
          :aria-current="activeTab === 'recorrencias' ? 'page' : undefined"
          @click="setTab('recorrencias')"
        >
          Recorrências
        </button>
      </nav>

      <!-- Seção Ativa -->
      <section class="management-content" aria-live="polite">
        <CompanyOverviewSection
          v-if="activeTab === 'geral'"
          :members="members"
          :members-loading="membersLoading"
          :members-error="membersError"
        />

        <CompanyMembersSection
          v-else-if="activeTab === 'pessoas'"
          :members="members"
          :members-loading="membersLoading"
          :members-error="membersError"
          :invitations="invitations"
          :invitations-loading="invitationsLoading"
          :invitations-error="invitationsError"
          @refresh-members="loadMembers"
          @refresh-invitations="loadInvitations"
        />

        <TagManager v-else-if="activeTab === 'tags'" />

        <RecurringTransactionManager v-else-if="activeTab === 'recorrencias'" />
      </section>
    </div>
  </main>
</template>

<style scoped>
.company-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 8px;
  font-size: 0.8125rem;
}

.management-layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.local-index {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: sticky;
  top: 24px;
}

.local-nav-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--lg-ink-2);
  font: 500 0.875rem/1 var(--font-body);
  border-radius: var(--lg-radius-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.local-nav-item:hover {
  background: var(--lg-sunken);
  color: var(--lg-ink);
}

.local-nav-item:focus-visible {
  outline: 2px solid var(--lg-focus);
  outline-offset: 2px;
}

.local-nav-item.is-active {
  background: var(--lg-sunken);
  color: var(--lg-ink);
  font-weight: 600;
}

.management-content {
  min-width: 0;
}

@media (max-width: 768px) {
  .management-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .local-index {
    flex-direction: row;
    overflow-x: auto;
    position: static;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--lg-line);
  }

  .local-nav-item {
    width: auto;
    white-space: nowrap;
  }
}
</style>
