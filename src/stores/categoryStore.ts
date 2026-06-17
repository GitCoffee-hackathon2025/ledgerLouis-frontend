import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Category } from '@/types/CompanyTypes';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([
    { id: '1', name: 'Alimentação', type: 'expense' },
    { id: '2', name: 'Transporte', type: 'expense' },
    { id: '3', name: 'Diversão', type: 'expense' },
    { id: '4', name: 'Utilidades', type: 'expense' },
    { id: '5', name: 'Saúde', type: 'expense' },
    { id: '6', name: 'Compras', type: 'expense' },
    { id: '7', name: 'Salário', type: 'income' },
    { id: '8', name: 'Freelancer', type: 'income' },
    { id: '9', name: 'Investimento', type: 'income' },
    { id: '10', name: 'Presente', type: 'income' },
  ]);

  const addCategory = (category: Category) => {
    categories.value.push({
      id: Math.random().toString(),
      ...category,
      createdAt: new Date().toISOString(),
    });
  };

  const removeCategory = (id: string) => {
    categories.value = categories.value.filter(c => c.id !== id);
  };

  const getCategories = (type?: 'income' | 'expense') => {
    if (!type) return categories.value;
    return categories.value.filter(c => c.type === type);
  };

  return {
    categories,
    addCategory,
    removeCategory,
    getCategories,
  };
});
