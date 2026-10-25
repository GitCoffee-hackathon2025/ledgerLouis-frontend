<template>
  <main class="settings-page">
    <div class="settings-container">
      <!-- Cabeçalho da Empresa -->
      <header class="company-header">
        <div class="company-identity">
          <div class="company-avatar" aria-hidden="true">
            {{ companyName.charAt(0).toUpperCase() }}
          </div>
          <div>
            <span class="kicker">Gestão da empresa</span>
            <h1 class="company-title">{{ companyName }}</h1>
          </div>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="leave-btn"
            title="Desconectar-se desta empresa e voltar à seleção"
            @click="leaveCompany"
          >
            <LogOut :size="15" aria-hidden="true" />
            <span>Sair da empresa</span>
          </button>
        </div>
      </header>

      <!-- Layout em Duas Colunas: Índice Local + Conteúdo -->
      <div class="management-grid">
        <!-- Índice Local (~200px) -->
        <nav class="local-nav" aria-label="Seções de gestão">
          <button
            type="button"
            class="nav-item"
            :class="{ active: activeTab === 'empresa' }"
            @click="activeTab = 'empresa'"
          >
            <Building2 :size="16" aria-hidden="true" />
            <span>Empresa</span>
          </button>
          <button
            type="button"
            class="nav-item"
            :class="{ active: activeTab === 'pessoas' }"
            @click="activeTab = 'pessoas'"
          >
            <Users :size="16" aria-hidden="true" />
            <span>Pessoas</span>
            <span v-if="members.length > 0" class="counter-badge">{{ members.length }}</span>
          </button>
          <button
            type="button"
            class="nav-item"
            :class="{ active: activeTab === 'tags' }"
            @click="activeTab = 'tags'"
          >
            <Tags :size="16" aria-hidden="true" />
            <span>Tags</span>
          </button>
          <button
            type="button"
            class="nav-item"
            :class="{ active: activeTab === 'recorrencias' }"
            @click="activeTab = 'recorrencias'"
          >
            <Repeat :size="16" aria-hidden="true" />
            <span>Recorrências</span>
          </button>
        </nav>

        <!-- Conteúdo Principal -->
        <div class="content-area">
          <!-- 1. Dados da Empresa -->
          <section v-if="activeTab === 'empresa'" class="panel" aria-labelledby="company-data-title">
            <header class="panel-header">
              <div>
                <h2 id="company-data-title" class="panel-title">Dados cadastrais</h2>
                <p class="panel-subtitle">Informações básicas de identificação e contato da organização.</p>
              </div>
            </header>

            <dl class="definition-grid">
              <div class="def-item">
                <dt>Razão social / Nome</dt>
                <dd>{{ companyStore.company.name || 'Não informado' }}</dd>
              </div>
              <div class="def-item">
                <dt>CNPJ</dt>
                <dd class="tabular-num">{{ companyStore.company.cnpj || 'Não informado' }}</dd>
              </div>
              <div class="def-item">
                <dt>Email corporativo</dt>
                <dd>{{ companyStore.company.email || 'Não informado' }}</dd>
              </div>
              <div class="def-item">
                <dt>Telefone de contato</dt>
                <dd class="tabular-num">{{ companyStore.company.phone || 'Não informado' }}</dd>
              </div>
            </dl>
          </section>

          <!-- 2. Pessoas (Membros + Convites) -->
          <div v-if="activeTab === 'pessoas'" class="stack-panels">
            <!-- Painel de Membros -->
            <section class="panel" aria-labelledby="members-title">
              <header class="panel-header with-actions">
                <div>
                  <h2 id="members-title" class="panel-title">Equipe e membros</h2>
                  <p class="panel-subtitle">Pessoas com acesso autorizado aos registros desta empresa.</p>
                </div>
                <div class="header-btns">
                  <PrimaryButton
                    v-if="!showInviteForm"
                    variant="neutral"
                    compact
                    @click="showInviteForm = true"
                  >
                    <UserPlus :size="14" aria-hidden="true" />
                    Convidar membro
                  </PrimaryButton>
                  <PrimaryButton variant="neutral" compact title="Recarregar membros" @click="loadMembers">
                    <RefreshCw :size="14" aria-hidden="true" />
                  </PrimaryButton>
                </div>
              </header>

              <!-- Formulário Inline de Convite -->
              <div v-if="showInviteForm" class="invite-panel">
                <div class="invite-header">
                  <h3>Novo convite de membro</h3>
                  <button
                    type="button"
                    class="close-btn"
                    aria-label="Fechar convite"
                    @click="showInviteForm = false"
                  >
                    ×
                  </button>
                </div>

                <form class="invite-form" @submit.prevent="handleCreateInvitation">
                  <div class="invite-grid">
                    <div class="form-field flex-2">
                      <label for="memberEmail">Email do usuário *</label>
                      <input
                        id="memberEmail"
                        v-model="newInvite.email"
                        type="email"
                        placeholder="usuario@dominio.com"
                        required
                        class="field-input"
                      />
                    </div>

                    <div class="form-field flex-1">
                      <label for="memberRole">Função *</label>
                      <select id="memberRole" v-model="newInvite.role" class="field-input select-input">
                        <option value="owner">Owner (proprietário)</option>
                        <option value="admin">Admin (administrador)</option>
                        <option value="viewer">Viewer (visualizador)</option>
                      </select>
                    </div>
                  </div>

                  <div class="invite-actions">
                    <PrimaryButton
                      variant="neutral"
                      compact
                      type="button"
                      @click="showInviteForm = false"
                    >
                      Cancelar
                    </PrimaryButton>
                    <PrimaryButton
                      type="submit"
                      compact
                      :loading="inviteLoading"
                      :disabled="!companyStore.company.id"
                    >
                      Enviar convite
                    </PrimaryButton>
                  </div>

                  <p v-if="inviteError" class="field-error" role="alert">{{ inviteError }}</p>
                </form>
              </div>

              <!-- Lista de Membros -->
              <div v-if="membersLoading" class="empty-state">
                Carregando membros da empresa...
              </div>
              <div v-else-if="members.length === 0" class="empty-state">
                Nenhum membro encontrado para esta empresa.
              </div>
              <ul v-else class="members-table">
                <li v-for="member in members" :key="member.userId" class="member-row">
                  <div class="member-info">
                    <strong class="member-name">{{ member.name }}</strong>
                    <span class="member-email">{{ member.email }}</span>
                  </div>
                  <div class="member-meta">
                    <span class="role-pill" :data-role="member.role">{{ roleLabels[member.role] || member.role }}</span>
                  </div>
                </li>
              </ul>
            </section>

            <!-- Painel de Convites Pendentes -->
            <section class="panel" aria-labelledby="invites-title">
              <header class="panel-header with-actions">
                <div>
                  <h2 id="invites-title" class="panel-title">Convites pendentes</h2>
                  <p class="panel-subtitle">Aguardando aceite pelos usuários convidados.</p>
                </div>
                <PrimaryButton variant="neutral" compact title="Recarregar convites" @click="loadInvitations">
                  <RefreshCw :size="14" aria-hidden="true" />
                </PrimaryButton>
              </header>

              <div v-if="invitationsLoading" class="empty-state">
                Carregando convites pendentes...
              </div>
              <div v-else-if="invitations.length === 0" class="empty-state">
                Nenhum convite pendente no momento.
              </div>
              <ul v-else class="invites-list">
                <li v-for="invitation in invitations" :key="invitation.id" class="invite-row">
                  <div class="invite-data">
                    <strong class="invite-email">{{ invitation.email }}</strong>
                    <div class="invite-subdata">
                      <span>Função: {{ roleLabels[invitation.role] || invitation.role }}</span>
                      <span class="separator">·</span>
                      <span>Expira em: {{ formatDate(invitation.expiresAt) }}</span>
                    </div>
                  </div>
                  <PrimaryButton variant="danger" compact @click="handleRevoke(invitation)">
                    Revogar
                  </PrimaryButton>
                </li>
              </ul>
            </section>
          </div>

          <!-- 3. Tags -->
          <div v-if="activeTab === 'tags'">
            <TagManager />
          </div>

          <!-- 4. Recorrências -->
          <div v-if="activeTab === 'recorrencias'">
            <RecurringTransactionManager />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  LogOut,
  RefreshCw,
  Building2,
  Users,
  Tags,
  Repeat,
  UserPlus,
} from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import CompanyService, { type CompanyRole } from '@/services/companyService';
import RecurringTransactionManager from '@/components/company/RecurringTransactionManager.vue';
import TagManager from '@/components/company/TagManager.vue';
import PrimaryButton from '@/components/ui/PrimaryButton.vue';

const router = useRouter();
const route = useRoute();
const companyStore = useCompanyStore();
const service = new CompanyService();

const companyName = computed(() => companyStore.company.name || 'Minha Empresa');

// Aba ativa: 'empresa' | 'pessoas' | 'tags' | 'recorrencias'
const validTabs = ['empresa', 'pessoas', 'tags', 'recorrencias'] as const;
type TabType = typeof validTabs[number];

const activeTab = ref<TabType>(
  validTabs.includes(route.query.tab as TabType) ? (route.query.tab as TabType) : 'empresa',
);

const roleLabels: Record<string, string> = {
  owner: 'Proprietário (Owner)',
  admin: 'Administrador (Admin)',
  viewer: 'Visualizador (Viewer)',
};

const showInviteForm = ref(false);
const membersLoading = ref(false);
const inviteLoading = ref(false);
const inviteError = ref('');

const members = ref<Array<{ userId: string; name: string; email: string; role: CompanyRole; createdAt: string }>>([]);
const newInvite = reactive<{ email: string; role: CompanyRole }>({ email: '', role: 'viewer' });
const invitations = ref<Array<{ id: string; email: string; role: CompanyRole; expiresAt: string }>>([]);
const invitationsLoading = ref(false);

const setCompanyFromUserCompany = (userCompany: { companyId: string; companyName: string; role: string }) => {
  const safeRole: CompanyRole =
    userCompany.role === 'owner' || userCompany.role === 'admin' || userCompany.role === 'viewer'
      ? userCompany.role
      : 'viewer';

  companyStore.setCompanyData({
    id: userCompany.companyId,
    name: userCompany.companyName,
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
  try {
    const response = await service.getCompanyMembers(companyStore.company.id);
    members.value = response.items;
  } catch (error) {
    console.error('Erro ao carregar membros:', error);
    members.value = [];
  } finally {
    membersLoading.value = false;
  }
};

const loadInvitations = async () => {
  if (!companyStore.company.id) return;
  invitationsLoading.value = true;
  try {
    const response = await service.listInvitations(companyStore.company.id, { limit: 50 });
    invitations.value = response.items;
  } catch (error) {
    console.error('Erro ao carregar convites:', error);
    invitations.value = [];
  } finally {
    invitationsLoading.value = false;
  }
};

const handleCreateInvitation = async () => {
  inviteError.value = '';

  if (!newInvite.email.trim()) {
    inviteError.value = 'Por favor, informe o email do usuário.';
    return;
  }

  if (!companyStore.company.id) {
    inviteError.value = 'Empresa não selecionada.';
    return;
  }

  inviteLoading.value = true;
  try {
    await service.createInvitation(companyStore.company.id, newInvite.email.trim(), newInvite.role);
    newInvite.email = '';
    newInvite.role = 'viewer';
    showInviteForm.value = false;
    await loadInvitations();
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    const resp =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data
        : undefined;

    if (resp?.error === 'USER_NOT_FOUND') {
      inviteError.value = 'Usuário não encontrado: peça para a pessoa se cadastrar antes de convidá-la.';
    } else if (resp?.error === 'MEMBER_ALREADY_EXISTS') {
      inviteError.value = 'Este usuário já é membro da empresa.';
    } else if (resp?.error === 'FORBIDDEN') {
      inviteError.value = 'Permissão insuficiente: apenas o owner pode convidar novos membros.';
    } else {
      inviteError.value = 'Erro ao convidar membro. Verifique o console para mais detalhes.';
    }
  } finally {
    inviteLoading.value = false;
  }
};

const handleRevoke = async (invitation: { id: string }) => {
  if (!companyStore.company.id) return;
  try {
    await service.revokeInvitation(companyStore.company.id, invitation.id);
    await loadInvitations();
  } catch (error) {
    console.error('Erro ao revogar convite:', error);
  }
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
};

const leaveCompany = () => {
  companyStore.clearCompany();
  router.replace({ name: 'company' });
};

onMounted(async () => {
  if (!companyStore.company.hasCompany) {
    router.replace({ name: 'company' });
    return;
  }
  await ensureCompanyId();
  await loadMembers();
  await loadInvitations();
});
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 80px);
  padding: 32px 20px 64px;
  background: var(--color-bg);
}

.settings-container {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Cabeçalho Limpo */
.company-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.company-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.company-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.kicker {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.company-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.leave-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 10px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  min-height: 40px;
  transition: all 0.15s ease;
}

.leave-btn:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background: var(--color-danger-soft, #fef2f2);
}

/* Grade de Gestão: Índice Lateral (~200px) + Conteúdo */
.management-grid {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.local-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: sticky;
  top: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.counter-badge {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 7px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
}

.stack-panels {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Painéis de Conteúdo */
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-header.with-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.panel-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.panel-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.header-btns {
  display: flex;
  gap: 8px;
}

/* Grade de Definição 2x2 para Dados da Empresa */
.definition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.def-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.def-item dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.def-item dd {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.tabular-num {
  font-variant-numeric: tabular-nums;
}

/* Formulário de Convite Inline */
.invite-panel {
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.invite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.invite-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invite-grid {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.flex-2 { flex: 2; min-width: 220px; }
.flex-1 { flex: 1; min-width: 160px; }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.field-input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.invite-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.field-error {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
}

/* Listas de Membros e Convites */
.members-table,
.invites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.member-row,
.invite-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  gap: 16px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.member-email {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.role-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.role-pill[data-role="owner"] {
  border-color: var(--color-primary);
  color: var(--color-success-dark);
}

.invite-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.invite-email {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.invite-subdata {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 6px;
}

.separator {
  color: var(--color-text-tertiary);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .management-grid {
    grid-template-columns: 1fr;
  }

  .local-nav {
    flex-direction: row;
    overflow-x: auto;
    position: static;
    padding-bottom: 4px;
  }

  .nav-item {
    min-width: fit-content;
    padding: 8px 12px;
  }

  .definition-grid {
    grid-template-columns: 1fr;
  }
}
</style>
