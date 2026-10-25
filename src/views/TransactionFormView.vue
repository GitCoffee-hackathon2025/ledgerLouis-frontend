<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-vue-next';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { useTagStore } from '@/stores/tagStore';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import TagPicker from '@/components/forms/TagPicker.vue';
import TransactionFormEffect from '@/components/transaction/TransactionFormEffect.vue';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { formatDateBr } from '@/utils/dateUtils';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const recurringTransactionStore = useRecurringTransactionStore();
const tagStore = useTagStore();

// Tipo de transação: Despesa ('debit') ou Receita ('credit')
const isIncomeRoute = computed(() => route.name === 'addIncome' || route.path.includes('/income'));
const entryType = ref<'debit' | 'credit'>(isIncomeRoute.value ? 'credit' : 'debit');

// Alternador "Repetir lançamento"
const isRecurring = ref(false);

const syncFromRoute = () => {
  const isIncome = route.name === 'addIncome' || route.path.endsWith('/income');
  entryType.value = isIncome ? 'credit' : 'debit';

  const repetirParam = route.query.repetir;
  isRecurring.value = repetirParam === '1' || repetirParam === 'true';
};

onMounted(async () => {
  syncFromRoute();
  await transactionStore.fetchAccountValue();
});

watch(
  () => [route.name, route.path, route.query.repetir],
  () => {
    syncFromRoute();
  },
  { immediate: true },
);

const setEntryType = (type: 'debit' | 'credit') => {
  entryType.value = type;
  const targetRouteName = type === 'credit' ? 'addIncome' : 'addExpense';
  if (route.name !== targetRouteName) {
    router.replace({ name: targetRouteName, query: route.query });
  }
};

const toggleRecurring = (val: boolean) => {
  isRecurring.value = val;
  const nextQuery = { ...route.query };
  if (val) {
    nextQuery.repetir = '1';
  } else {
    delete nextQuery.repetir;
  }
  const currentRouteName = route.name || (entryType.value === 'credit' ? 'addIncome' : 'addExpense');
  router.replace({ name: currentRouteName, query: nextQuery });
};

const formData = reactive({
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0] as string,
  frequency: 'monthly' as RecurringFrequency,
  startDate: new Date().toISOString().split('T')[0] as string,
  endDate: '',
});

const selectedTagIds = ref<string[]>([]);
const isSubmitting = ref(false);

// Preservação do ID criado para evitar duplicidade financeira (Achado 2)
const createdTransactionId = ref<string | null>(null);
const pendingTagIds = ref<string[]>([]);
const isRetryingTags = ref(false);

const feedback = reactive<{
  type: 'success' | 'partial' | 'error' | null;
  message: string;
  details?: string;
}>({
  type: null,
  message: '',
});

// Validação por campo e foco
const fieldErrors = reactive<{
  amount?: string;
  description?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}>({});

const amountInputRef = ref<HTMLInputElement | null>(null);
const descInputRef = ref<HTMLInputElement | null>(null);
const dateInputRef = ref<HTMLInputElement | null>(null);
const startDateInputRef = ref<HTMLInputElement | null>(null);
const endDateInputRef = ref<HTMLInputElement | null>(null);
const successBannerRef = ref<HTMLElement | null>(null);
const partialBannerRef = ref<HTMLElement | null>(null);
const errorBannerRef = ref<HTMLElement | null>(null);

const clearFieldErrors = () => {
  fieldErrors.amount = undefined;
  fieldErrors.description = undefined;
  fieldErrors.date = undefined;
  fieldErrors.startDate = undefined;
  fieldErrors.endDate = undefined;
};

const focusFirstError = () => {
  nextTick(() => {
    if (fieldErrors.amount) amountInputRef.value?.focus();
    else if (fieldErrors.description) descInputRef.value?.focus();
    else if (fieldErrors.date) dateInputRef.value?.focus();
    else if (fieldErrors.startDate) startDateInputRef.value?.focus();
    else if (fieldErrors.endDate) endDateInputRef.value?.focus();
  });
};

const parsedAmount = computed(() => {
  const num = parseFloat(formData.amount);
  return isNaN(num) || num <= 0 ? null : num;
});

const currentBalance = computed(() => transactionStore.accountValue ?? 0);

const pageTitle = computed(() => {
  if (isRecurring.value) return 'Lançamento recorrente';
  return entryType.value === 'credit' ? 'Nova receita' : 'Nova despesa';
});

const submitButtonLabel = computed(() => {
  if (isRecurring.value) return 'Criar recorrência';
  return entryType.value === 'credit' ? 'Salvar receita' : 'Salvar despesa';
});

const handleCancel = () => {
  router.push({ name: 'management' });
};

const resetFormForNewTransaction = () => {
  formData.description = '';
  formData.amount = '';
  formData.endDate = '';
  formData.date = new Date().toISOString().split('T')[0] as string;
  formData.startDate = new Date().toISOString().split('T')[0] as string;
  selectedTagIds.value = [];
  createdTransactionId.value = null;
  pendingTagIds.value = [];
  feedback.type = null;
  feedback.message = '';
  feedback.details = undefined;
  clearFieldErrors();
  nextTick(() => {
    amountInputRef.value?.focus();
  });
};

const isAlreadyLinkedError = (err: any): boolean => {
  const status = err?.response?.status;
  const code = err?.response?.data?.code || err?.response?.data?.error;
  const message = err?.response?.data?.message || err?.message || '';
  return (
    status === 409 ||
    code === 'TAG_ALREADY_LINKED' ||
    (typeof message === 'string' && message.includes('TAG_ALREADY_LINKED'))
  );
};

const processTagAttachment = async (txId: string, tagIdsToAttach: string[]): Promise<string[]> => {
  const results = await Promise.allSettled(
    tagIdsToAttach.map((tagId) => tagStore.attachTag(txId, tagId)),
  );

  const stillPending: string[] = [];
  results.forEach((res, idx) => {
    const tagId = tagIdsToAttach[idx];
    if (!tagId) return;
    if (res.status === 'fulfilled') {
      return;
    }
    if (isAlreadyLinkedError(res.reason)) {
      return;
    }
    stillPending.push(tagId);
  });

  return stillPending;
};

const retryAttachTags = async () => {
  if (!createdTransactionId.value || pendingTagIds.value.length === 0) return;
  try {
    isRetryingTags.value = true;
    const stillPending = await processTagAttachment(createdTransactionId.value, [...pendingTagIds.value]);
    pendingTagIds.value = stillPending;
    if (stillPending.length === 0) {
      feedback.type = 'success';
      feedback.message = `${entryType.value === 'credit' ? 'Receita' : 'Despesa'} registrada e tags associadas com sucesso.`;
      nextTick(() => {
        successBannerRef.value?.focus();
      });
    } else {
      feedback.type = 'partial';
      feedback.message = 'Ainda não foi possível associar todas as tags. O lançamento já está salvo.';
      nextTick(() => {
        partialBannerRef.value?.focus();
      });
    }
  } catch {
    feedback.type = 'partial';
    feedback.message = 'Ainda não foi possível associar as tags. O lançamento já está salvo.';
    nextTick(() => {
      partialBannerRef.value?.focus();
    });
  } finally {
    isRetryingTags.value = false;
  }
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  clearFieldErrors();

  if (createdTransactionId.value && pendingTagIds.value.length > 0) {
    await retryAttachTags();
    return;
  }

  let hasError = false;

  if (!parsedAmount.value) {
    fieldErrors.amount = 'Digite um valor válido e maior que zero.';
    hasError = true;
  }

  const description = formData.description.trim();
  if (!description) {
    fieldErrors.description = 'Preencha a descrição do lançamento.';
    hasError = true;
  }

  if (isRecurring.value) {
    if (!formData.startDate) {
      fieldErrors.startDate = 'Informe a data de início da recorrência.';
      hasError = true;
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      fieldErrors.endDate = 'A data de término não pode ser anterior ao início.';
      hasError = true;
    }
  } else {
    if (!formData.date) {
      fieldErrors.date = 'Informe a data do lançamento.';
      hasError = true;
    }
  }

  if (hasError) {
    focusFirstError();
    return;
  }

  try {
    isSubmitting.value = true;
    feedback.type = null;

    if (isRecurring.value) {
      await recurringTransactionStore.createRecurringTransaction({
        description,
        amount: parsedAmount.value!,
        entryType: entryType.value,
        frequency: formData.frequency,
        startDate: formData.startDate!,
        endDate: formData.endDate || undefined,
      });

      feedback.type = 'success';
      feedback.message = 'Recorrência criada com sucesso.';
      nextTick(() => {
        successBannerRef.value?.focus();
      });
    } else {
      let txId = createdTransactionId.value;
      if (!txId) {
        const created = await transactionStore.createTransaction({
          amount: parsedAmount.value!,
          description,
          entryType: entryType.value,
          date: formData.date!,
        });
        txId = created.id;
        createdTransactionId.value = created.id;
      }

      if (selectedTagIds.value.length > 0) {
        pendingTagIds.value = [...selectedTagIds.value];
        const stillPending = await processTagAttachment(txId!, [...pendingTagIds.value]);
        pendingTagIds.value = stillPending;
        if (stillPending.length > 0) {
          feedback.type = 'partial';
          feedback.message = 'Lançamento salvo, mas ocorreu um erro ao associar as tags.';
          nextTick(() => {
            partialBannerRef.value?.focus();
          });
          return;
        }
      }

      feedback.type = 'success';
      feedback.message = `${entryType.value === 'credit' ? 'Receita' : 'Despesa'} registrada com sucesso.`;
      nextTick(() => {
        successBannerRef.value?.focus();
      });
    }
  } catch (err: any) {
    feedback.type = 'error';
    const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
    feedback.message =
      typeof serverMsg === 'string'
        ? serverMsg
        : 'Não foi possível salvar o lançamento. Verifique os dados e tente novamente.';

    // Mapeamento estruturado de erros por campo retornados do backend
    const errorsObj = err?.response?.data?.errors;
    if (errorsObj && typeof errorsObj === 'object') {
      for (const [key, val] of Object.entries(errorsObj)) {
        if (key in fieldErrors) {
          fieldErrors[key as keyof typeof fieldErrors] = Array.isArray(val) ? val.join(', ') : String(val);
        }
      }
    } else if (typeof serverMsg === 'string') {
      const lower = serverMsg.toLowerCase();
      if (lower.includes('valor') || lower.includes('amount')) {
        fieldErrors.amount = serverMsg;
      } else if (lower.includes('descri') || lower.includes('description')) {
        fieldErrors.description = serverMsg;
      } else if (lower.includes('término') || lower.includes('fim') || lower.includes('enddate') || lower.includes('end_date')) {
        fieldErrors.endDate = serverMsg;
      } else if (lower.includes('início') || lower.includes('startdate') || lower.includes('start_date')) {
        fieldErrors.startDate = serverMsg;
      } else if (lower.includes('data') || lower.includes('date')) {
        fieldErrors.date = serverMsg;
      }
    }

    nextTick(() => {
      const hasFieldErr = Object.values(fieldErrors).some(Boolean);
      if (hasFieldErr) {
        focusFirstError();
      } else {
        errorBannerRef.value?.focus();
      }
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <main class="lg-page">
    <!-- Navegação de volta e Seletor Segmentado -->
    <nav class="form-nav" aria-label="Navegação secundária">
      <button type="button" class="lg-btn lg-btn--quiet back-btn" @click="handleCancel">
        <ArrowLeft :size="16" aria-hidden="true" />
        <span>Voltar para gestão</span>
      </button>
    </nav>

    <!-- Cabeçalho da Página com Título e Segmentado -->
    <header class="lg-page-head">
      <div>
        <h1 class="lg-title">{{ pageTitle }}</h1>
        <p class="lg-lede">
          Registre movimentações avulsas ou configure agendamentos automáticos para o livro-caixa.
        </p>
      </div>

      <!-- Segmentado Nativo Despesa / Receita -->
      <fieldset class="lg-segmented" aria-label="Tipo de lançamento financeiro">
        <input
          id="seg-debit"
          type="radio"
          name="formEntryType"
          value="debit"
          :checked="entryType === 'debit'"
          @change="setEntryType('debit')"
        />
        <label for="seg-debit">Despesa</label>

        <input
          id="seg-credit"
          type="radio"
          name="formEntryType"
          value="credit"
          :checked="entryType === 'credit'"
          @change="setEntryType('credit')"
        />
        <label for="seg-credit">Receita</label>
      </fieldset>
    </header>

    <!-- Banner de Sucesso Total -->
    <section
      v-if="feedback.type === 'success'"
      ref="successBannerRef"
      class="lg-section feedback-box is-income"
      tabindex="-1"
      role="status"
      aria-live="polite"
    >
      <div class="feedback-head">
        <CheckCircle2 :size="20" aria-hidden="true" />
        <h2 class="lg-h2">{{ feedback.message }}</h2>
      </div>
      <p class="lg-note">O saldo e as projeções já foram sincronizados.</p>
      <div class="lg-actions" style="margin-top: 16px;">
        <button type="button" class="lg-btn lg-btn--primary" @click="handleCancel">
          Concluir e voltar à gestão
        </button>
        <button type="button" class="lg-btn lg-btn--quiet" @click="resetFormForNewTransaction">
          Fazer outro lançamento
        </button>
      </div>
    </section>

    <!-- Banner de Sucesso Parcial (Tags falharam) -->
    <section
      v-if="feedback.type === 'partial'"
      ref="partialBannerRef"
      class="lg-section feedback-box is-expense"
      tabindex="-1"
      role="alert"
      aria-live="assertive"
    >
      <div class="feedback-head">
        <AlertTriangle :size="20" aria-hidden="true" />
        <h2 class="lg-h2">Lançamento salvo, tags não associadas</h2>
      </div>
      <p class="lg-note">
        O valor financeiro foi gravado com sucesso, mas ocorreu uma falha de rede ao associar as tags.
      </p>
      <div class="lg-actions" style="margin-top: 16px;">
        <button
          type="button"
          class="lg-btn lg-btn--primary"
          :disabled="isRetryingTags"
          @click="retryAttachTags"
        >
          {{ isRetryingTags ? 'Gravando tags...' : 'Tentar só as tags pendentes' }}
        </button>
        <button type="button" class="lg-btn lg-btn--quiet" @click="handleCancel">
          Concluir sem tags e voltar
        </button>
        <button type="button" class="lg-btn lg-btn--quiet" @click="resetFormForNewTransaction">
          Fazer outro lançamento
        </button>
      </div>
    </section>

    <!-- Formulário em Grade: 7 colunas formulário + 5 colunas efeito -->
    <div
      v-show="feedback.type !== 'success' && feedback.type !== 'partial'"
      class="lg-grid"
    >
      <!-- Coluna Principal do Formulário (lg-span-7) -->
      <section class="lg-span-7 lg-section" aria-labelledby="form-section-heading">
        <h2 id="form-section-heading" class="sr-only">Dados da movimentação</h2>

        <div
          v-if="feedback.type === 'error'"
          ref="errorBannerRef"
          class="lg-error server-error-banner"
          role="alert"
          tabindex="-1"
          style="margin-bottom: 16px;"
        >
          {{ feedback.message }}
        </div>

        <form class="main-form" novalidate @submit="handleSubmit">
          <!-- Campo 1: Valor em destaque -->
          <div class="lg-field">
            <label for="trans-amount-input" class="lg-label">
              Valor (R$)
            </label>
            <input
              id="trans-amount-input"
              ref="amountInputRef"
              v-model="formData.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0,00"
              class="lg-input lg-input--amount"
              :aria-invalid="!!fieldErrors.amount"
              :aria-describedby="fieldErrors.amount ? 'amount-err' : undefined"
              autofocus
            />
            <span v-if="fieldErrors.amount" id="amount-err" class="lg-error" role="alert">
              {{ fieldErrors.amount }}
            </span>
          </div>

          <!-- Campo 2: Descrição -->
          <div class="lg-field">
            <label for="trans-desc-input" class="lg-label">
              Descrição
            </label>
            <input
              id="trans-desc-input"
              ref="descInputRef"
              v-model="formData.description"
              type="text"
              required
              :placeholder="entryType === 'credit' ? 'Ex: Prestação de serviços, Venda de ativo' : 'Ex: Aluguel do espaço, Energia elétrica, Insumos'"
              class="lg-input"
              :aria-invalid="!!fieldErrors.description"
              :aria-describedby="fieldErrors.description ? 'desc-err' : undefined"
            />
            <span v-if="fieldErrors.description" id="desc-err" class="lg-error" role="alert">
              {{ fieldErrors.description }}
            </span>
          </div>

          <!-- Campos do Lançamento Único -->
          <div v-if="!isRecurring" class="single-fields-grid">
            <div class="lg-field">
              <label for="trans-date-input" class="lg-label">
                Data do lançamento
              </label>
              <input
                id="trans-date-input"
                ref="dateInputRef"
                v-model="formData.date"
                type="date"
                required
                class="lg-input"
                :aria-invalid="!!fieldErrors.date"
                :aria-describedby="fieldErrors.date ? 'date-err' : undefined"
              />
              <span v-if="fieldErrors.date" id="date-err" class="lg-error" role="alert">
                {{ fieldErrors.date }}
              </span>
            </div>

            <div class="lg-field">
              <TagPicker v-model="selectedTagIds" />
            </div>
          </div>

          <!-- Interruptor de Repetição -->
          <label class="lg-switch" for="repeat-switch-input">
            <div>
              <span class="lg-label" style="display: block;">Repetir periodicamente</span>
              <span class="lg-hint">Gere agendamentos futuros semanais, mensais ou anuais</span>
            </div>
            <input
              id="repeat-switch-input"
              type="checkbox"
              :checked="isRecurring"
              @change="toggleRecurring(($event.target as HTMLInputElement).checked)"
            />
          </label>

          <!-- Campos da Recorrência -->
          <div v-if="isRecurring" class="recurring-fields-grid">
            <div class="lg-field">
              <label for="rec-frequency-select" class="lg-label">
                Frequência
              </label>
              <select
                id="rec-frequency-select"
                v-model="formData.frequency"
                class="lg-select"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div class="dates-split">
              <div class="lg-field">
                <label for="rec-start-input" class="lg-label">
                  Primeiro lançamento
                </label>
                <input
                  id="rec-start-input"
                  ref="startDateInputRef"
                  v-model="formData.startDate"
                  type="date"
                  required
                  class="lg-input"
                  :aria-invalid="!!fieldErrors.startDate"
                  :aria-describedby="fieldErrors.startDate ? 'start-err' : undefined"
                />
                <span v-if="fieldErrors.startDate" id="start-err" class="lg-error" role="alert">
                  {{ fieldErrors.startDate }}
                </span>
              </div>

              <div class="lg-field">
                <label for="rec-end-input" class="lg-label">
                  Término (opcional)
                </label>
                <input
                  id="rec-end-input"
                  ref="endDateInputRef"
                  v-model="formData.endDate"
                  type="date"
                  class="lg-input"
                  :aria-invalid="!!fieldErrors.endDate"
                  :aria-describedby="fieldErrors.endDate ? 'end-err' : undefined"
                />
                <span v-if="fieldErrors.endDate" id="end-err" class="lg-error" role="alert">
                  {{ fieldErrors.endDate }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rodapé de Ações do Formulário -->
          <div class="lg-actions form-footer">
            <button
              type="button"
              class="lg-btn lg-btn--quiet"
              @click="handleCancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="lg-btn lg-btn--primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Gravando...' : submitButtonLabel }}
            </button>
          </div>
        </form>
      </section>

      <!-- Coluna de Efeito Financeiro (lg-span-5) -->
      <div class="lg-span-5">
        <TransactionFormEffect
          :entry-type="entryType"
          :amount="parsedAmount"
          :is-recurring="isRecurring"
          :frequency="formData.frequency"
          :start-date="formData.startDate"
          :end-date="formData.endDate"
          :current-balance="currentBalance"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.form-nav {
  margin-bottom: 16px;
}

.back-btn {
  padding-left: 0;
}

.feedback-box {
  padding: 24px;
  margin-bottom: 24px;
}

.feedback-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.form-segmented label {
  min-height: 44px;
}

.server-error-banner:focus-visible {
  outline: 2px solid var(--lg-focus);
  outline-offset: 2px;
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.single-fields-grid {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.recurring-fields-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
}

.dates-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-footer {
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--lg-line);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .dates-split {
    grid-template-columns: 1fr;
  }
}
</style>
