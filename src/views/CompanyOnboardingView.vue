<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, Building2, Plus } from 'lucide-vue-next';
import PageHeader from '@/components/ui/PageHeader.vue';
import { useCompanyStore } from '@/stores/CompanyStore';
import type { UserCompanyDto } from '@/services/companyService';

const router = useRouter();
const companyStore = useCompanyStore();
const loading = ref(true);

const enterCompany = (userCompany: UserCompanyDto) => {
  companyStore.selectCompany(userCompany);
  router.push({ name: 'companySettings' });
};

onMounted(async () => {
  try {
    await companyStore.syncFromBackend();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--form">
      <PageHeader eyebrow="Comece por aqui" title="Escolha sua empresa">
        <template #title>Vamos configurar sua <span class="gradient-text">empresa</span></template>
        <template #description>Entre em uma empresa da qual você já participa ou crie a sua do zero.</template>
      </PageHeader>

      <section v-if="loading || companyStore.companies.length > 0" class="option-group" aria-label="Suas empresas">
        <p class="card-kicker">Suas empresas</p>
        <template v-if="loading">
          <span v-for="n in 2" :key="n" class="skeleton" style="height: 76px; border-radius: var(--radius-lg)" />
        </template>
        <button
          v-for="userCompany in companyStore.companies"
          v-else
          :key="userCompany.companyId"
          type="button"
          class="option"
          :class="{ 'is-current': userCompany.companyId === companyStore.company.id }"
          @click="enterCompany(userCompany)"
        >
          <span class="option-avatar">{{ userCompany.companyName.charAt(0).toUpperCase() }}</span>
          <span class="option-copy">
            <strong>{{ userCompany.companyName }}</strong>
            <span>Você participa como {{ userCompany.role }}</span>
          </span>
          <ArrowRight class="option-arrow" :size="18" />
        </button>
      </section>

      <section class="option-group">
        <RouterLink :to="{ name: 'companyCreate' }" class="option option--create">
          <span class="icon-tile icon-tile--solid"><Plus :size="20" /></span>
          <span class="option-copy">
            <strong>Criar nova empresa</strong>
            <span>Configure sua empresa no Ledger Louis em menos de um minuto.</span>
          </span>
          <ArrowRight class="option-arrow" :size="18" />
        </RouterLink>
      </section>

      <p v-if="!loading && companyStore.companies.length === 0" class="hint">
        <Building2 :size="15" />
        Recebeu um convite? Ele aparece no ícone de e-mail no topo da tela.
      </p>
    </div>
  </div>
</template>

<style scoped>
.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4) var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  text-align: left;
  transition:
    border-color var(--duration-fast) ease,
    box-shadow var(--duration) ease,
    transform var(--duration) var(--ease-out);
}

.option:hover {
  border-color: var(--color-primary-ring);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.option.is-current {
  border-color: var(--color-primary);
}

.option--create {
  border-style: dashed;
  border-color: var(--color-border-strong);
  background: transparent;
  box-shadow: none;
}

.option-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-family: var(--font-display);
  font-weight: 800;
}

.option-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.option-copy strong {
  font-family: var(--font-display);
  font-size: var(--text-md);
}

.option-copy span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.option-arrow {
  color: var(--color-text-subtle);
  transition: transform var(--duration) var(--ease-out), color var(--duration-fast) ease;
}

.option:hover .option-arrow {
  transform: translateX(3px);
  color: var(--color-primary);
}

.hint {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-subtle);
}
</style>
