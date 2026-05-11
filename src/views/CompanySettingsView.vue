<template>
  <main class="company-page">
    <section class="company-card">
      <div class="company-header">
        <div class="company-avatar">E</div>
        <div>
          <h1>{{ companyName || 'Empresa não definida' }}</h1>
          <p>Configurações e controles da sua conta empresarial.</p>
        </div>
      </div>

      <div class="company-body">
        <div class="company-detail-row">
          <strong>Empresa:</strong>
          <span>{{ companyStore.company.name }}</span>
        </div>
        <div class="company-detail-row" v-if="companyStore.company.cnpj">
          <strong>CNPJ:</strong>
          <span>{{ companyStore.company.cnpj }}</span>
        </div>
        <div class="company-detail-row">
          <strong>Endereço:</strong>
          <span>{{ companyStore.company.address || 'Não informado' }}</span>
        </div>
        <div class="company-detail-row">
          <strong>Email:</strong>
          <span>{{ companyStore.company.email || 'Não informado' }}</span>
        </div>
        <div class="company-detail-row">
          <strong>Site:</strong>
          <span>{{ companyStore.company.website || 'Não informado' }}</span>
        </div>
        <div class="company-detail-row">
          <strong>Telefone:</strong>
          <span>{{ companyStore.company.phone || 'Não informado' }}</span>
        </div>

        <div class="company-actions">
          <button class="secondary-button" @click="leaveCompany">Sair da empresa</button>
          <button class="primary-button" @click="goToEdit">Editar empresa</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';

const router = useRouter();
const companyStore = useCompanyStore();

const companyName = computed(() => companyStore.company.name || 'Minha Empresa');

const goToEdit = () => {
  router.push({ name: 'companyCreate' });
};

const leaveCompany = () => {
  companyStore.clearCompany();
  router.replace({ name: 'company' });
};

onMounted(() => {
  if (!companyStore.company.hasCompany) {
    router.replace({ name: 'company' });
  }
});
</script>

<style scoped>
.company-page {
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 18px;
  background-color: var(--color-surface-soft);
}

.company-card {
  width: 100%;
  max-width: 760px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.company-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.company-avatar {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: var(--color-success-alt);
  color: var(--color-surface);
  font-size: 28px;
  font-weight: 800;
}

h1 {
  font-size: 28px;
  color: var(--color-success-dark);
  margin: 0 0 8px;
}

p {
  line-height: 1.75;
  color: var(--color-text-secondary);
}

.company-body {
  padding-top: 12px;
}

.company-actions {
  margin-top: 24px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  padding: 14px 22px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
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
</style>
