export type TransactionType = 'income' | 'expense';

export type categoryIncome = 'salary' | 'freelance' | 'investment' | 'gift' | 'other';
export type categoryExpense = 'food' | 'transport' | 'entertainment' | 'utilities' | 'health' | 'shopping' | 'other';

export type Transaction = {
  id?: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: categoryIncome | categoryExpense;
  date: string;
  notes?: string;
};

export type IncomeTransaction = Omit<Transaction, 'category' | 'type'> & {
  type: 'income';
  category: categoryIncome;
};

export type ExpenseTransaction = Omit<Transaction, 'category' | 'type'> & {
  type: 'expense';
  category: categoryExpense;
};
