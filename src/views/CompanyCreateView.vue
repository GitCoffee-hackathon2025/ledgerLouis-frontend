<template>
  <main class="company-create-page">
    <section class="company-create-container">
      <header class="header-block">
        <div>
          <p class="eyebrow">Cadastro de Empresa</p>
          <h1>Preencha os dados da sua nova empresa</h1>
          <p class="description">
            Informe os dados principais para que sua empresa possa ser registrada no Ledger Louis.
          
          </p>
        </div>
      </header>

      <form class="company-form" @submit.prevent="handleSubmit">
        <div class="field-grid">
          <BaseInput
            id="name"
            label="Nome da empresa"
            type="text"
            placeholder="Ex: Studio Louis"
            v-model="form.name"
            :error="errors.name"
            required
          />

          <BaseInput
            id="cnpj"
            label="CNPJ (opcional)"
            type="text"
            placeholder="00.000.000/0000-00"
            v-model="form.cnpj"
          />

          <BaseInput
            id="address"
            label="Endereço (opcional)"
            type="text"
            placeholder="Rua das Flores, 123"
            v-model="form.address"
          />

          <BaseInput
            id="email"
            label="Email"
            type="email"
            placeholder="contato@empresa.com"
            v-model="form.email"
            :error="errors.email"
            required
          />

          <BaseInput
            id="website"
            label="Site (opcional)"
            type="url"
            placeholder="https://www.empresa.com"
            v-model="form.website"
          />

          <BaseInput
            id="phone"
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            v-model="form.phone"
            :error="errors.phone"
            required
          />
        </div>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="goBack">Voltar</button>
          <PrimaryButton type="submit" :loading="loading">Criar Empresa</PrimaryButton>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';
import BaseInput from '@/components/inputs/BaseInput.vue';
import PrimaryButton from '@/components/inputs/PrimaryButton.vue';

const router = useRouter();
const companyStore = useCompanyStore();
const loading = ref(false);

const form = reactive({
  name: '',
  cnpj: '',
  address: '',
  email: '',
  website: '',
  phone: '',
});

const errors = reactive({
  name: false,
  email: false,
  phone: false,
});

const goBack = () => {
  router.back();
};

const handleSubmit = () => {
  // Limpar erros anteriores
  errors.name = false;
  errors.email = false;
  errors.phone = false;

  // Validar campos obrigatórios
  let isValid = true;
  if (!form.name.trim()) {
    errors.name = true;
    isValid = false;
  }
  if (!form.email.trim()) {
    errors.email = true;
    isValid = false;
  }
  if (!form.phone.trim()) {
    errors.phone = true;
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  loading.value = true;
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
  loading.value = false;
};
</script>

<style scoped>
.company-create-page {
  min-height: calc(100vh - 65px);
  padding: 0;
  background-color: var(--color-surface);
  display: block;
}

.company-create-container {
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

.field-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  .company-create-page {
    padding: 0;
  }

  .company-create-container {
    padding: 32px 16px;
  }

  h1 {
    font-size: 28px;
  }

  .field-grid {
    grid-template-columns: 1fr;
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

  .company-create-container {
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
