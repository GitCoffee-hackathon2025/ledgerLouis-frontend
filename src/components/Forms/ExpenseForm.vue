<script setup lang="ts">
import { reactive } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';
import BaseInput from '../inputs/BaseInput.vue';
import PrimaryButton from '../inputs/PrimaryButton.vue';
import ResponsePopUp from './ResponsePopUp.vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRouter } from 'vue-router';
const router = useRouter();
const transactionStore = useTransactionStore();
const categoryStore = useCategoryStore();

const expenseData = reactive({
  amount: '',
  description: '',
  category: categoryStore.getCategories('expense')[0]?.id ?? '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
});

const response = reactive({
  status: '',
  message: '',
  show: false,
});

const handleAddExpense = async () => {
  try {
    if (!expenseData.amount || !expenseData.description || !expenseData.date || !expenseData.category) {
      response.status = 'error';
      response.message = 'Preencha todos os campos obrigatórios';
      response.show = true;
      return;
    }

    const amount = parseFloat(expenseData.amount);
    if (isNaN(amount) || amount <= 0) {
      response.status = 'error';
      response.message = 'Digite um valor válido e maior que zero';
      response.show = true;
      return;
    }

    transactionStore.addExpense({
      amount,
      description: expenseData.description,
      category: expenseData.category,
      date: expenseData.date,
      notes: expenseData.notes,
    });

    response.status = 'success';
    response.message = 'Despesa registrada com sucesso!';
    response.show = true;

    // Reset form
    Object.assign(expenseData, {
      amount: '',
      description: '',
      category: categoryStore.getCategories('expense')[0]?.id ?? '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });

    setTimeout(() => {
      router.push({ name: 'management' });
    }, 2000);
  } catch (_error) {
    response.status = 'error';
    response.message = 'Erro ao registrar despesa. Tente novamente.';
    response.show = true;
  }
};
</script>

<template>
  <form @submit.prevent="handleAddExpense" class="expense-form">
    <ResponsePopUp 
      :status="response.status" 
      :message="response.message"
      :show="response.show"
    />

    <div class="form-group">
      <label for="amount">Valor *</label>
      <BaseInput
        id="amount"
        v-model="expenseData.amount"
        type="number"
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />
    </div>

    <div class="form-group">
      <label for="description">Descrição *</label>
      <BaseInput
        id="description"
        v-model="expenseData.description"
        type="text"
        placeholder="Ex: Refeição, Passagem..."
        required
      />
    </div>

    <div class="form-group">
      <label for="category">Categoria *</label>
      <select id="category" v-model="expenseData.category" class="form-select">
        <option v-for="cat in categoryStore.getCategories('expense')" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="date">Data *</label>
      <BaseInput
        id="date"
        v-model="expenseData.date"
        type="date"
        required
      />
    </div>

    <div class="form-group">
      <label for="notes">Notas (opcional)</label>
      <textarea
        id="notes"
        v-model="expenseData.notes"
        class="form-textarea"
        placeholder="Adicione observações sobre essa despesa..."
        rows="3"
      />
    </div>

    <PrimaryButton type="submit" class="submit-btn">
      Registrar Despesa
    </PrimaryButton>
  </form>
</template>

<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: var(--color-background);
  border-radius: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.form-select,
.form-textarea {
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--color-surface);
  color: var(--color-text);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
}

.form-textarea {
  resize: vertical;
}

.submit-btn {
  margin-top: 10px;
}
</style>
