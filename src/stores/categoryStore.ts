import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Category } from '@/types/CompanyTypes';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([
    { id: '1', name: 'Alimentação', type: 'expense', color: '#FF6B6B' },
    { id: '2', name: 'Transporte', type: 'expense', color: '#4ECDC4' },
    { id: '3', name: 'Diversão', type: 'expense', color: '#45B7D1' },
    { id: '4', name: 'Utilidades', type: 'expense', color: '#FFA07A' },
    { id: '5', name: 'Saúde', type: 'expense', color: '#98D8C8' },
    { id: '6', name: 'Compras', type: 'expense', color: '#F7DC6F' },
    { id: '7', name: 'Salário', type: 'income', color: '#52C41A' },
    { id: '8', name: 'Freelancer', type: 'income', color: '#1890FF' },
    { id: '9', name: 'Investimento', type: 'income', color: '#722ED1' },
    { id: '10', name: 'Presente', type: 'income', color: '#EB2F96' },
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
