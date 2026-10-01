<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CompanyService, { type UserInvitationDto } from '@/services/companyService';
import { useCompanyStore } from '@/stores/CompanyStore';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useToast } from '@/composables/useToast';
import { apiErrorStatus } from '@/utils/apiError';
import { formatDateTime } from '@/utils/format';

type TokenInvitation = Omit<UserInvitationDto, 'id'>;

const service = new CompanyService();
const route = useRoute();
const router = useRouter();
const companyStore = useCompanyStore();
const toast = useToast();

const loading = ref(true);
const acceptingId = ref<string | null>(null);
const invitations = ref<UserInvitationDto[]>([]);
const tokenInvitation = ref<TokenInvitation | null>(null);
const tokenError = ref('');

const loadInvitations = async () => {
  loading.value = true;
  try {
    invitations.value = (await service.listUserInvitations()).items;
  } catch (error) {
    console.error('Erro ao carregar convites:', error);
    invitations.value = [];
  } finally {
    loading.value = false;
  }
};

const onAccepted = async () => {
  toast.success('Convite aceito! A empresa já está disponível para você.');
  await companyStore.syncFromBackend();
};

const handleAccept = async (invitation: UserInvitationDto) => {
  acceptingId.value = invitation.id;
  try {
    await service.acceptInvitationById(invitation.id);
    await onAccepted();
    await loadInvitations();
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    toast.error('Não foi possível aceitar o convite.');
  } finally {
    acceptingId.value = null;
  }
};

const handleTokenAccept = async () => {
  const token = route.params.token;
  if (typeof token !== 'string') return;

  acceptingId.value = token;
  try {
    await service.acceptInvitation(token);
    tokenInvitation.value = null;
    await onAccepted();
    router.push({ name: 'company' });
  } catch (error) {
    console.error('Erro ao aceitar convite:', error);
    tokenError.value = 'Não foi possível aceitar este convite.';
  } finally {
    acceptingId.value = null;
  }
};

onMounted(async () => {
  const token = route.params.token;
  if (typeof token !== 'string') {
    await loadInvitations();
    return;
  }

  try {
    tokenInvitation.value = await service.getInvitation(token);
  } catch (error) {
    console.error('Erro ao carregar convite:', error);
    if (apiErrorStatus(error) === 401) {
      await router.replace({ name: 'entrar', query: { redirect: route.fullPath } });
      return;
    }
    tokenError.value = 'Convite inválido, expirado ou destinado a outro e-mail.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--narrow">
      <PageHeader eyebrow="Convites" title="Seus convites">
        <template #title>Seus <span class="gradient-text">convites</span></template>
        <template #description>Convites recebidos para participar de empresas no Ledger Louis.</template>
      </PageHeader>

      <div v-if="loading" class="invitation-list">
        <span v-for="n in 2" :key="n" class="skeleton" style="height: 96px; border-radius: var(--radius-lg)" />
      </div>

      <p v-else-if="tokenError" class="alert alert--error" role="alert">{{ tokenError }}</p>

      <ul v-else-if="tokenInvitation" class="invitation-list">
        <li class="invitation">
          <div class="invitation-copy">
            <div class="invitation-title">
              <strong>Convite para participar de uma empresa</strong>
              <span class="badge" data-tone="success">{{ tokenInvitation.role }}</span>
            </div>
            <p>{{ tokenInvitation.email }}</p>
            <p>Expira em {{ formatDateTime(tokenInvitation.expiresAt) }}</p>
          </div>
          <BaseButton :loading="acceptingId !== null" @click="handleTokenAccept">Aceitar convite</BaseButton>
        </li>
      </ul>

      <div v-else-if="invitations.length === 0" class="empty-state">
        Você não tem convites pendentes no momento.
      </div>

      <ul v-else class="invitation-list">
        <li v-for="invitation in invitations" :key="invitation.id" class="invitation">
          <div class="invitation-copy">
            <div class="invitation-title">
              <strong>Convite para empresa</strong>
              <span class="badge" :data-tone="invitation.role === 'owner' ? 'success' : undefined">
                {{ invitation.role }}
              </span>
            </div>
            <p>{{ invitation.email }}</p>
            <p>Expira em {{ formatDateTime(invitation.expiresAt) }}</p>
          </div>
          <BaseButton :loading="acceptingId === invitation.id" @click="handleAccept(invitation)">
            Aceitar convite
          </BaseButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.invitation-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.invitation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
}

.invitation-copy {
  flex: 1 1 260px;
  min-width: 0;
}

.invitation-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.invitation-copy p {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}

.invitation-copy p svg {
  color: var(--color-text-subtle);
}

@media (max-width: 560px) {
  .invitation > :deep(.btn) {
    width: 100%;
  }
}
</style>
