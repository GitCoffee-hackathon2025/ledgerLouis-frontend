<template>
  <main class="management-page">
    <section class="management-card">
      <div class="management-header">
        <div>
          <p class="eyebrow">Gerenciamento da Empresa</p>
          <h1>Controle de membros</h1>
          <p>Veja e convide pessoas para fazer parte da sua empresa.</p>
        </div>
        <button class="primary-button" @click="goToCompanySettings">Voltar às configurações</button>
      </div>

      <div v-if="loading" class="loading-state">
        <p>Carregando informações da empresa...</p>
      </div>

      <div v-else-if="!companyStore.company.hasCompany">
        <div class="empty-state">
          <h2>Nenhuma empresa selecionada</h2>
          <p>Você ainda não tem uma empresa ativa. Crie uma nova ou entre em uma empresa existente.</p>
          <div class="action-row">
            <button class="secondary-button" @click="goToCreate">Criar empresa</button>
            <button class="primary-button" @click="goToJoin">Entrar em empresa</button>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="company-info">
          <strong>{{ companyStore.company.name }}</strong>
          <span>{{ companyStore.company.cnpj || 'CNPJ não cadastrado' }}</span>
        </div>

        <div class="members-section">
          <header class="members-header">
            <h2>Membros da empresa</h2>
            <button class="secondary-button" @click="loadMembers">Atualizar</button>
          </header>

          <div v-if="members.length === 0" class="empty-members">
            <p>Nenhum membro encontrado para esta empresa.</p>
          </div>

          <ul class="members-list" v-else>
            <li v-for="member in members" :key="member.userId">
              <div>
                <strong>{{ member.name }}</strong>
                <span>{{ member.email }}</span>
              </div>
              <span class="member-role">{{ member.role }}</span>
            </li>
          </ul>
        </div>

        <section class="invite-card">
          <h2>Convidar novo membro</h2>
          <form @submit.prevent="handleAddMember" class="invite-form">
            <BaseInput
              id="memberEmail"
              label="Email do membro"
              type="email"
              placeholder="email@dominio.com"
              v-model="newMember.email"
              :error="errors.email"
              required
            />

            <label class="select-label" for="memberRole">Função</label>
            <select id="memberRole" v-model="newMember.role">
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            <div class="form-actions">
              <button type="submit" class="primary-button" :disabled="inviteLoading">
                {{ inviteLoading ? 'Enviando...' : 'Convidar membro' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';
import CompanyService from '@/services/companyService';
import BaseInput from '@/components/inputs/BaseInput.vue';

const router = useRouter();
const companyStore = useCompanyStore();
const service = new CompanyService();
const loading = ref(true);
const inviteLoading = ref(false);
const companies = ref<Array<{ companyId: string; companyName: string; role: string }>>([]);
const members = ref([] as Array<{ userId: string; name: string; email: string; role: string; createdAt: string }>);

const newMember = reactive({ email: '', role: 'user' });
const errors = reactive({ email: false });

const goToCreate = () => router.push({ name: 'companyCreate' });
const goToJoin = () => router.push({ name: 'companyJoin' });
const goToCompanySettings = () => router.push({ name: 'companySettings' });

const setCompanyFromUserCompany = (userCompany: { companyId: string; companyName: string; role: string }) => {
  companyStore.setCompanyData({
    id: userCompany.companyId,
    name: userCompany.companyName,
    role: userCompany.role,
    hasCompany: true,
  });
};

const loadMembers = async () => {
  if (!companyStore.company.id) return;
  try {
    const response = await service.getCompanyMembers(companyStore.company.id);
    members.value = response.items;
  } catch (error) {
    console.error('Erro ao carregar membros:', error);
    members.value = [];
  }
};

const loadUserCompanies = async () => {
  try {
    const result = await service.getUserCompanies();
    companies.value = result;
    if (result.length > 0 && !companyStore.company.hasCompany) {
      const firstCompany = result[0]!;
      setCompanyFromUserCompany(firstCompany);
    }
  } catch (error) {
    console.error('Erro ao carregar empresas do usuário:', error);
  } finally {
    loading.value = false;
  }
};

const handleAddMember = async () => {
  errors.email = false;

  if (!newMember.email.trim()) {
    errors.email = true;
    return;
  }

  if (!companyStore.company.id) {
    return;
  }

  inviteLoading.value = true;
  try {
    await service.addCompanyMember(companyStore.company.id, newMember.email.trim(), newMember.role);
    newMember.email = '';
    newMember.role = 'user';
    await loadMembers();
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
  } finally {
    inviteLoading.value = false;
  }
};

onMounted(async () => {
  await loadUserCompanies();
  if (companyStore.company.hasCompany) {
    await loadMembers();
  }
});
</script>

<style scoped>
.management-page {
  min-height: calc(100vh - 65px);
  padding: 32px 18px;
  background-color: var(--color-surface-soft);
}

.management-card {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.management-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 32px;
}

.eyebrow {
  color: var(--color-success-dark);
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 14px;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: 32px;
}

.loading-state,
.empty-state,
.empty-members {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface-alt);
}

.company-info {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 28px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
}

.company-info strong {
  font-size: 22px;
}

.company-info span {
  color: var(--color-text-secondary);
}

.members-section {
  margin-bottom: 32px;
}

.members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.members-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.members-list li {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 22px;
  border-radius: 22px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
}

.members-list strong {
  display: block;
  margin-bottom: 6px;
}

.member-role {
  font-weight: 700;
  color: var(--color-success-dark);
}

.invite-card {
  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
}

.invite-card h2 {
  margin: 0 0 18px;
  color: var(--color-text);
}

.invite-form {
  display: grid;
  gap: 18px;
}

.select-label {
  display: block;
  color: var(--color-text);
  font-weight: 600;
}

select {
  width: 100%;
  min-height: 52px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 14px 16px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-size: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
}

.action-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.primary-button,
.secondary-button {
  border-radius: 999px;
  padding: 14px 24px;
  cursor: pointer;
  font-weight: 700;
}

.primary-button {
  border: none;
  background: var(--color-success-gradient);
  color: var(--color-surface);
}

.secondary-button {
  border: 1px solid var(--color-success-dark);
  background: transparent;
  color: var(--color-success-dark);
}

@media (max-width: 768px) {
  .management-card {
    padding: 24px;
  }

  .management-header {
    flex-direction: column;
    align-items: stretch;
  }

  .company-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
