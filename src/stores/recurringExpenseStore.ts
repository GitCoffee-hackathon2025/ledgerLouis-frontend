import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RecurringExpenseDistribution } from '@/types/CompanyTypes';

export const useRecurringExpenseStore = defineStore('recurringExpense', () => {
  const expenses = ref<RecurringExpenseDistribution[]>([]);

  const addExpense = (expense: RecurringExpenseDistribution) => {
    expenses.value.push({
      id: Math.random().toString(),
      ...expense,
      createdAt: new Date().toISOString(),
    });
  };

  const removeExpense = (id: string) => {
    expenses.value = expenses.value.filter(e => e.id !== id);
  };

  const updateExpense = (id: string, expense: Partial<RecurringExpenseDistribution>) => {
    const index = expenses.value.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses.value[index] = { ...expenses.value[index], ...expense };
    }
  };

  return {
    expenses,
    addExpense,
    removeExpense,
    updateExpense,
  };
});
