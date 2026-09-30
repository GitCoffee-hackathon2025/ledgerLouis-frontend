<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDownRight, ArrowUpRight, Pause, Play, PlayCircle, Trash2 } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
import type { RecurringTransactionDto } from '@/services/recurringTransactionService';
import { formatIsoDate, formatSignedAmount } from '@/utils/format';

const props = defineProps<{ item: RecurringTransactionDto; running?: boolean }>();

defineEmits<{
  'run-now': [];
  'toggle-status': [];
  delete: [];
}>();

const frequencyLabels = { weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' } as const;

const statusMeta = {
  active: { label: 'Ativo', tone: 'success' },
  paused: { label: 'Pausado', tone: 'warning' },
  finished: { label: 'Finalizado', tone: undefined },
} as const;

const isIncome = computed(() => props.item.entryType === 'credit');
const status = computed(() => statusMeta[props.item.status]);

const details = computed(() =>
  [
    { label: 'Frequência', value: frequencyLabels[props.item.frequency] },
    { label: 'Próximo', value: formatIsoDate(props.item.nextRunDate) },
    props.item.lastRunDate && { label: 'Último', value: formatIsoDate(props.item.lastRunDate) },
    props.item.endDate && { label: 'Termina em', value: formatIsoDate(props.item.endDate) },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail)),
);
</script>

<template>
  <article class="recurring-item" :class="{ 'is-finished': item.status === 'finished' }">
    <div class="recurring-main">
      <span class="icon-tile" :class="{ 'icon-tile--danger': !isIncome }">
        <ArrowUpRight v-if="isIncome" :size="18" />
        <ArrowDownRight v-else :size="18" />
      </span>

      <div class="recurring-copy">
        <div class="recurring-title">
          <h3>{{ item.description || 'Lançamento recorrente' }}</h3>
          <span class="badge" :data-tone="status.tone">{{ status.label }}</span>
        </div>

        <dl class="recurring-details">
          <div v-for="detail in details" :key="detail.label">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
      </div>

      <strong class="recurring-amount tabular" :class="isIncome ? 'text-income' : 'text-expense'">
        {{ formatSignedAmount(item.amount, item.entryType) }}
      </strong>
    </div>

    <footer v-if="item.status !== 'finished'" class="recurring-actions">
      <BaseButton variant="secondary" size="sm" :loading="running" @click="$emit('run-now')">
        <PlayCircle :size="15" />
        Lançar agora
      </BaseButton>
      <BaseButton variant="ghost" size="sm" @click="$emit('toggle-status')">
        <Pause v-if="item.status === 'active'" :size="15" />
        <Play v-else :size="15" />
        {{ item.status === 'active' ? 'Pausar' : 'Retomar' }}
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        icon-only
        class="delete-button"
        :aria-label="`Remover ${item.description ?? 'lançamento'}`"
        title="Remover"
        @click="$emit('delete')"
      >
        <Trash2 :size="15" />
      </BaseButton>
    </footer>
    <footer v-else class="recurring-actions">
      <BaseButton
        variant="ghost"
        size="sm"
        class="delete-button delete-button--text"
        @click="$emit('delete')"
      >
        <Trash2 :size="15" />
        Remover
      </BaseButton>
    </footer>
  </article>
</template>

<style scoped>
.recurring-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration) ease;
}

.recurring-item:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-md);
}

.recurring-item.is-finished {
  opacity: 0.7;
}

.recurring-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.recurring-copy {
  flex: 1;
  min-width: 0;
}

.recurring-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.recurring-title h3 {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: 700;
  letter-spacing: 0;
}

.recurring-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}

.recurring-details dt {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.recurring-details dd {
  font-size: var(--text-sm);
  font-weight: 600;
}

.recurring-amount {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
}

.recurring-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.delete-button {
  margin-left: auto;
}

.delete-button:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

@media (max-width: 520px) {
  .recurring-main {
    flex-wrap: wrap;
  }

  .recurring-amount {
    width: 100%;
    padding-left: 52px;
  }
}
</style>
