<template>
  <main class="onboarding-page">
    <section class="onboarding-card">
      <div class="onboarding-header">
        <h1>Bem-vindo à sua empresa</h1>
        <p>Antes de seguir, escolha se quer entrar em uma empresa existente ou criar a sua.</p>
      </div>

      <div class="option-list">
        <button class="option-button" @click="goToJoin">
          <strong>Entrar em uma empresa</strong>
          <span>Usar convite ou código para acessar a conta de uma empresa já existente.</span>
        </button>

        <button class="option-button" @click="goToCreate">
          <strong>Criar nova empresa</strong>
          <span>Começar do zero e configurar sua empresa dentro do Ledger Louis.</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';

const router = useRouter();
const companyStore = useCompanyStore();

const goToJoin = () => {
  router.push({ name: 'companyJoin' });
};

const goToCreate = () => {
  router.push({ name: 'companyCreate' });
};

onMounted(() => {
  if (companyStore.company.hasCompany) {
    router.replace({ name: 'companySettings' });
  }
});
</script>

<style scoped>
.onboarding-page {
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 18px;
  background-color: var(--color-surface-soft);
}

.onboarding-card {
  width: 100%;
  max-width: 640px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  padding: 32px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.onboarding-header h1 {
  font-size: 32px;
  margin: 0 0 12px;
  color: var(--color-success-dark);
}

.onboarding-header p {
  color: var(--color-text-secondary);
  line-height: 1.75;
  margin-bottom: 28px;
}

.option-list {
  display: grid;
  gap: 18px;
}

.option-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 22px;
  gap: 10px;
  border-radius: 22px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.option-button:hover {
  transform: translateY(-1px);
  background: var(--color-surface);
}

.option-button strong {
  font-size: 18px;
}

.option-button span {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
