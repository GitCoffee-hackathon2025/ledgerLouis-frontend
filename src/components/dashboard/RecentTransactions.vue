<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { TransactionDto } from '@/services/transactionService';
import { useTransactionStore } from '@/stores/transactionStore';
import { toLocalMidnight, formatShortDate } from '@/utils/dateUtils';
import MoneyValue from '@/components/ui/MoneyValue.vue';

const props = defineProps<{
  transactions?: TransactionDto[];
}>();

const router = useRouter();
const transactionStore = useTransactionStore();

const recentTransactions = computed(() => {
  const source = props.transactions ?? transactionStore.transactions;
  return source.slice(0, 6);
});

const formattedDate = (dateString: string) => {
  const txLocal = toLocalMidnight(dateString);
  if (!txLocal) return dateString;
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffDays = Math.floor((todayLocal.getTime() - txLocal.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return formatShortDate(dateString);
};
</script>

<template>
  <section class="lg-section" aria-labelledby="recent-activity-title">
    <div class="lg-section-head">
      <div>
        <h2 id="recent-activity-title" class="lg-h2">Atividade recente</h2>
        <p class="lg-note">Últimas movimentações financeiras registradas na conta</p>
      </div>

      <div class="lg-actions">
        <button
          type="button"
          class="lg-btn lg-btn--quiet"
          @click="router.push({ name: 'transactions' })"
        >
          Ver todas as transações
        </button>
      </div>
    </div>

    <ul v-if="recentTransactions.length > 0" class="lg-rows">
      <li v-for="t in recentTransactions" :key="t.id" class="lg-row">
        <div class="lg-row-main">
          <div class="lg-row-title">{{ t.description || 'Lançamento sem descrição' }}</div>
          <div class="lg-row-meta">
            {{ formattedDate(t.date) }} · {{ t.entryType === 'credit' ? 'Entrada' : 'Saída' }}
          </div>
        </div>

        <div class="recent-row-amount" :class="t.entryType === 'credit' ? 'is-income' : 'is-expense'">
          <MoneyValue :value="t.entryType === 'credit' ? t.amount : -t.amount" signed />
        </div>
      </li>
    </ul>

    <div v-else class="lg-empty">
      Nenhuma movimentação registrada recentemente.
    </div>
  </section>
</template>

<style scoped>
.recent-row-amount {
  font-size: 1.0625rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
