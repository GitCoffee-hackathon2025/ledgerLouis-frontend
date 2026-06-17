<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Category } from '@/types/CompanyTypes';
import { Plus } from 'lucide-vue-next';
import CategoryItem from './CategoryItem.vue';
import { useCategoryStore } from '@/stores/categoryStore';

const categoryStore = useCategoryStore();

const showForm = ref(false);
const isLoading = ref(false);
const message = reactive({ status: '', text: '', show: false });

const newCategory = reactive<Omit<Category, 'id' | 'createdAt'>>({
  name: '',
  type: 'expense',
});

const resetForm = () => {
  newCategory.name = '';
  newCategory.type = 'expense';
  showForm.value = false;
};

const handleAddCategory = async () => {
  if (!newCategory.name.trim()) {
    message.status = 'error';
    message.text = 'Digite um nome para a categoria';
    message.show = true;
    return;
  }

  try {
    isLoading.value = true;

    categoryStore.addCategory({
      name: newCategory.name,
      type: newCategory.type,
    });

    message.status = 'success';
    message.text = 'Categoria adicionada com sucesso!';
    message.show = true;

    setTimeout(() => {
      resetForm();
      message.show = false;
    }, 2000);

  } catch (error) {
    message.status = 'error';
    message.text = 'Erro ao adicionar categoria';
    message.show = true;
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteCategory = (id: string) => {
  categoryStore.removeCategory(id);
  message.status = 'success';
  message.text = 'Categoria removida!';
  message.show = true;
  setTimeout(() => { message.show = false; }, 2000);
};
</script>

<script lang="ts">
export default {
  name: 'CategoryManager',
};
</script>

<template>
  <div class="category-manager">
    <div class="manager-header">
      <h3>Categorias</h3>
      <button class="btn-add" @click="showForm = !showForm" v-if="!showForm">
        <Plus size="18" />
        Nova Categoria
      </button>
    </div>

    <!-- Mensagem de feedback -->
    <div v-if="message.show" class="message" :class="message.status">
      {{ message.text }}
    </div>

    <!-- Formulário -->
    <div v-if="showForm" class="form-container">
      <h4>Adicionar Nova Categoria</h4>
      
      <div class="form-group">
        <label>Nome da Categoria</label>
        <input 
          v-model="newCategory.name"
          type="text"
          placeholder="Ex: Marketing"
          class="input"
        >
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="newCategory.type" class="input">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>

        
      </div>

      <div class="form-actions">
        <button class="btn-success" @click="handleAddCategory" :disabled="isLoading">
          {{ isLoading ? 'Salvando...' : 'Adicionar' }}
        </button>
        <button class="btn-cancel" @click="resetForm">Cancelar</button>
      </div>
    </div>

    <!-- Lista de categorias -->
    <div class="categories-container">
      <div class="category-section" v-if="categoryStore.getCategories('expense').length > 0">
        <h5>Despesas</h5>
        <div class="categories-list">
          <CategoryItem 
            v-for="category in categoryStore.getCategories('expense')"
            :key="category.id"
            :category="category"
            @delete="handleDeleteCategory"
          />
        </div>
      </div>

      <div class="category-section" v-if="categoryStore.getCategories('income').length > 0">
        <h5>Receitas</h5>
        <div class="categories-list">
          <CategoryItem 
            v-for="category in categoryStore.getCategories('income')"
            :key="category.id"
            :category="category"
            @delete="handleDeleteCategory"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-manager {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--color-border);
}

.manager-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-primary);
}

.btn-add {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: rgba(29, 185, 84, 0.1);
  color: #27ae60;
  border: 1px solid rgba(29, 185, 84, 0.2);
}

.message.error {
  background: rgba(255, 68, 68, 0.1);
  color: #c41e3a;
  border: 1px solid rgba(255, 68, 68, 0.2);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-container {
  background: var(--color-bg);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--color-border);
}

.form-container h4 {
  margin: 0 0 16px 0;
  color: var(--color-text);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}



.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-success {
  flex: 1;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  background: var(--color-border);
  color: var(--color-text);
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: var(--color-text-secondary);
  color: white;
}

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-section h5 {
  margin: 0 0 12px 0;
  color: var(--color-text);
  font-size: 1rem;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
