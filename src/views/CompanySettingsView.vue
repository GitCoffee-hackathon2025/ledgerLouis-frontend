<template>
  <main class="company-admin-page">
    <!-- Header da Página -->
    <div class="admin-header">
      <div class="header-content">
        <div class="avatar-large">{{ companyName.charAt(0).toUpperCase() }}</div>
        <div>
          <h1>{{ companyName }}</h1>
          <p>Painel de Administração da Empresa</p>
        </div>
      </div>
      <button class="btn-leave" @click="leaveCompany">Sair da Empresa</button>
    </div>

    <!-- Informações da Empresa -->
    <section class="info-section">
      <h3>📋 Informações da Empresa</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>Nome</label>
          <span>{{ companyStore.company.name }}</span>
        </div>
        <div class="info-item">
          <label>CNPJ</label>
          <span>{{ companyStore.company.cnpj || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <label>Email</label>
          <span>{{ companyStore.company.email || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <label>Telefone</label>
          <span>{{ companyStore.company.phone || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <label>Endereço</label>
          <span>{{ companyStore.company.address || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <label>Site</label>
          <span>{{ companyStore.company.website || 'Não informado' }}</span>
        </div>
      </div>
    </section>

    <!-- Componentes de Gerenciamento -->
    <div class="management-container">
      <CategoryManager />
      <RecurringExpenseManager />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';
import CategoryManager from '@/components/CompanyManagement/CategoryManager.vue';
import RecurringExpenseManager from '@/components/CompanyManagement/RecurringExpenseManager.vue';

const router = useRouter();
const companyStore = useCompanyStore();

const companyName = computed(() => companyStore.company.name || 'Minha Empresa');

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
.company-admin-page {
  min-height: calc(100vh - 65px);
  padding: 32px 20px;
  background-color: var(--color-surface-soft);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  color: var(--color-primary);
}

.header-content p {
  margin: 0;
  color: var(--color-text-secondary);
}

.btn-leave {
  background: #ff4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-leave:hover {
  background: #dd3333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
}

.info-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
}

.info-section h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--color-bg);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.info-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.info-item span {
  font-size: 0.95rem;
  color: var(--color-text);
  margin: 0;
}

.management-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Responsividade */
@media (max-width: 768px) {
  .company-admin-page {
    padding: 20px 16px;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-leave {
    align-self: flex-start;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.3rem;
  }

  .avatar-large {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
}
</style>
