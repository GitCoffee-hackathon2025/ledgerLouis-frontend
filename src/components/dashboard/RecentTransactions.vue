<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight, ReceiptText } from 'lucide-vue-next';
import TransactionItem from '@/components/dashboard/TransactionItem.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionDto } from '@/services/transactionService';

const props = defineProps<{ transactions?: TransactionDto[] }>();

const transactionStore = useTransactionStore();

const recentTransactions = computed(() => (props.transactions ?? transactionStore.transactions).slice(0, 5));
</script>

<template>
  <section class="card">
    <header class="card-header">
      <div>
        <p class="card-kicker">Últimas movimentações</p>
        <h2 class="card-title">Atividade recente</h2>
      </div>
      <BaseButton variant="ghost" size="sm" :to="{ name: 'transactions' }">
        Ver todas
        <ArrowRight :size="15" />
      </BaseButton>
    </header>

    <div v-if="recentTransactions.length === 0" class="empty-state">
      <ReceiptText :size="26" />
      Nenhuma transação registrada ainda.
    </div>

    <ul v-else class="list-divided">
      <TransactionItem v-for="transaction in recentTransactions" :key="transaction.id" :transaction="transaction" />
    </ul>
  </section>
</template>
