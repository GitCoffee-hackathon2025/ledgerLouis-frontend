<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowRight,
  Building2,
  Fingerprint,
  LogOut,
  Mail,
  Phone,
  ReceiptText,
  RefreshCw,
  Repeat,
  Tag,
} from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import CompanyService, { type CompanyRole } from '@/services/companyService';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import { apiErrorCode } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

interface Member {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: CompanyRole;
  expiresAt: string;
}

const router = useRouter();
const companyStore = useCompanyStore();
const service = new CompanyService();
const toast = useToast();
const { confirm } = useConfirm();

const companyName = computed(() => companyStore.company.name || 'Minha empresa');

const companyInfo = computed(() => [
  { label: 'Nome', value: companyStore.company.name, icon: Building2 },
  { label: 'CNPJ', value: companyStore.company.cnpj, icon: Fingerprint },
  { label: 'E-mail', value: companyStore.company.email, icon: Mail },
  { label: 'Telefone', value: companyStore.company.phone, icon: Phone },
]);

const shortcuts = [
  {
    to: { name: 'recurring' },
    icon: Repeat,
    title: 'Lançamentos recorrentes',
    description: 'Despesas e receitas fixas lançadas automaticamente.',
  },
  {
    to: { name: 'tags' },
    icon: Tag,
    title: 'Tags',
    description: 'Rótulos para catalogar e filtrar transações.',
  },
  {
    to: { name: 'transactions' },
    icon: ReceiptText,
    title: 'Transações',
    description: 'Histórico completo com busca e exportação.',
  },
];

const roleOptions: { value: CompanyRole; label: string }[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

const members = ref<Member[]>([]);
const membersLoading = ref(false);
const invitations = ref<Invitation[]>([]);
const invitationsLoading = ref(false);

const newInvite = reactive<{ email: string; role: CompanyRole }>({ email: '', role: 'viewer' });
const inviteError = ref('');
const inviteLoading = ref(false);

const inviteErrorMessages: Record<string, string> = {
  USER_NOT_FOUND: 'Usuário não encontrado. Peça para a pessoa se cadastrar antes de convidá-la.',
  MEMBER_ALREADY_EXISTS: 'Este usuário já é membro da empresa.',
  FORBIDDEN: 'Permissão insuficiente: apenas o owner pode convidar novos membros.',
};

const ensureCompanyId = async () => {
  if (companyStore.company.id) return;
  try {
    const userCompanies = await service.getUserCompanies();
    if (userCompanies.length > 0) companyStore.selectCompany(userCompanies[0]!);
  } catch (error) {
    console.error('Erro ao buscar empresas do usuário:', error);
  }
};

const loadMembers = async () => {
  if (!companyStore.company.id) return;
  membersLoading.value = true;
  try {
    members.value = (await service.getCompanyMembers(companyStore.company.id)).items;
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
    invitations.value = (await service.listInvitations(companyStore.company.id, { limit: 50 })).items;
  } catch (error) {
    console.error('Erro ao carregar convites:', error);
    invitations.value = [];
  } finally {
    invitationsLoading.value = false;
  }
};

const handleCreateInvitation = async () => {
  inviteError.value = '';
  const email = newInvite.email.trim();

  if (!email) {
    inviteError.value = 'Informe o e-mail de quem você quer convidar.';
    return;
  }
  if (!companyStore.company.id) {
    inviteError.value = 'Empresa não selecionada.';
    return;
  }

  inviteLoading.value = true;
  try {
    await service.createInvitation(companyStore.company.id, email, newInvite.role);
    newInvite.email = '';
    newInvite.role = 'viewer';
    toast.success(`Convite enviado para ${email}.`);
    await loadInvitations();
  } catch (error) {
    console.error('Erro ao criar convite:', error);
    inviteError.value = inviteErrorMessages[apiErrorCode(error) ?? ''] ?? 'Não foi possível enviar o convite.';
  } finally {
    inviteLoading.value = false;
  }
};

const handleRevoke = async (invitation: Invitation) => {
  if (!companyStore.company.id) return;
  const confirmed = await confirm({
    title: 'Revogar convite?',
    message: `${invitation.email} não poderá mais usar este convite para entrar na empresa.`,
    confirmLabel: 'Revogar',
    tone: 'danger',
  });
  if (!confirmed) return;

  try {
    await service.revokeInvitation(companyStore.company.id, invitation.id);
    toast.success('Convite revogado.');
    await loadInvitations();
  } catch (error) {
    console.error('Erro ao revogar convite:', error);
    toast.error('Não foi possível revogar o convite.');
  }
};

const leaveCompany = async () => {
  const confirmed = await confirm({
    title: 'Sair desta empresa?',
    message: 'Você voltará para a tela de seleção de empresas.',
    confirmLabel: 'Sair',
    tone: 'danger',
  });
  if (!confirmed) return;

  companyStore.clearCompany();
  router.replace({ name: 'company' });
};

onMounted(async () => {
  await ensureCompanyId();
  await Promise.all([loadMembers(), loadInvitations()]);
});
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <header class="company-hero">
        <div class="company-avatar" aria-hidden="true">{{ companyName.charAt(0).toUpperCase() }}</div>
        <div class="company-hero-copy">
          <p class="card-kicker">Sua empresa</p>
          <h1>{{ companyName }}</h1>
          <span class="badge" data-tone="success">{{ companyStore.company.role }}</span>
        </div>
        <BaseButton variant="secondary" size="sm" class="leave-button" @click="leaveCompany">
          <LogOut :size="15" />
          Trocar de empresa
        </BaseButton>
      </header>

      <nav class="shortcut-grid" aria-label="Gerenciamento da empresa">
        <RouterLink v-for="shortcut in shortcuts" :key="shortcut.title" :to="shortcut.to" class="shortcut">
          <span class="shortcut-copy">
            <strong>{{ shortcut.title }}</strong>
            <span>{{ shortcut.description }}</span>
          </span>
          <ArrowRight :size="17" class="shortcut-arrow" />
        </RouterLink>
      </nav>

      <section class="card">
        <header class="card-header">
          <div>
            <h2 class="card-title">Dados da empresa</h2>
          </div>
        </header>

        <dl class="info-grid">
          <div v-for="info in companyInfo" :key="info.label" class="info-tile">
            <div>
              <dt>{{ info.label }}</dt>
              <dd :class="{ 'is-empty': !info.value }">{{ info.value || 'Não informado' }}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section class="card">
        <header class="card-header">
          <div>
            <h2 class="card-title">Membros</h2>
            <p class="card-subtitle">Quem tem acesso às finanças desta empresa.</p>
          </div>
          <BaseButton variant="ghost" size="sm" :loading="membersLoading" @click="loadMembers">
            <RefreshCw :size="14" />
            Atualizar
          </BaseButton>
        </header>

        <div v-if="membersLoading && members.length === 0" class="people-list">
          <span v-for="n in 2" :key="n" class="skeleton" style="height: 52px" />
        </div>
        <p v-else-if="members.length === 0" class="empty-state">Nenhum membro encontrado para esta empresa.</p>
        <ul v-else class="people-list list-divided">
          <li v-for="member in members" :key="member.userId" class="person">
            <span class="person-avatar" aria-hidden="true">{{ member.name.charAt(0).toUpperCase() }}</span>
            <div class="person-copy">
              <strong>{{ member.name }}</strong>
              <span>{{ member.email }}</span>
            </div>
            <span class="badge" :data-tone="member.role === 'owner' ? 'success' : undefined">{{ member.role }}</span>
          </li>
        </ul>

        <form class="invite-form" @submit.prevent="handleCreateInvitation">
          <p class="invite-title">Convidar pessoa</p>
          <div class="invite-row">
            <BaseInput
              id="memberEmail"
              v-model="newInvite.email"
              type="email"
              placeholder="email@dominio.com"
              autocomplete="off"
              aria-label="E-mail do membro"
              :error="inviteError"
              class="invite-email"
            />
            <select v-model="newInvite.role" class="input invite-role" aria-label="Função">
              <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <BaseButton type="submit" :loading="inviteLoading" :disabled="!companyStore.company.id">
              Convidar
            </BaseButton>
          </div>
        </form>
      </section>

      <section class="card">
        <header class="card-header">
          <div>
            <h2 class="card-title">Convites pendentes</h2>
            <p class="card-subtitle">Convites enviados que ainda não foram aceitos.</p>
          </div>
          <BaseButton variant="ghost" size="sm" :loading="invitationsLoading" @click="loadInvitations">
            <RefreshCw :size="14" />
            Atualizar
          </BaseButton>
        </header>

        <p v-if="!invitationsLoading && invitations.length === 0" class="empty-state">Nenhum convite pendente.</p>
        <ul v-else class="people-list list-divided">
          <li v-for="invitation in invitations" :key="invitation.id" class="person">
            <span class="person-avatar person-avatar--muted" aria-hidden="true"><Mail :size="16" /></span>
            <div class="person-copy">
              <strong>{{ invitation.email }}</strong>
              <span>{{ invitation.role }} · expira em {{ formatDateTime(invitation.expiresAt) }}</span>
            </div>
            <BaseButton variant="ghost" size="sm" class="revoke-button" @click="handleRevoke(invitation)">
              Revogar
            </BaseButton>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.company-hero {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.company-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  box-shadow: var(--shadow-primary);
  color: var(--color-on-primary);
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
}

.company-hero-copy {
  flex: 1 1 200px;
  min-width: 0;
}

@media (max-width: 560px) {
  .leave-button {
    width: 100%;
  }
}

.company-hero-copy h1 {
  margin-bottom: 6px;
  font-size: var(--text-2xl);
  font-weight: 800;
  overflow-wrap: anywhere;
}

/* Atalhos para as páginas derivadas da empresa */
.shortcut-grid {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 720px) {
  .shortcut-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.shortcut {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration) ease,
    transform var(--duration) var(--ease-out);
}

.shortcut:hover {
  border-color: var(--color-primary-ring);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.shortcut-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.shortcut-copy strong {
  font-size: var(--text-base);
}

.shortcut-copy span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.shortcut-arrow {
  color: var(--color-text-subtle);
  transition: transform var(--duration) var(--ease-out), color var(--duration-fast) ease;
}

.shortcut:hover .shortcut-arrow {
  color: var(--color-primary);
  transform: translateX(3px);
}

/* Dados */
.info-grid {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 560px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.info-tile {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.info-icon {
  margin-top: 2px;
  color: var(--color-primary);
}

.info-tile dt {
  margin-bottom: 2px;
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.info-tile dd {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.info-tile dd.is-empty {
  font-weight: 500;
  color: var(--color-text-subtle);
}

/* Pessoas */
.people-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.people-list.list-divided {
  gap: 0;
}

.person {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.person-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-weight: 800;
}

.person-avatar--muted {
  background: var(--color-surface-3);
  color: var(--color-text-muted);
}

.person-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.person-copy strong {
  font-size: var(--text-base);
  overflow: hidden;
  text-overflow: ellipsis;
}

.person-copy span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.revoke-button {
  color: var(--color-danger);
}

/* Convite */
.invite-form {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.invite-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  font-weight: 700;
}

.invite-row {
  display: grid;
  gap: var(--space-3);
  align-items: start;
}

@media (min-width: 640px) {
  .invite-row {
    grid-template-columns: minmax(0, 1fr) 140px auto;
  }
}
</style>
