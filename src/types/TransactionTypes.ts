export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
};

export type IncomeTransaction = Omit<Transaction, 'category' | 'type'> & {
  type: 'income';
  category: string;
};

export type ExpenseTransaction = Omit<Transaction, 'category' | 'type'> & {
  type: 'expense';
  category: string;
};
