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
  padding: 24px 26px;
  gap: 12px;
  border-radius: 22px;
  border: 2px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.option-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.option-button:hover {
  transform: translateY(-4px) scale(1.02);
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.option-button:hover::before {
  left: 100%;
}

.option-button:active {
  transform: translateY(-2px) scale(1.01);
}

.option-button strong {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  transition: color 0.3s;
}

.option-button:hover strong {
  color: var(--color-primary-hover);
}

.option-button span {
  color: var(--color-text-secondary);
  line-height: 1.6;
  transition: color 0.3s;
}

.option-button:hover span {
  color: var(--color-text);
}

/* Responsividade */
@media (max-width: 768px) {
  .onboarding-page {
    padding: 20px 16px;
  }

  .onboarding-card {
    padding: 24px 20px;
  }

  .onboarding-header h1 {
    font-size: 28px;
  }

  .option-list {
    gap: 16px;
  }

  .option-button {
    padding: 20px 22px;
  }

  .option-button strong {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .onboarding-header h1 {
    font-size: 24px;
  }

  .option-button {
    padding: 18px 20px;
  }

  .option-button strong {
    font-size: 16px;
  }

  .option-button span {
    font-size: 14px;
  }
}
</style>
