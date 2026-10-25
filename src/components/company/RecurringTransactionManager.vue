<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Pause, Play, PlayCircle, Plus, Trash2 } from 'lucide-vue-next';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import MoneyValue from '@/components/ui/MoneyValue.vue';
import { formatDateBr } from '@/utils/dateUtils';

const router = useRouter();
const store = useRecurringTransactionStore();
const companyStore = useCompanyStore();

const isOwner = computed(() => companyStore.company.role === 'owner');
const canManage = computed(() => companyStore.company.role === 'owner' || companyStore.company.role === 'admin');

const runningId = ref<string | null>(null);
const message = reactive({ status: '', text: '', show: false });

const frequencyLabels: Record<RecurringFrequency, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

const sortedItems = computed(() =>
  [...store.items].sort((a, b) => a.nextRunDate.localeCompare(b.nextRunDate)),
);

const notify = (status: 'success' | 'error', text: string) => {
  message.status = status;
  message.text = text;
  message.show = true;
  setTimeout(() => {
    message.show = false;
  }, 3500);
};

const handleDelete = async (id: string) => {
  if (!canManage.value) {
    notify('error', 'Permissão insuficiente: apenas proprietário ou administrador podem excluir recorrências.');
    return;
  }
  try {
    await store.deleteRecurringTransaction(id);
    notify('success', 'Lançamento recorrente removido.');
  } catch (err: any) {
    notify('error', err?.response?.data?.message || 'Erro ao remover lançamento recorrente.');
  }
};

const handleToggleStatus = async (id: string, currentStatus: string) => {
  if (!canManage.value) {
    notify('error', 'Permissão insuficiente: apenas proprietário ou administrador podem alterar o status.');
    return;
  }
  try {
    await store.updateRecurringTransaction(id, {
      status: currentStatus === 'active' ? 'paused' : 'active',
    });
    notify('success', currentStatus === 'active' ? 'Recorrência pausada.' : 'Recorrência retomada.');
  } catch (err: any) {
    notify('error', err?.response?.data?.message || 'Erro ao atualizar status.');
  }
};

const handleRunNow = async (id: string) => {
  if (!isOwner.value) {
    notify('error', 'Permissão insuficiente: apenas o proprietário (owner) pode disparar lançamentos manuais.');
    return;
  }
  runningId.value = id;
  try {
    const result = await store.runNow(id);
    notify(
      'success',
      result.created > 0 ? 'Lançamento gerado com sucesso.' : 'Nada vencido para lançar no momento.',
    );
  } catch (err: any) {
    notify('error', err?.response?.data?.message || 'Erro ao lançar agora.');
  } finally {
    runningId.value = null;
  }
};

onMounted(() => {
  store.fetchRecurringTransactions();
});
</script>

<script lang="ts">
export default {
  name: 'RecurringTransactionManager',
};
</script>

<template>
  <div class="lg-section">
    <header class="lg-section-head">
      <div>
        <h2 class="lg-h2">Recorrências</h2>
        <p class="lg-note">Lançamentos automáticos programados para execução futura.</p>
      </div>

      <button
        type="button"
        class="lg-btn lg-btn--primary"
        @click="router.push({ name: 'addExpense', query: { repetir: '1' } })"
      >
        <Plus :size="16" aria-hidden="true" />
        <span>Nova recorrente</span>
      </button>
    </header>

    <div
      v-if="message.show"
      :class="message.status === 'error' ? 'lg-error' : 'is-income'"
      class="recurring-feedback"
      role="alert"
      aria-live="polite"
    >
      {{ message.text }}
    </div>

    <p v-if="!canManage" class="lg-note" style="margin-bottom: 16px;">
      Visualização apenas: seu papel não possui permissão para editar ou excluir recorrências.
    </p>

    <div v-if="sortedItems.length === 0" class="lg-empty">
      Nenhum lançamento recorrente criado ainda nesta empresa.
    </div>

    <ul v-else class="lg-rows" role="list">
      <li v-for="item in sortedItems" :key="item.id" class="lg-row">
        <div class="lg-row-main">
          <div class="recurring-title-line">
            <span class="lg-row-title">{{ item.description }}</span>
            <span
              v-if="item.status === 'active'"
              class="lg-badge is-income"
            >
              Ativo
            </span>
            <span
              v-else-if="item.status === 'paused'"
              class="lg-badge"
            >
              Pausado
            </span>
            <span
              v-else
              class="lg-badge is-muted"
            >
              Finalizado
            </span>
          </div>

          <div class="lg-row-meta recurring-meta-line">
            <span>{{ frequencyLabels[item.frequency] }}</span>
            <span>Próximo: {{ formatDateBr(item.nextRunDate) }}</span>
            <span v-if="item.lastRunDate">Último: {{ formatDateBr(item.lastRunDate) }}</span>
            <span v-if="item.endDate">Término: {{ formatDateBr(item.endDate) }}</span>
          </div>
        </div>

        <div class="recurring-value" :class="item.entryType === 'credit' ? 'is-income' : 'is-expense'">
          <MoneyValue
            :value="item.entryType === 'credit' ? item.amount : -item.amount"
            :signed="true"
          />
        </div>

        <div class="lg-actions">
          <button
            v-if="isOwner && item.status !== 'finished'"
            type="button"
            class="lg-btn lg-btn--icon lg-btn--quiet"
            :disabled="runningId === item.id"
            :title="`Lançar agora ${item.description}`"
            :aria-label="`Lançar agora ${item.description}`"
            @click="handleRunNow(item.id)"
          >
            <PlayCircle :size="16" aria-hidden="true" />
          </button>

          <button
            v-if="canManage && item.status !== 'finished'"
            type="button"
            class="lg-btn lg-btn--icon lg-btn--quiet"
            :title="item.status === 'active' ? `Pausar ${item.description}` : `Retomar ${item.description}`"
            :aria-label="item.status === 'active' ? `Pausar ${item.description}` : `Retomar ${item.description}`"
            @click="handleToggleStatus(item.id, item.status)"
          >
            <Pause v-if="item.status === 'active'" :size="16" aria-hidden="true" />
            <Play v-else :size="16" aria-hidden="true" />
          </button>

          <button
            v-if="canManage"
            type="button"
            class="lg-btn lg-btn--icon lg-btn--quiet lg-btn--danger"
            :title="`Remover ${item.description}`"
            :aria-label="`Remover ${item.description}`"
            @click="handleDelete(item.id)"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.recurring-feedback {
  margin-bottom: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.recurring-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.recurring-meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
}

.recurring-value {
  font-size: 1.125rem;
  font-weight: 600;
}
</style>
