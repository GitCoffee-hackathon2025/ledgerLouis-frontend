<template>
  <main class="company-join-page">
    <section class="company-join-card">
      <header class="header-block">
        <p class="eyebrow">Entrar em Empresa</p>
        <h1>Conecte-se a uma empresa existente</h1>
        <p class="description">
          Por enquanto, você pode usar o nome da empresa para acessar um perfil existente sem autenticação.
        </p>
      </header>

      <form class="company-form" @submit.prevent="handleJoin">
        <label>
          <span>Nome da empresa</span>
          <input v-model="companyName" type="text" placeholder="Ex: Studio Louis" required />
        </label>

        <label>
          <span>Código de acesso (opcional)</span>
          <input v-model="companyCode" type="text" placeholder="12345" />
        </label>

        <div class="form-actions">
          <button type="button" class="secondary-button" @click="goBack">Voltar</button>
          <button type="submit" class="primary-button">Entrar</button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/CompanyStore';

const router = useRouter();
const companyStore = useCompanyStore();
const companyName = ref('');
const companyCode = ref('');

const goBack = () => {
  router.back();
};

const handleJoin = () => {
  const joinedName = companyName.value.trim() || 'Empresa Conectada';
  companyStore.setCompanyData({
    name: joinedName,
    cnpj: '',
    address: 'Endereço padrão da empresa',
    email: 'contato@empresa.com',
    website: 'https://www.empresa.com',
    phone: '(00) 00000-0000',
    owner: companyCode.value ? `Código ${companyCode.value}` : 'Usuário Conectado',
    hasCompany: true,
  });
  router.replace({ name: 'companySettings' });
};
</script>

<style scoped>
.company-join-page {
  min-height: calc(100vh - 65px);
  padding: 32px 20px;
  background-color: var(--color-surface-soft);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.company-join-card {
  width: 100%;
  max-width: 700px;
  padding: 34px;
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
