<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Trash2, Play, Pause, PlayCircle } from 'lucide-vue-next';
import { useRecurringTransactionStore } from '@/stores/recurringTransactionStore';
import { useCompanyStore } from '@/stores/CompanyStore';
import type { RecurringFrequency } from '@/services/recurringTransactionService';
import PrimaryButton from '@/components/ui/PrimaryButton.vue';
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

const statusLabels: Record<string, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  finished: 'Finalizado',
};

const sortedItems = computed(() =>
  [...store.items].sort((a, b) => a.nextRunDate.localeCompare(b.nextRunDate)),
);

const formatDate = (value: string | null) => {
  if (!value) return '—';
  return formatDateBr(value);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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
    notify('success', 'Lançamento recorrente removido!');
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
      result.created > 0 ? 'Lançamento gerado com sucesso!' : 'Nada vencido para lançar ainda.',
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
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">Lançamentos Recorrentes</h2>
        <p class="panel-subtitle">Entradas e saídas que se repetem — a cobrança é lançada automaticamente quando a data chegar.</p>
      </div>
      <PrimaryButton variant="neutral" compact @click="router.push('/add/expense?repetir=1')">
        <Plus :size="15" />
        Nova recorrente
      </PrimaryButton>
    </div>

    <div v-if="message.show" class="message" :class="message.status">
      {{ message.text }}
    </div>

    <div class="items-list" v-if="sortedItems.length > 0">
      <div v-for="item in sortedItems" :key="item.id" class="item-card">
        <div class="item-header">
          <div class="item-title">
            <span class="entry-dot" :class="item.entryType"></span>
            <h5>{{ item.description || 'Lançamento recorrente' }}</h5>
            <span class="status-badge" :class="item.status">{{ statusLabels[item.status] }}</span>
          </div>
          <div class="item-value">
            <span class="amount" :class="item.entryType">
              {{ item.entryType === 'credit' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
            </span>
          </div>
        </div>

        <div class="item-details">
          <div class="detail-item">
            <span class="detail-label">Frequência</span>
            <span class="detail-value">{{ frequencyLabels[item.frequency] }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Próximo lançamento</span>
            <span class="detail-value">{{ formatDate(item.nextRunDate) }}</span>
          </div>
          <div v-if="item.lastRunDate" class="detail-item">
            <span class="detail-label">Último lançamento</span>
            <span class="detail-value">{{ formatDate(item.lastRunDate) }}</span>
          </div>
          <div v-if="item.endDate" class="detail-item">
            <span class="detail-label">Termina em</span>
            <span class="detail-value">{{ formatDate(item.endDate) }}</span>
          </div>
        </div>

        <div class="item-actions">
          <PrimaryButton
            v-if="isOwner && item.status !== 'finished'"
            variant="neutral"
            compact
            :loading="runningId === item.id"
            @click="handleRunNow(item.id)"
          >
            <PlayCircle :size="14" />
            Lançar agora
          </PrimaryButton>

          <PrimaryButton
            v-if="canManage && item.status !== 'finished'"
            variant="neutral"
            compact
            @click="handleToggleStatus(item.id, item.status)"
          >
            <Pause v-if="item.status === 'active'" :size="14" />
            <Play v-else :size="14" />
            {{ item.status === 'active' ? 'Pausar' : 'Retomar' }}
          </PrimaryButton>

          <PrimaryButton
            v-if="canManage"
            icon-only
            compact
            variant="danger"
            class="delete-action"
            title="Remover"
            @click="handleDelete(item.id)"
          >
            <Trash2 :size="14" />
          </PrimaryButton>

          <span v-if="!canManage" class="readonly-badge">
            Somente leitura
          </span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      Nenhum lançamento recorrente criado ainda.
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.panel-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
}

.panel-subtitle {
  margin-top: 4px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  max-width: 44ch;
}

.message {
  padding: 12px 16px;
  border-radius: var(--radius-input);
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 0.9rem;
}

.message.success {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.message.error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.item-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.entry-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.entry-dot.credit {
  background: var(--color-primary);
}

.entry-dot.debit {
  background: var(--color-danger);
}

.item-title h5 {
  margin: 0;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text);
}

.status-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.status-badge.active {
  background: var(--color-primary-glow);
  color: var(--color-primary);
}

.status-badge.paused {
  background: rgba(234, 179, 8, 0.15);
  color: #ca8a04;
}

.status-badge.finished {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.item-value .amount {
  font-weight: 800;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}

.item-value .amount.credit {
  color: var(--color-primary);
}

.item-value .amount.debit {
  color: var(--color-danger);
}

.item-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.detail-value {
  font-size: 0.85rem;
  color: var(--color-text);
  font-weight: 600;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.delete-action:hover {
  background: var(--color-danger-soft) !important;
  color: var(--color-danger) !important;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}
</style>
