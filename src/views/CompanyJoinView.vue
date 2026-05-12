<template>
  <main class="company-join-page">
    <section class="company-join-container">
      <header class="header-block">
        <p class="eyebrow">Entrar em Empresa</p>
        <h1>Conecte-se a uma empresa existente</h1>
        <p class="description">
          Digite o código de acesso para entrar em uma empresa.
        </p>
      </header>

      <form class="company-form" @submit.prevent="handleJoin">
        <BaseInput
          id="companyCode"
          label="Código de acesso"
          type="text"
          placeholder="12345"
          v-model="companyCode"
          required
        />

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="goBack">Voltar</button>
          <PrimaryButton type="submit" :loading="loading">Entrar</PrimaryButton>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';
import BaseInput from '@/components/inputs/BaseInput.vue';
import PrimaryButton from '@/components/inputs/PrimaryButton.vue';

const router = useRouter();
const companyStore = useCompanyStore();
const companyCode = ref('');
const loading = ref(false);

const errors = reactive({
  companyCode: false,
});

const goBack = () => {
  router.back();
};

const handleJoin = () => {
  // Limpar erros anteriores
  errors.companyCode = false;

  // Validar campo obrigatório
  if (!companyCode.value.trim()) {
    errors.companyCode = true;
    return;
  }

  loading.value = true;
  const joinedName = `Empresa ${companyCode.value}`;
  companyStore.setCompanyData({
    name: joinedName,
    cnpj: '',
    address: 'Endereço padrão da empresa',
    email: 'contato@empresa.com',
    website: 'https://www.empresa.com',
    phone: '(00) 00000-0000',
    owner: companyCode.value,
    hasCompany: true,
  });
  router.replace({ name: 'companySettings' });
  loading.value = false;
};
</script>

<style scoped>
.company-join-page {
  min-height: calc(100vh - 65px);
  padding: 0;
  background-color: var(--color-surface);
  display: block;
}

.company-join-container {
  width: 100%;
  padding: 48px 20px;
  background: var(--color-surface);
}

.header-block {
  margin-bottom: 40px;
  padding: 0 0 24px 0;
  border-bottom: 1px solid var(--color-border);
}

.eyebrow {
  color: var(--color-success-dark);
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 14px;
}

h1 {
  font-size: 36px;
  margin: 0 0 16px;
  color: var(--color-text);
}

.description {
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 680px;
  font-size: 16px;
}

.company-form {
  display: grid;
  gap: 28px;
  max-width: 600px;
}

label {
  display: grid;
  gap: 10px;
  font-weight: 600;
  color: var(--color-text);
}

input {
  width: 100%;
  min-height: 52px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  padding: 14px 16px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: var(--color-success-dark);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.form-actions button,
.form-actions ::v-deep(.primary-btn) {
  flex: 1;
  min-width: 120px;
}

/* Responsividade */
@media (max-width: 768px) {
  .company-join-page {
    padding: 0;
  }

  .company-join-container {
    padding: 32px 16px;
  }

  h1 {
    font-size: 28px;
  }

  .form-actions {
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .secondary-button {
    width: 100%;
    order: 2;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 24px;
  }

  .company-join-container {
    padding: 24px 16px;
  }

  .header-block {
    margin-bottom: 28px;
  }
}

.primary-button,
.secondary-button {
  padding: 16px 24px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  min-width: 170px;
}

.primary-button {
  border: none;
  background: var(--color-success-gradient);
  color: var(--color-surface);
}

.secondary-button {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
}
</style>
