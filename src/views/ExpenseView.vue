<script setup lang="ts">
import { reactive } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRouter } from 'vue-router';
import type { categoryExpense } from '@/types/TransactionTypes';

const router = useRouter();
const transactionStore = useTransactionStore();

const expenseData = reactive({
  amount: '',
  description: '',
  category: '' as categoryExpense,
  date: new Date().toISOString().split('T')[0],
  notes: '',
  recurring: false,
  recurringMonths: '',
});

const response = reactive({
  status: '',
  message: '',
  show: false,
});

const handleAddExpense = async (e: Event) => {
  e.preventDefault();
  
  try {
    if (!expenseData.amount || !expenseData.description || !expenseData.category || !expenseData.date) {
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

    setTimeout(() => {
      router.push({ name: 'management' });
    }, 2000);
  } catch (_error) {
    response.status = 'error';
    response.message = 'Erro ao registrar despesa. Tente novamente.';
    response.show = true;
  }
};

const handleCancel = () => {
  router.push({ name: 'management' });
};
</script>

<template>
  <div class="container">
    <div class="card">
      <h2 class="title">Nova Saída</h2>
      
      <div v-if="response.show" class="response-popup" :class="response.status">
        <div class="popup-content">
          <div class="icon" :class="response.status">
            <span v-if="response.status === 'success'">✔</span>
            <span v-else>✖</span>
          </div>
          <h3 class="popup-title">{{ response.status === 'success' ? 'Sucesso!' : 'Erro!' }}</h3>
          <p class="popup-message">{{ response.message }}</p>
        </div>
      </div>

      <form @submit="handleAddExpense" class="form">
        
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <input 
            v-model="expenseData.description"
            type="text" 
            placeholder="EX: Conta de água" 
            class="form-input"
          >
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Valor (R$)</label>
            <input 
              v-model="expenseData.amount"
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Data</label>
            <input 
              v-model="expenseData.date"
              type="date" 
              class="form-input"
            >
          </div>
        </div>
        
        <div class="recurring-section">
          <label class="checkbox-label">
            <input 
              v-model="expenseData.recurring"
              type="checkbox" 
              class="checkbox-input"
            >
            <span>Repetir Mensalmente</span>
          </label>
          
          <div class="recurring-input">
            <span class="recurring-text">Por quanto tempo?</span>
            <input 
              v-if="expenseData.recurring"
              v-model="expenseData.recurringMonths"
              type="text" 
              class="form-input small"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Categoria</label>
          <div class="select-wrapper">
            <select v-model="expenseData.category" class="form-select">
              <option value="" disabled>Selecione uma categoria</option>
              <option value="food">Alimentação</option>
              <option value="transport">Transporte</option>
              <option value="entertainment">Diversão</option>
              <option value="utilities">Contas e Utilidades</option>
              <option value="health">Saúde</option>
              <option value="shopping">Compras</option>
              <option value="other">Outro</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="select-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            @click="handleCancel"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-danger"
          >
            Salvar
          </button>
        </div>
        
      </form>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 175px);
  background-color: white;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 32px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: black;
  margin: 0 0 24px 0;
}

.response-popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.response-popup.success .popup-content {
  border-top: 4px solid #10b981;
}

.response-popup.error .popup-content {
  border-top: 4px solid #ef4444;
}

.popup-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  max-width: 320px;
}

.icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.icon.success {
  background-color: #10b981;
}

.icon.error {
  background-color: #ef4444;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.popup-message {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 16px;
  font-family: inherit;
  background-color: white;
  color: #1f2937;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-input.small {
  width: 80px;
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}



.form-select {
  width: 100%;
  appearance: none;
  padding: 12px 16px;
  padding-right: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 16px;
  font-family: inherit;
  background-color: white;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: black;
  pointer-events: none;
}

.recurring-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  font-weight: 500;
  color: black;
  padding-left: 4px;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #ef4444;
}

.recurring-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
}

.recurring-text {
  font-size: 14px;
  color: #9ca3af;
}

.form-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
}

.btn {
  flex: 1;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: none;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: black;
  border: 1px solid #dcdcdc;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

.btn-secondary:active {
  transform: scale(0.98);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .container {
    min-height: calc(100vh - 150px);
    padding: 15px;
  }

  .card {
    padding: 24px;
    border-radius: 24px;
  }

  .title {
    font-size: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
