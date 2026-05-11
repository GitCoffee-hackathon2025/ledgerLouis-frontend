<template>
  <main class="company-create-page">
    <section class="company-create-card">
      <header class="header-block">
        <div>
          <p class="eyebrow">Cadastro de Empresa</p>
          <h1>Preencha os dados da sua nova empresa</h1>
          <p class="description">
            Informe os dados principais para que sua empresa possa ser registrada no Ledger Louis.
            O CNPJ é opcional por enquanto.
          </p>
        </div>
      </header>

      <form class="company-form" @submit.prevent="handleSubmit">
        <div class="field-grid">
          <label>
            <span>Nome da empresa</span>
            <input v-model="form.name" type="text" placeholder="Ex: Studio Louis" required />
          </label>

          <label>
            <span>CNPJ (opcional)</span>
            <input v-model="form.cnpj" type="text" placeholder="00.000.000/0000-00" />
          </label>

          <label>
            <span>Endereço</span>
            <input v-model="form.address" type="text" placeholder="Rua das Flores, 123" required />
          </label>

          <label>
            <span>Email</span>
            <input v-model="form.email" type="email" placeholder="contato@empresa.com" required />
          </label>

          <label>
            <span>Site</span>
            <input v-model="form.website" type="url" placeholder="https://www.empresa.com" />
          </label>

          <label>
            <span>Telefone</span>
            <input v-model="form.phone" type="tel" placeholder="(11) 99999-9999" />
          </label>
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="goBack">Voltar</button>
          <button type="submit" class="primary-button">Criar Empresa</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';

const router = useRouter();
const companyStore = useCompanyStore();

const form = reactive({
  name: '',
  cnpj: '',
  address: '',
  email: '',
  website: '',
  phone: '',
});

const goBack = () => {
  router.back();
};

const handleSubmit = () => {
  companyStore.setCompanyData({
    name: form.name,
    cnpj: form.cnpj,
    address: form.address,
    email: form.email,
    website: form.website,
    phone: form.phone,
    owner: form.email,
    hasCompany: true,
  });
  router.replace({ name: 'companySettings' });
};
</script>

<style scoped>
.company-create-page {
  min-height: calc(100vh - 65px);
  padding: 32px 20px;
  background-color: var(--color-surface-soft);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.company-create-card {
  width: 100%;
  max-width: 820px;
  padding: 36px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
}

.header-block {
  margin-bottom: 28px;
}

.eyebrow {
  color: var(--color-success-dark);
  font-weight: 700;
  margin-bottom: 10px;
}

h1 {
  font-size: 30px;
  margin: 0 0 12px;
  color: var(--color-text);
}

.description {
  color: var(--color-text-secondary);
  line-height: 1.75;
  max-width: 680px;
}

.company-form {
  display: grid;
  gap: 20px;
}

.field-grid {
  display: grid;
  gap: 18px;
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
