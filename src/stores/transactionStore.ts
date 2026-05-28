import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Transaction, IncomeTransaction, ExpenseTransaction } from '@/types/TransactionTypes';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    transactions.value.push(newTransaction);
    return newTransaction;
  };

  const addIncome = (income: Omit<IncomeTransaction, 'id' | 'type'>) => {
    const transaction: Omit<IncomeTransaction, 'id'> = {
      ...income,
      type: 'income',
    };
    return addTransaction(transaction as Transaction);
  };

  const addExpense = (expense: Omit<ExpenseTransaction, 'id' | 'type'>) => {
    const transaction: Omit<ExpenseTransaction, 'id'> = {
      ...expense,
      type: 'expense',
    };
    return addTransaction(transaction as Transaction);
  };

  const getTransactions = () => transactions.value;

  const getIncomes = () => 
    transactions.value.filter((t) => t.type === 'income') as IncomeTransaction[];

  const getExpenses = () =>
    transactions.value.filter((t) => t.type === 'expense') as ExpenseTransaction[];

  const getTotalIncome = () =>
    getIncomes().reduce((sum, t) => sum + t.amount, 0);

  const getTotalExpense = () =>
    getExpenses().reduce((sum, t) => sum + t.amount, 0);

  const getBalance = () => getTotalIncome() - getTotalExpense();

  const deleteTransaction = (id: string) => {
    transactions.value = transactions.value.filter((t) => t.id !== id);
  };

  const clearTransactions = () => {
    transactions.value = [];
  };

  return {
    transactions,
    addTransaction,
    addIncome,
    addExpense,
    getTransactions,
    getIncomes,
    getExpenses,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    deleteTransaction,
    clearTransactions,
  };
});
