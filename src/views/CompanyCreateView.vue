<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import { useCompanyStore } from '@/stores/CompanyStore';
import PageHeader from '@/components/ui/PageHeader.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import CompanyService from '@/services/companyService';
import { useToast } from '@/composables/useToast';
import { apiErrorCode, apiErrorMessage } from '@/utils/apiError';

type Field = 'name' | 'cnpj' | 'email' | 'phone';

const router = useRouter();
const companyStore = useCompanyStore();
const companyService = new CompanyService();
const toast = useToast();

const loading = ref(false);
const submitError = ref('');

const form = reactive<Record<Field, string>>({ name: '', cnpj: '', email: '', phone: '' });
const errors = reactive<Record<Field, boolean>>({ name: false, cnpj: false, email: false, phone: false });

const fields: { key: Field; label: string; type: string; placeholder: string; autocomplete: string }[] = [
  { key: 'name', label: 'Nome da empresa', type: 'text', placeholder: 'Ex: Studio Louis', autocomplete: 'organization' },
  { key: 'cnpj', label: 'CNPJ', type: 'text', placeholder: '00.000.000/0000-00', autocomplete: 'off' },
  { key: 'email', label: 'E-mail', type: 'email', placeholder: 'contato@empresa.com', autocomplete: 'email' },
  { key: 'phone', label: 'Telefone', type: 'tel', placeholder: '(11) 99999-9999', autocomplete: 'tel' },
];

const handleSubmit = async () => {
  submitError.value = '';
  for (const { key } of fields) errors[key] = !form[key].trim();
  if (Object.values(errors).some(Boolean)) {
    submitError.value = 'Preencha todos os campos destacados.';
    return;
  }

  loading.value = true;
  try {
    const created = await companyService.createCompany(form.name.trim(), form.cnpj.trim(), {
      email: form.email.trim(),
      phone: form.phone.replace(/\D/g, ''),
    });

    companyStore.setCompanyData({
      id: created.id,
      name: created.name,
      cnpj: created.cnpj,
      email: form.email,
      phone: form.phone,
      owner: form.email,
      role: 'owner',
      hasCompany: true,
    });

    toast.success(`Empresa "${created.name}" criada!`);
    router.replace({ name: 'companySettings' });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    submitError.value = apiErrorMessage(
      error,
      apiErrorCode(error) ?? 'Erro ao criar empresa. Verifique o CNPJ e tente novamente.',
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--form">
      <PageHeader back eyebrow="Cadastro de empresa" title="Registre sua empresa">
        <template #title>Registre sua <span class="gradient-text">empresa</span></template>
        <template #description>Informe os dados principais para começar a organizar as finanças do seu negócio.</template>
      </PageHeader>

      <form class="card form" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          v-for="field in fields"
          :id="field.key"
          :key="field.key"
          v-model="form[field.key]"
          :label="field.label"
          :type="field.type"
          :placeholder="field.placeholder"
          :autocomplete="field.autocomplete"
          :error="errors[field.key]"
          @input="errors[field.key] = false"
        />

        <p v-if="submitError" class="alert alert--error" role="alert">{{ submitError }}</p>

        <BaseButton type="submit" size="lg" block :loading="loading">
          Criar empresa
          <ArrowRight :size="18" />
        </BaseButton>
      </form>
    </div>
  </div>
</template>
