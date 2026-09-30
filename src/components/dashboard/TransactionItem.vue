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
      <span>{{ isIncome ? 'Entrada' : 'Saída' }} · {{ formatRelativeDate(transaction.date, withYear) }}</span>
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
  padding: var(--space-3) 0;
}

.transaction-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.transaction-copy strong {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-copy span {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.transaction-amount {
  flex-shrink: 0;
  font-weight: 700;
}
</style>
