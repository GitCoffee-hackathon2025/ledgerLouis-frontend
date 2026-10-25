<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { useTagStore } from '@/stores/tagStore';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import TagPicker from '@/components/forms/TagPicker.vue';
import ResponsePopUp from '@/components/forms/ResponsePopUp.vue';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const recurringTransactionStore = useRecurringTransactionStore();
const tagStore = useTagStore();

// Tipo de transação (débito/saída ou crédito/entrada) determinado pela rota
const isIncomeRoute = computed(() => route.name === 'addIncome' || route.path.includes('/income'));
const entryType = ref<'debit' | 'credit'>(isIncomeRoute.value ? 'credit' : 'debit');

watch(
  () => route.path,
  () => {
    entryType.value = isIncomeRoute.value ? 'credit' : 'debit';
  },
);

// Alternador "Repetir" (lançamento recorrente)
const isRecurring = ref(false);

const checkRepeatQuery = () => {
  const repetirParam = route.query.repetir;
  if (repetirParam === '1' || repetirParam === 'true') {
    isRecurring.value = true;
  }
};

onMounted(() => {
  checkRepeatQuery();
});

watch(
  () => route.query.repetir,
  () => {
    checkRepeatQuery();
  },
);

const formData = reactive({
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  // Campos específicos de recorrência
  frequency: 'monthly' as RecurringFrequency,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
});

const selectedTagIds = ref<string[]>([]);
const isSubmitting = ref(false);

const response = reactive({
  status: '',
  message: '',
  show: false,
});

const closeResponse = () => {
  response.show = false;
};

const handleCancel = () => {
  router.push({ name: 'management' });
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  const description = formData.description.trim();
  if (!description) {
    response.status = 'error';
    response.message = 'Preencha a descrição do lançamento.';
    response.show = true;
    return;
  }

  const amount = parseFloat(formData.amount);
  if (isNaN(amount) || amount <= 0) {
    response.status = 'error';
    response.message = 'Digite um valor válido e maior que zero.';
    response.show = true;
    return;
  }

  try {
    isSubmitting.value = true;

    if (isRecurring.value) {
      if (!formData.startDate) {
        response.status = 'error';
        response.message = 'Informe a data de início da recorrência.';
        response.show = true;
        isSubmitting.value = false;
        return;
      }

      await recurringTransactionStore.createRecurringTransaction({
        description,
        amount,
        entryType: entryType.value,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });

      response.status = 'success';
      response.message = `${entryType.value === 'credit' ? 'Entrada' : 'Saída'} recorrente criada com sucesso!`;
      response.show = true;
    } else {
      if (!formData.date) {
        response.status = 'error';
        response.message = 'Informe a data do lançamento.';
        response.show = true;
        isSubmitting.value = false;
        return;
      }

      const created = await transactionStore.createTransaction({
        amount,
        description,
        entryType: entryType.value,
        date: formData.date,
      });

      if (selectedTagIds.value.length > 0) {
        await Promise.all(
          selectedTagIds.value.map((tagId) => tagStore.attachTag(created.id, tagId)),
        );
      }

      response.status = 'success';
      response.message = `${entryType.value === 'credit' ? 'Entrada' : 'Saída'} registrada com sucesso!`;
      response.show = true;
    }

    setTimeout(() => {
      router.push({ name: 'management' });
    }, 1500);
  } catch (error: any) {
    response.status = 'error';
    response.message =
      error?.response?.data?.message ||
      'Erro ao salvar lançamento. Verifique os dados e tente novamente.';
    response.show = true;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container">
    <div class="card">
      <header class="header">
        <div class="entry-switcher" role="tablist" aria-label="Tipo de transação">
          <button
            type="button"
            role="tab"
            :aria-selected="entryType === 'debit'"
            class="switch-btn switch-debit"
            :class="{ active: entryType === 'debit' }"
            @click="entryType = 'debit'"
          >
            Saída
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="entryType === 'credit'"
            class="switch-btn switch-credit"
            :class="{ active: entryType === 'credit' }"
            @click="entryType = 'credit'"
          >
            Entrada
          </button>
        </div>

        <h1 class="title">
          {{ isRecurring ? 'Lançamento Recorrente' : (entryType === 'credit' ? 'Nova Entrada' : 'Nova Saída') }}
        </h1>
      </header>

      <ResponsePopUp
        :status="response.status"
        :message="response.message"
        :show="response.show"
        @close="closeResponse"
      />

      <form class="form" @submit="handleSubmit">
        <!-- Descrição -->
        <div class="form-group">
          <label for="transaction-description" class="form-label">Descrição *</label>
          <input
            id="transaction-description"
            v-model="formData.description"
            type="text"
            required
            :placeholder="entryType === 'credit' ? 'Ex: Venda de produto, Consultoria' : 'Ex: Aluguel, Conta de luz, Fornecedor'"
            class="form-input"
          />
        </div>

        <!-- Valor -->
        <div class="form-group">
          <label for="transaction-amount" class="form-label">Valor (R$) *</label>
          <input
            id="transaction-amount"
            v-model="formData.amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
            class="form-input amount-input"
          />
        </div>

        <!-- Alternador Repetir -->
        <div class="repeat-toggle-card">
          <div class="repeat-info">
            <span class="repeat-title">Repetir lançamento</span>
            <span class="repeat-description">Gera cobrança automaticamente nas datas programadas</span>
          </div>
          <label class="toggle-switch" for="repeat-toggle">
            <input
              id="repeat-toggle"
              v-model="isRecurring"
              type="checkbox"
              class="toggle-checkbox"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <!-- Campos de Lançamento Padrão -->
        <template v-if="!isRecurring">
          <div class="form-group">
            <label for="transaction-date" class="form-label">Data *</label>
            <input
              id="transaction-date"
              v-model="formData.date"
              type="date"
              required
              class="form-input"
            />
          </div>

          <!-- Tags disponíveis apenas para lançamentos padrão -->
          <div class="form-group">
            <label class="form-label">Tags</label>
            <TagPicker v-model="selectedTagIds" />
          </div>
        </template>

        <!-- Campos de Lançamento Recorrente -->
        <template v-else>
          <div class="form-group">
            <label for="recurring-frequency" class="form-label">Frequência *</label>
            <div class="select-wrapper">
              <select
                id="recurring-frequency"
                v-model="formData.frequency"
                class="form-select"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="recurring-start-date" class="form-label">Início *</label>
              <input
                id="recurring-start-date"
                v-model="formData.startDate"
                type="date"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="recurring-end-date" class="form-label">Término (opcional)</label>
              <input
                id="recurring-end-date"
                v-model="formData.endDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>
        </template>

        <!-- Botões de Ação -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn"
            :class="entryType === 'credit' ? 'btn-success' : 'btn-danger'"
          >
            {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 175px);
  background-color: var(--color-surface-soft);
  padding: 24px 16px;
}

.card {
  background: var(--color-surface);
  border-radius: 24px;
  border: 1px solid var(--color-border);
  padding: 32px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.header {
  margin-bottom: 24px;
}

.entry-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.switch-btn {
  min-height: 40px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.switch-btn:hover {
  color: var(--color-text);
}

.switch-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.switch-btn.switch-debit.active {
  color: var(--color-danger);
}

.switch-btn.switch-credit.active {
  color: var(--color-success);
}

.title {
  font-family: var(--font-display, inherit);
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 12px);
  font-size: 15px;
  font-family: inherit;
  background-color: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(29, 205, 108, 0.2));
}

.amount-input {
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 12px);
  font-size: 15px;
  font-family: inherit;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(29, 205, 108, 0.2));
}

.repeat-toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input, 12px);
  gap: 12px;
}

.repeat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.repeat-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.repeat-description {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Accessible custom toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background-color: var(--color-border);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked + .toggle-slider {
  background-color: var(--color-primary);
}

.toggle-checkbox:focus-visible + .toggle-slider {
  box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(29, 205, 108, 0.3));
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.btn {
  flex: 1;
  min-height: 44px;
  padding: 12px 18px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-surface-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: var(--color-danger);
  color: #ffffff;
}

.btn-danger:hover:not(:disabled) {
  filter: brightness(0.92);
}

.btn-success {
  background-color: var(--color-success);
  color: #ffffff;
}

.btn-success:hover:not(:disabled) {
  filter: brightness(0.92);
}

@media (max-width: 640px) {
  .card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
