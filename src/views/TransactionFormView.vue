<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import TagPicker from '@/components/forms/TagPicker.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useTagStore } from '@/stores/tagStore';
import { useToast } from '@/composables/useToast';
import { apiErrorMessage } from '@/utils/apiError';
import { todayIso } from '@/utils/format';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const tagStore = useTagStore();
const toast = useToast();

// Entrada e saída usam a mesma tela; o tipo vem do meta da rota.
const entryType = computed(() => route.meta.entryType ?? 'debit');
const isIncome = computed(() => entryType.value === 'credit');

const copy = computed(() =>
  isIncome.value
    ? { title: 'Nova entrada', placeholder: 'Ex: Venda, serviço prestado...', success: 'Entrada registrada!' }
    : { title: 'Nova saída', placeholder: 'Ex: Conta de luz, fornecedor...', success: 'Saída registrada!' },
);

const createEmptyForm = () => ({ amount: '', description: '', date: todayIso() });

const form = reactive(createEmptyForm());
const selectedTagIds = ref<string[]>([]);
const errors = reactive({ description: '', amount: '' });
const saving = ref(false);

watch(entryType, () => {
  errors.description = '';
  errors.amount = '';
});

const validate = () => {
  errors.description = form.description.trim() ? '' : 'Informe uma descrição.';
  const amount = Number(form.amount);
  errors.amount = amount > 0 ? '' : 'Digite um valor maior que zero.';
  return !errors.description && !errors.amount && !!form.date;
};

const handleSubmit = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    const created = await transactionStore.createTransaction({
      amount: Number(form.amount),
      description: form.description.trim(),
      entryType: entryType.value,
      date: form.date,
    });

    if (selectedTagIds.value.length > 0) {
      await Promise.all(selectedTagIds.value.map((tagId) => tagStore.attachTag(created.id, tagId)));
    }

    toast.success(copy.value.success);
    router.push({ name: 'reports' });
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Não foi possível registrar. Tente novamente.'));
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="page-shell page-shell--form">
      <div class="card entry-card" :data-type="entryType">
        <header class="entry-header">
          <span class="icon-tile" :class="{ 'icon-tile--danger': !isIncome }">
            <ArrowUpRight v-if="isIncome" :size="20" />
            <ArrowDownRight v-else :size="20" />
          </span>
          <h1>{{ copy.title }}</h1>
        </header>

        <nav class="segmented segmented--block" aria-label="Tipo de lançamento">
          <RouterLink
            :to="{ name: 'addExpense' }"
            replace
            class="segmented-item"
            data-tone="expense"
            :class="{ 'is-active': !isIncome }"
          >
            Saída
          </RouterLink>
          <RouterLink
            :to="{ name: 'addIncome' }"
            replace
            class="segmented-item"
            data-tone="income"
            :class="{ 'is-active': isIncome }"
          >
            Entrada
          </RouterLink>
        </nav>

        <form class="form" novalidate @submit.prevent="handleSubmit">
          <div class="amount-field" :class="{ 'is-invalid': errors.amount }">
            <label for="amount" class="field-label">Valor</label>
            <div class="amount-input">
              <span aria-hidden="true">R$</span>
              <input
                id="amount"
                v-model="form.amount"
                type="number"
                inputmode="decimal"
                step="0.01"
                min="0"
                placeholder="0,00"
                autofocus
              />
            </div>
            <span v-if="errors.amount" class="field-error">{{ errors.amount }}</span>
          </div>

          <BaseInput
            v-model="form.description"
            label="Descrição"
            :placeholder="copy.placeholder"
            :error="errors.description"
          />

          <BaseInput v-model="form.date" label="Data" type="date" required />

          <TagPicker v-model="selectedTagIds" />

          <div class="form-actions">
            <BaseButton variant="secondary" size="lg" @click="router.back()">Cancelar</BaseButton>
            <BaseButton type="submit" size="lg" :variant="isIncome ? 'primary' : 'danger'" :loading="saving">
              Salvar {{ isIncome ? 'entrada' : 'saída' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

/* Faixa colorida no topo indica o tipo do lançamento. */
.entry-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background: var(--gradient-primary);
}

.entry-card[data-type='debit']::before {
  background: var(--gradient-danger);
}

.entry-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.entry-header h1 {
  font-size: var(--text-xl);
  font-weight: 800;
}

.amount-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.amount-input {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.amount-input:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

.amount-field.is-invalid .amount-input {
  border-color: var(--color-danger);
}

.amount-input span {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-subtle);
}

.amount-input input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.amount-input input::placeholder {
  color: var(--color-border-strong);
}

.entry-card[data-type='debit'] .amount-input input {
  color: var(--color-danger);
}

.entry-card[data-type='credit'] .amount-input input {
  color: var(--color-primary-strong);
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-3);
  padding-top: var(--space-2);
}
</style>
