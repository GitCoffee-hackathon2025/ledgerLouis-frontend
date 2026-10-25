<template>
  <section class="transactions-card">
    <header class="transactions-header">
      <div>
        <p class="chart-kicker">Últimas movimentações</p>
        <h2>Atividade recente</h2>
      </div>

      <button class="transactions-action" type="button" @click="router.push({ name: 'transactions' })">Ver todas</button>
    </header>

    <ul class="transactions-list">
      <TransactionItem
        v-for="transaction in recentTransactions"
        :key="transaction.id"
        :title="transaction.description"
        :subtitle="transaction.entryType === 'credit' ? 'Entrada' : 'Saída'"
        :amount="formattedAmount(transaction)"
        :date="formattedDate(transaction.date)"
        :kind="transaction.entryType === 'credit' ? 'income' : 'expense'"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import TransactionItem from '@/components/dashboard/TransactionItem.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionDto } from '@/services/transactionService';
import { toLocalMidnight, formatShortDate } from '@/utils/dateUtils';

const router = useRouter();

const props = defineProps<{
  transactions?: TransactionDto[];
}>();

const transactionStore = useTransactionStore();

const recentTransactions = computed(() => {
  const source = props.transactions ?? transactionStore.transactions;
  return source.slice(0, 5);
});

const formattedAmount = (transaction: { amount: number; entryType: string }) => {
  const value = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(transaction.amount);
  
  return transaction.entryType === 'credit' ? `+ ${value}` : `- ${value}`;
};

const formattedDate = (dateString: string) => {
  const txLocal = toLocalMidnight(dateString);
  if (!txLocal) return dateString;
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffDays = Math.floor((todayLocal.getTime() - txLocal.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else {
    return formatShortDate(dateString);
  }
};
</script>

<style scoped>
.transactions-card {
  padding: 18px;
  border-radius: 28px;
  border: 1px solid var(--color-border);
  background: rgba(var(--color-surface-rgb), 0.96);
  box-shadow: 0 18px 52px rgba(15, 23, 42, 0.06);
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.chart-kicker {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

h2 {
  color: var(--color-text);
  font-size: 20px;
  font-weight: 800;
}

.transactions-action {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-soft);
  color: var(--color-text);
  min-height: 40px;
  padding: 0 14px;
  font-weight: 700;
}

.transactions-list {
  display: grid;
}

@media (min-width: 768px) {
  .transactions-card {
    padding: 24px;
  }
}
</style>
