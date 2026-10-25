import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  RecurringTransactionDto,
  CreateRecurringTransactionDto,
  UpdateRecurringTransactionDto,
} from '@/services/recurringTransactionService';
import RecurringTransactionService from '@/services/recurringTransactionService';

export const useRecurringTransactionStore = defineStore('recurringTransaction', () => {
  const service = new RecurringTransactionService();
  const items = ref<RecurringTransactionDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchRecurringTransactions = async () => {
    try {
      setLoading(true);
      clearError();
      items.value = await service.getRecurringTransactions();
    } catch (err) {
      console.error('Erro ao buscar lançamentos recorrentes:', err);
      setError('Erro ao carregar lançamentos recorrentes');
    } finally {
      setLoading(false);
    }
  };

  const createRecurringTransaction = async (data: CreateRecurringTransactionDto) => {
    try {
      setLoading(true);
      clearError();
      const created = await service.createRecurringTransaction(data);
      items.value.unshift(created);
      return created;
    } catch (err) {
      console.error('Erro ao criar lançamento recorrente:', err);
      setError('Erro ao criar lançamento recorrente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRecurringTransaction = async (id: string, data: UpdateRecurringTransactionDto) => {
    try {
      setLoading(true);
      clearError();
      const updated = await service.updateRecurringTransaction(id, data);
      const index = items.value.findIndex((item) => item.id === id);
      if (index !== -1) items.value[index] = updated;
      return updated;
    } catch (err) {
      console.error('Erro ao atualizar lançamento recorrente:', err);
      setError('Erro ao atualizar lançamento recorrente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      await service.deleteRecurringTransaction(id);
      items.value = items.value.filter((item) => item.id !== id);
    } catch (err) {
      console.error('Erro ao remover lançamento recorrente:', err);
      setError('Erro ao remover lançamento recorrente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runNow = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      const result = await service.runNow(id);
      const index = items.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        items.value[index] = {
          ...items.value[index],
          status: result.status,
          nextRunDate: result.nextRunDate,
        } as RecurringTransactionDto;
      }
      return result;
    } catch (err) {
      console.error('Erro ao lançar cobrança recorrente:', err);
      setError('Erro ao lançar cobrança recorrente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearRecurringTransactions = () => {
    items.value = [];
    error.value = null;
  };

  return {
    items,
    loading,
    error,
    fetchRecurringTransactions,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    runNow,
    clearError,
    clearRecurringTransactions,
  };
});
