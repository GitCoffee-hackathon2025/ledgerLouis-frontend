<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDownRight, ArrowUpRight } from 'lucide-vue-next';
import type { TransactionDto } from '@/services/transactionService';
import { formatRelativeDate, formatSignedAmount } from '@/utils/format';

const props = withDefaults(defineProps<{ transaction: TransactionDto; withYear?: boolean }>(), {
  withYear: false,
});

const isIncome = computed(() => props.transaction.entryType === 'credit');
</script>

<template>
  <li class="transaction">
    <span class="icon-tile" :class="{ 'icon-tile--danger': !isIncome }">
      <ArrowUpRight v-if="isIncome" :size="18" />
      <ArrowDownRight v-else :size="18" />
    </span>

    <div class="transaction-copy">
      <strong>{{ transaction.description }}</strong>
      <span>{{ isIncome ? 'Entrada' : 'Saída' }}, {{ formatRelativeDate(transaction.date, withYear) }}</span>
    </div>

    <strong class="transaction-amount tabular" :class="isIncome ? 'text-income' : 'text-expense'">
      {{ formatSignedAmount(transaction.amount, transaction.entryType) }}
    </strong>
  </li>
</template>

<style scoped>
.transaction {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 calc(var(--space-3) * -1);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--duration-fast) ease;
}

.transaction:hover {
  background: var(--color-surface-3);
}

.transaction-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.transaction-copy strong {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-copy span {
  font-size: var(--text-xs);
  color: var(--color-text-subtle);
}

.transaction-amount {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: -0.03em;
}
</style>
