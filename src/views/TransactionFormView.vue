<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { useTagStore } from '@/stores/tagStore';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import TagPicker from '@/components/forms/TagPicker.vue';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const recurringTransactionStore = useRecurringTransactionStore();
const tagStore = useTagStore();

// Tipo de transação: Despesa ('debit') ou Receita ('credit')
const isIncomeRoute = computed(() => route.name === 'addIncome' || route.path.includes('/income'));
const entryType = ref<'debit' | 'credit'>(isIncomeRoute.value ? 'credit' : 'debit');

watch(
  () => route.path,
  () => {
    entryType.value = isIncomeRoute.value ? 'credit' : 'debit';
  },
);

// Alternar tipo de transação mantendo a rota sincronizada
const setEntryType = (type: 'debit' | 'credit') => {
  entryType.value = type;
  const targetRouteName = type === 'credit' ? 'addIncome' : 'addExpense';
  if (route.name !== targetRouteName) {
    router.replace({ name: targetRouteName, query: route.query });
  }
};

// Alternador "Repetir lançamento"
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
  amount: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  // Campos de recorrência
  frequency: 'monthly' as RecurringFrequency,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
});

const selectedTagIds = ref<string[]>([]);
const isSubmitting = ref(false);
const feedback = reactive<{
  type: 'success' | 'error' | null;
  message: string;
  details?: string;
}>({
  type: null,
  message: '',
});

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const parsedAmount = computed(() => {
  const num = parseFloat(formData.amount);
  return isNaN(num) || num <= 0 ? null : num;
});

const frequencyLabels: Record<RecurringFrequency, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

const formatDateBr = (iso?: string | null) => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

// Resumo humano derivado dos dados
const humanSummary = computed(() => {
  const tipo = entryType.value === 'credit' ? 'Receita' : 'Despesa';
  const valStr = parsedAmount.value ? formatBRL(parsedAmount.value) : 'R$ 0,00';

  if (!isRecurring.value) {
    const dataStr = formData.date ? formatDateBr(formData.date) : 'Data não informada';
    return `${tipo} única · ${valStr} · em ${dataStr}`;
  }

  const freq = frequencyLabels[formData.frequency].toLowerCase();
  const inicio = formData.startDate ? formatDateBr(formData.startDate) : 'hoje';
  const fim = formData.endDate ? `até ${formatDateBr(formData.endDate)}` : 'sem término definido';
  return `${tipo} ${freq} · ${valStr} · a partir de ${inicio} · ${fim}`;
});

const selectedTagNames = computed(() => {
  if (!selectedTagIds.value.length || !tagStore.tags.length) return [];
  return tagStore.tags
    .filter((t) => selectedTagIds.value.includes(t.id))
    .map((t) => t.name);
});

const handleCancel = () => {
  router.push({ name: 'management' });
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();

  if (!parsedAmount.value) {
    feedback.type = 'error';
    feedback.message = 'Digite um valor válido e maior que zero.';
    return;
  }

  const description = formData.description.trim();
  if (!description) {
    feedback.type = 'error';
    feedback.message = 'Preencha a descrição do lançamento.';
    return;
  }

  try {
    isSubmitting.value = true;
    feedback.type = null;

    if (isRecurring.value) {
      if (!formData.startDate) {
        feedback.type = 'error';
        feedback.message = 'Informe a data de início da recorrência.';
        isSubmitting.value = false;
        return;
      }

      await recurringTransactionStore.createRecurringTransaction({
        description,
        amount: parsedAmount.value,
        entryType: entryType.value,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });

      feedback.type = 'success';
      feedback.message = 'Recorrência criada com sucesso.';
      feedback.details = humanSummary.value;
    } else {
      if (!formData.date) {
        feedback.type = 'error';
        feedback.message = 'Informe a data do lançamento.';
        isSubmitting.value = false;
        return;
      }

      const created = await transactionStore.createTransaction({
        amount: parsedAmount.value,
        description,
        entryType: entryType.value,
        date: formData.date,
      });

      if (selectedTagIds.value.length > 0) {
        await Promise.all(
          selectedTagIds.value.map((tagId) => tagStore.attachTag(created.id, tagId)),
        );
      }

      feedback.type = 'success';
      feedback.message = `${entryType.value === 'credit' ? 'Receita' : 'Despesa'} registrada com sucesso.`;
      feedback.details = humanSummary.value;
    }
  } catch (err: any) {
    feedback.type = 'error';
    feedback.message =
      err?.response?.data?.message ||
      'Não foi possível salvar o lançamento. Verifique os dados e tente novamente.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <main class="page-layout">
    <div class="content-container">
      <!-- Navegação de volta e Kicker -->
      <nav class="top-nav" aria-label="Navegação secundária">
        <button type="button" class="back-link" @click="handleCancel">
          <ArrowLeft :size="16" aria-hidden="true" />
          <span>Voltar para Gestão</span>
        </button>
      </nav>

      <!-- Mensagem de Sucesso Permanente (não fecha sozinha antes de ler) -->
      <section
        v-if="feedback.type === 'success'"
        class="feedback-banner success"
        role="status"
        aria-live="polite"
      >
        <div class="feedback-icon">
          <CheckCircle2 :size="20" aria-hidden="true" />
        </div>
        <div class="feedback-body">
          <h2 class="feedback-title">{{ feedback.message }}</h2>
          <p v-if="feedback.details" class="feedback-details">{{ feedback.details }}</p>
          <div class="feedback-actions">
            <button type="button" class="btn btn-primary" @click="handleCancel">
              Concluir e voltar à gestão
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="
                formData.description = '';
                formData.amount = '';
                feedback.type = null;
              "
            >
              Fazer outro lançamento
            </button>
          </div>
        </div>
      </section>

      <!-- Grade Principal: Formulário + Resumo Lateral -->
      <div v-show="feedback.type !== 'success'" class="grid-layout">
        <!-- Coluna do Formulário -->
        <section class="form-surface" aria-labelledby="form-heading">
          <header class="form-header">
            <span class="kicker">Livro-caixa</span>
            <div class="header-row">
              <h1 id="form-heading" class="page-title">
                {{ isRecurring ? 'Lançamento recorrente' : (entryType === 'credit' ? 'Nova receita' : 'Nova despesa') }}
              </h1>

              <!-- Seletor de Tipo (Despesa / Receita) -->
              <div class="type-selector" role="radiogroup" aria-label="Tipo de lançamento">
                <button
                  type="button"
                  role="radio"
                  :aria-checked="entryType === 'debit'"
                  class="type-btn"
                  :class="{ active: entryType === 'debit' }"
                  @click="setEntryType('debit')"
                >
                  Despesa
                </button>
                <button
                  type="button"
                  role="radio"
                  :aria-checked="entryType === 'credit'"
                  class="type-btn"
                  :class="{ active: entryType === 'credit' }"
                  @click="setEntryType('credit')"
                >
                  Receita
                </button>
              </div>
            </div>
          </header>

          <div
            v-if="feedback.type === 'error'"
            class="feedback-banner error"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle :size="18" aria-hidden="true" />
            <span>{{ feedback.message }}</span>
          </div>

          <form class="main-form" novalidate @submit="handleSubmit">
            <!-- Valor em destaque como primeiro foco visual -->
            <div class="form-field amount-field">
              <label for="trans-amount" class="field-label">
                Valor (R$) <span class="required" aria-hidden="true">*</span>
              </label>
              <div class="amount-input-wrap">
                <span class="currency-prefix" aria-hidden="true">R$</span>
                <input
                  id="trans-amount"
                  v-model="formData.amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  class="field-input amount-input"
                  autofocus
                />
              </div>
            </div>

            <!-- Descrição -->
            <div class="form-field">
              <label for="trans-description" class="field-label">
                Descrição <span class="required" aria-hidden="true">*</span>
              </label>
              <input
                id="trans-description"
                v-model="formData.description"
                type="text"
                required
                :placeholder="entryType === 'credit' ? 'Ex: Prestação de serviços, Venda de ativo' : 'Ex: Aluguel do espaço, Energia elétrica, Fornecedor de insumos'"
                class="field-input"
              />
            </div>

            <!-- Bloco do Alternador "Repetir" -->
            <div class="repeat-card">
              <div class="repeat-text">
                <strong class="repeat-title">Repetir</strong>
                <span class="repeat-caption">Criar uma recorrência automática para cobranças futuras</span>
              </div>
              <label class="toggle-control" for="repeat-checkbox">
                <input
                  id="repeat-checkbox"
                  v-model="isRecurring"
                  type="checkbox"
                  class="toggle-native"
                />
                <span class="toggle-track" aria-hidden="true">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="sr-only">Ativar repetição de lançamento</span>
              </label>
            </div>

            <!-- Seção de Lançamento Único -->
            <div v-if="!isRecurring" class="single-section">
              <div class="form-field">
                <label for="trans-date" class="field-label">
                  Data do lançamento <span class="required" aria-hidden="true">*</span>
                </label>
                <input
                  id="trans-date"
                  v-model="formData.date"
                  type="date"
                  required
                  class="field-input"
                />
              </div>

              <!-- Tags com picker -->
              <div class="form-field">
                <label class="field-label">Tags</label>
                <TagPicker v-model="selectedTagIds" />
              </div>
            </div>

            <!-- Seção de Lançamento Recorrente -->
            <div v-else class="recurring-section">
              <div class="form-field">
                <label for="rec-frequency" class="field-label">
                  Frequência <span class="required" aria-hidden="true">*</span>
                </label>
                <select
                  id="rec-frequency"
                  v-model="formData.frequency"
                  class="field-input select-input"
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div class="date-row">
                <div class="form-field">
                  <label for="rec-start" class="field-label">
                    Primeiro lançamento <span class="required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="rec-start"
                    v-model="formData.startDate"
                    type="date"
                    required
                    class="field-input"
                  />
                </div>

                <div class="form-field">
                  <label for="rec-end" class="field-label">
                    Término <span class="optional">(opcional)</span>
                  </label>
                  <input
                    id="rec-end"
                    v-model="formData.endDate"
                    type="date"
                    class="field-input"
                  />
                </div>
              </div>

              <p class="helper-note">
                Tags estão disponíveis para lançamentos únicos. Recorrências agendam a operação e não associam tags nesta versão.
              </p>
            </div>

            <!-- Ações -->
            <div class="action-footer">
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
                class="btn btn-primary"
              >
                <span v-if="isSubmitting">Gravando...</span>
                <span v-else>{{ isRecurring ? 'Criar recorrência' : 'Salvar lançamento' }}</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Coluna de Resumo Lateral -->
        <aside class="summary-surface" aria-label="Resumo do lançamento">
          <h2 class="summary-heading">Resumo da operação</h2>

          <dl class="summary-list">
            <div class="summary-item">
              <dt>Natureza</dt>
              <dd class="status-indicator">
                <span class="dot" :class="entryType"></span>
                <span>{{ entryType === 'credit' ? 'Receita (+)' : 'Despesa (-)' }}</span>
              </dd>
            </div>

            <div class="summary-item">
              <dt>Modalidade</dt>
              <dd>{{ isRecurring ? 'Recorrente programada' : 'Lançamento único' }}</dd>
            </div>

            <div class="summary-item highlight">
              <dt>Valor previsto</dt>
              <dd class="amount-val" :class="entryType">
                {{ parsedAmount ? formatBRL(parsedAmount) : '—' }}
              </dd>
            </div>

            <div class="summary-item">
              <dt>{{ isRecurring ? 'Programação' : 'Data de registro' }}</dt>
              <dd class="date-val">
                {{ isRecurring ? `${frequencyLabels[formData.frequency]} a partir de ${formatDateBr(formData.startDate)}` : formatDateBr(formData.date) }}
              </dd>
            </div>

            <div v-if="isRecurring && formData.endDate" class="summary-item">
              <dt>Data limite</dt>
              <dd>{{ formatDateBr(formData.endDate) }}</dd>
            </div>

            <div v-if="!isRecurring && selectedTagNames.length > 0" class="summary-item">
              <dt>Tags associadas</dt>
              <dd class="tags-preview">
                <span v-for="tag in selectedTagNames" :key="tag" class="tag-pill">{{ tag }}</span>
              </dd>
            </div>
          </dl>

          <div class="summary-note">
            <p>
              {{ isRecurring ? 'O saldo será atualizado automaticamente a cada execução programada.' : 'O valor será incorporado imediatamente ao saldo da empresa selecionada.' }}
            </p>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page-layout {
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg);
  padding: 32px 16px;
}

.content-container {
  max-width: 960px;
  margin: 0 auto;
}

.top-nav {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 8px 0;
  min-height: 44px;
}

.back-link:hover {
  color: var(--color-text);
}

.back-link:focus-visible {
  outline: 2px solid var(--color-primary);
  border-radius: 4px;
}

/* Grid com formulário à esquerda e resumo à direita */
.grid-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.form-surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
}

.form-header {
  margin-bottom: 28px;
}

.kicker {
  display: block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.type-selector {
  display: inline-flex;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 3px;
  gap: 4px;
}

.type-btn {
  min-height: 36px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-btn:hover {
  color: var(--color-text);
}

.type-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.type-btn:focus-visible {
  outline: 2px solid var(--color-primary);
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.required {
  color: var(--color-danger);
}

.optional {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.field-input {
  width: 100%;
  min-height: 44px;
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  color: var(--color-text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(29, 205, 108, 0.25));
}

.amount-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 14px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.amount-input {
  padding-left: 48px;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  height: 56px;
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.select-input {
  cursor: pointer;
}

/* Cartão do Alternador Repetir */
.repeat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.repeat-title {
  display: block;
  font-size: 14px;
  color: var(--color-text);
}

.repeat-caption {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* Switch acessível */
.toggle-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
}

.toggle-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border-radius: 999px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-native:checked + .toggle-track {
  background: var(--color-primary);
}

.toggle-native:checked + .toggle-track .toggle-thumb {
  transform: translateX(20px);
}

.toggle-native:focus-visible + .toggle-track {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.helper-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  background: var(--color-surface-soft);
  border-left: 3px solid var(--color-primary);
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
}

.recurring-section,
.single-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Rodapé de Ações */
.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-border);
}

/* Ação principal: sólida, contrastante */
.btn-primary {
  background: var(--color-primary);
  color: #111827;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(0.95);
}

/* Coluna de Resumo Lateral */
.summary-surface {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  position: sticky;
  top: 24px;
}

.summary-heading {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.summary-item dt {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.summary-item dd {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.summary-item.highlight dt {
  color: var(--color-text);
  font-weight: 600;
}

.summary-item.highlight dd.amount-val {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.amount-val.credit {
  color: var(--color-success-dark, #065F46);
}

.amount-val.debit {
  color: var(--color-danger);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.credit {
  background: var(--color-primary);
}

.dot.debit {
  background: var(--color-danger);
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.tag-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
}

.summary-note {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.summary-note p {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* Banner de Feedback */
.feedback-banner {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  margin-bottom: 24px;
}

.feedback-banner.success {
  background: var(--color-primary-glow, rgba(29, 205, 108, 0.15));
  border: 1px solid var(--color-primary);
  color: var(--color-text);
}

.feedback-banner.error {
  background: var(--color-danger-soft, #fef2f2);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  align-items: center;
}

.feedback-icon {
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.feedback-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.feedback-details {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.feedback-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 820px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }

  .summary-surface {
    position: static;
  }

  .form-surface {
    padding: 20px;
  }

  .date-row {
    grid-template-columns: 1fr;
  }
}
</style>
