import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { TransactionDto, CreateTransactionDto } from '@/services/transactionService';
import TransactionService from '@/services/transactionService';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<TransactionDto[]>([]);
  const accountValue = ref<number>(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setTransactions = (data: TransactionDto[]) => {
    transactions.value = data;
  };

  const addTransaction = (transaction: TransactionDto) => {
    transactions.value.unshift(transaction);
  };

  const removeTransaction = (id: string) => {
    transactions.value = transactions.value.filter((t) => t.id !== id);
  };

  const setAccountValue = (value: number) => {
    accountValue.value = value;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      clearError();
      const service = new TransactionService();
      const data = await service.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountValue = async () => {
    try {
      const service = new TransactionService();
      const value = await service.getAccountValue();
      setAccountValue(value);
    } catch (err) {
      console.error('Erro ao buscar valor da conta:', err);
    }
  };

  const createTransaction = async (data: CreateTransactionDto) => {
    try {
      setLoading(true);
      clearError();
      const service = new TransactionService();
      const transaction = await service.createTransaction(data);
      addTransaction(transaction);
      
      // Atualizar valor da conta após criar transação
      await fetchAccountValue();
      
      return transaction;
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      setError('Erro ao criar transação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      const service = new TransactionService();
      await service.deleteTransaction(id);
      removeTransaction(id);
      
      // Atualizar valor da conta após deletar transação
      await fetchAccountValue();
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
      setError('Erro ao deletar transação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearTransactions = () => {
    transactions.value = [];
    accountValue.value = 0;
    error.value = null;
  };

  return {
    transactions,
    accountValue,
    loading,
    error,
    setTransactions,
    addTransaction,
    removeTransaction,
    setAccountValue,
    setLoading,
    setError,
    clearError,
    fetchTransactions,
    fetchAccountValue,
    createTransaction,
    deleteTransaction,
    clearTransactions,
    
  };
});
