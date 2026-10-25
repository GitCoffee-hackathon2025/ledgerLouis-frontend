<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { RefreshCw, UserPlus } from 'lucide-vue-next';
import CompanyService, {
  type CompanyMemberDto,
  type CompanyRole,
  type InvitationDto,
} from '@/services/companyService';
import { useCompanyStore } from '@/stores/CompanyStore';
import { formatDateBr } from '@/utils/dateUtils';

const props = defineProps<{
  members: CompanyMemberDto[];
  membersLoading: boolean;
  membersError: string | null;
  invitations: InvitationDto[];
  invitationsLoading: boolean;
  invitationsError: string | null;
}>();

const emit = defineEmits<{
  (e: 'refresh-members'): void;
  (e: 'refresh-invitations'): void;
}>();

const companyStore = useCompanyStore();
const service = new CompanyService();

const isOwner = computed(() => companyStore.company.role === 'owner');

const showInviteForm = ref(false);
const inviteLoading = ref(false);
const inviteError = ref('');
const revokeError = ref<string | null>(null);

const newInvite = reactive<{ email: string; role: CompanyRole }>({
  email: '',
  role: 'viewer',
});

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  viewer: 'Visualizador',
};

const getInvitationStatus = (inv: InvitationDto) => {
  if (inv.acceptedAt) {
    return { key: 'accepted', label: 'Aceito', badgeClass: 'is-income' };
  }
  if (inv.revokedAt) {
    return { key: 'revoked', label: 'Revogado', badgeClass: 'is-expense' };
  }
  const exp = new Date(inv.expiresAt).getTime();
  if (!isNaN(exp) && exp < Date.now()) {
    return { key: 'expired', label: 'Expirado', badgeClass: 'is-muted' };
  }
  return { key: 'pending', label: 'Pendente', badgeClass: '' };
};

const handleCreateInvitation = async () => {
  inviteError.value = '';

  if (!isOwner.value) {
    inviteError.value = 'Permissão insuficiente: apenas o proprietário pode convidar novos membros.';
    return;
  }

  if (!newInvite.email.trim()) {
    inviteError.value = 'Por favor, informe o e-mail do usuário.';
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
    emit('refresh-invitations');
  } catch (error) {
    const resp =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data
        : undefined;

    if (resp?.error === 'USER_NOT_FOUND') {
      inviteError.value = 'Usuário não encontrado: peça para a pessoa se cadastrar antes de convidá-la.';
    } else if (resp?.error === 'MEMBER_ALREADY_EXISTS') {
      inviteError.value = 'Este usuário já é membro da empresa.';
    } else if (resp?.error === 'FORBIDDEN') {
      inviteError.value = 'Permissão insuficiente: apenas o proprietário pode convidar novos membros.';
    } else {
      inviteError.value = 'Não foi possível enviar o convite. Verifique os dados e tente novamente.';
    }
  } finally {
    inviteLoading.value = false;
  }
};

const handleRevoke = async (invitation: { id: string }) => {
  if (!companyStore.company.id || !isOwner.value) return;
  revokeError.value = null;
  try {
    await service.revokeInvitation(companyStore.company.id, invitation.id);
    emit('refresh-invitations');
  } catch (error) {
    revokeError.value = 'Não foi possível revogar o convite. Verifique suas permissões.';
  }
};
</script>

<template>
  <div class="members-sections-wrapper">
    <!-- 1. Tabela de Membros Ativos -->
    <section class="lg-section" aria-labelledby="members-heading">
      <header class="lg-section-head">
        <div>
          <h2 id="members-heading" class="lg-h2">Equipe e membros</h2>
          <p class="lg-note">Pessoas com credencial de acesso aos registros desta empresa.</p>
        </div>

        <div class="lg-actions">
          <button
            v-if="isOwner && !showInviteForm"
            type="button"
            class="lg-btn lg-btn--primary"
            @click="showInviteForm = true"
          >
            <UserPlus :size="16" aria-hidden="true" />
            <span>Convidar membro</span>
          </button>
          <button
            type="button"
            class="lg-btn lg-btn--icon lg-btn--quiet"
            title="Recarregar membros"
            aria-label="Recarregar membros"
            @click="$emit('refresh-members')"
          >
            <RefreshCw :size="15" aria-hidden="true" />
          </button>
        </div>
      </header>

      <!-- Formulário inline de novo convite (Apenas Owner) -->
      <form
        v-if="isOwner && showInviteForm"
        class="invite-form-box"
        @submit.prevent="handleCreateInvitation"
      >
        <div class="invite-form-grid">
          <div class="lg-field invite-email-field">
            <label for="invite-email-input" class="lg-label">E-mail do novo membro</label>
            <input
              id="invite-email-input"
              v-model="newInvite.email"
              type="email"
              placeholder="nome@dominio.com"
              required
              class="lg-input"
            />
          </div>

          <div class="lg-field invite-role-field">
            <label for="invite-role-select" class="lg-label">Função na empresa</label>
            <select id="invite-role-select" v-model="newInvite.role" class="lg-select">
              <option value="owner">Proprietário (owner)</option>
              <option value="admin">Administrador (admin)</option>
              <option value="viewer">Visualizador (viewer)</option>
            </select>
          </div>
        </div>

        <div class="lg-actions invite-actions">
          <button
            type="submit"
            class="lg-btn lg-btn--primary"
            :disabled="inviteLoading"
          >
            {{ inviteLoading ? 'Enviando...' : 'Enviar convite' }}
          </button>
          <button
            type="button"
            class="lg-btn lg-btn--quiet"
            @click="showInviteForm = false"
          >
            Cancelar
          </button>
        </div>

        <p v-if="inviteError" class="lg-error" role="alert" style="margin-top: 10px;">
          {{ inviteError }}
        </p>
      </form>

      <div v-if="membersLoading" class="lg-empty">
        Carregando lista de membros...
      </div>

      <div v-else-if="membersError" class="lg-empty">
        <p class="lg-error">{{ membersError }}</p>
        <button
          type="button"
          class="lg-btn lg-btn--quiet"
          style="margin-top: 8px;"
          @click="$emit('refresh-members')"
        >
          Tentar carregar membros novamente
        </button>
      </div>

      <div v-else-if="members.length === 0" class="lg-empty">
        Nenhum membro encontrado para esta empresa.
      </div>

      <div v-else class="table-container">
        <table class="lg-table" aria-label="Membros autorizados">
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Papel</th>
              <th scope="col">Data de entrada</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.userId">
              <th scope="row" style="font-weight: 600;">{{ member.name }}</th>
              <td>{{ member.email }}</td>
              <td>
                <span
                  class="lg-badge"
                  :class="{ 'is-income': member.role === 'owner', 'is-projection': member.role === 'admin' }"
                >
                  {{ roleLabels[member.role] || member.role }}
                </span>
              </td>
              <td class="is-muted">{{ formatDateBr(member.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 2. Tabela de Convites -->
    <section class="lg-section" aria-labelledby="invitations-heading">
      <header class="lg-section-head">
        <div>
          <h2 id="invitations-heading" class="lg-h2">Convites da empresa</h2>
          <p class="lg-note">Acompanhe o estado dos convites emitidos para novos usuários.</p>
        </div>

        <div v-if="isOwner" class="lg-actions">
          <button
            type="button"
            class="lg-btn lg-btn--icon lg-btn--quiet"
            title="Recarregar convites"
            aria-label="Recarregar convites"
            @click="$emit('refresh-invitations')"
          >
            <RefreshCw :size="15" aria-hidden="true" />
          </button>
        </div>
      </header>

      <p v-if="!isOwner" class="lg-note">
        Apenas o proprietário (owner) possui autorização para consultar e revogar convites.
      </p>

      <div v-else-if="invitationsLoading" class="lg-empty">
        Carregando histórico de convites...
      </div>

      <div v-else-if="invitationsError" class="lg-empty">
        <p class="lg-error">{{ invitationsError }}</p>
        <button
          type="button"
          class="lg-btn lg-btn--quiet"
          style="margin-top: 8px;"
          @click="$emit('refresh-invitations')"
        >
          Tentar carregar convites novamente
        </button>
      </div>

      <div v-else-if="invitations.length === 0" class="lg-empty">
        Nenhum convite emitido no momento.
      </div>

      <div v-else class="table-container">
        <p v-if="revokeError" class="lg-error" role="alert" style="margin-bottom: 12px;">
          {{ revokeError }}
        </p>

        <table class="lg-table" aria-label="Histórico de convites da empresa">
          <thead>
            <tr>
              <th scope="col">E-mail convidado</th>
              <th scope="col">Função</th>
              <th scope="col">Estado</th>
              <th scope="col">Expiração</th>
              <th scope="col" class="lg-num">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invitations" :key="inv.id">
              <th scope="row" style="font-weight: 500;">{{ inv.email }}</th>
              <td>{{ roleLabels[inv.role] || inv.role }}</td>
              <td>
                <span class="lg-badge" :class="getInvitationStatus(inv).badgeClass">
                  {{ getInvitationStatus(inv).label }}
                </span>
              </td>
              <td class="is-muted">{{ formatDateBr(inv.expiresAt) }}</td>
              <td class="lg-num">
                <button
                  v-if="getInvitationStatus(inv).key === 'pending'"
                  type="button"
                  class="lg-btn lg-btn--quiet lg-btn--danger"
                  style="min-height: 36px; padding: 0 12px; font-size: 0.8125rem;"
                  @click="handleRevoke(inv)"
                >
                  Revogar
                </button>
                <span v-else class="is-muted" style="font-size: 0.8125rem;">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.members-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.invite-form-box {
  padding: 18px;
  background: var(--lg-sunken);
  border: 1px solid var(--lg-line);
  border-radius: var(--lg-radius-sm);
  margin-bottom: 24px;
}

.invite-form-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.invite-email-field {
  flex: 2;
  min-width: 240px;
}

.invite-role-field {
  flex: 1;
  min-width: 180px;
}

.invite-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.table-container {
  overflow-x: auto;
}
</style>
