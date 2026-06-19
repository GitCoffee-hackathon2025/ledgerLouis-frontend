<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { RecurringExpenseDistribution } from '@/types/CompanyTypes';
import { Plus, Trash2 } from 'lucide-vue-next';
import { useRecurringExpenseStore } from '@/stores/recurringExpenseStore';

const expenseStore = useRecurringExpenseStore();

const showForm = ref(false);
const isLoading = ref(false);
const message = reactive({ status: '', text: '', show: false });

const formData = reactive({
  description: '',
  unitValue: 0,
  quantity: 1,
  frequency: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
});

const frequencyLabels: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

const totalValue = () => formData.unitValue * formData.quantity;

const resetForm = () => {
  formData.description = '';
  formData.unitValue = 0;
  formData.quantity = 1;
  formData.frequency = 'monthly';
  formData.startDate = new Date().toISOString().split('T')[0];
  formData.endDate = '';
  showForm.value = false;
};

const handleCreateExpense = async () => {
  if (!formData.description.trim()) {
    message.status = 'error';
    message.text = 'Digite a descrição da conta';
    message.show = true;
    return;
  }

  if (formData.unitValue <= 0) {
    message.status = 'error';
    message.text = 'Digite um valor maior que zero';
    message.show = true;
    return;
  }

  if (formData.quantity < 1) {
    message.status = 'error';
    message.text = 'Quantidade deve ser maior que zero';
    message.show = true;
    return;
  }

  try {
    isLoading.value = true;

    const expenseData: Omit<RecurringExpenseDistribution, 'id' | 'createdAt'> = {
      description: formData.description,
      totalAmount: totalValue(),
      frequency: formData.frequency as 'weekly' | 'monthly' | 'yearly',
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      participants: [{
        participantId: 'main',
        participantName: formData.description,
        amount: formData.unitValue,
        quantity: formData.quantity,
      }],
      category: '',
    };

    expenseStore.addExpense(expenseData);

    message.status = 'success';
    message.text = 'Despesa recorrente criada com sucesso!';
    message.show = true;

    setTimeout(() => {
      resetForm();
      message.show = false;
    }, 2000);

  } catch (error) {
    message.status = 'error';
    message.text = 'Erro ao criar despesa recorrente';
    message.show = true;
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteExpense = (id: string) => {
  expenseStore.removeExpense(id);
  message.status = 'success';
  message.text = 'Despesa recorrente removida!';
  message.show = true;
  setTimeout(() => { message.show = false; }, 2000);
};
</script>

<script lang="ts">
export default {
  name: 'RecurringExpenseManager',
};
</script>

<template>
  <div class="recurring-manager">
    <div class="manager-header">
      <h3>Distribuição de Despesas Recorrentes</h3>
      <button class="btn-add" @click="showForm = !showForm" v-if="!showForm">
        <Plus size="18" />
        Nova Despesa
      </button>
    </div>

    <!-- Mensagem de feedback -->
    <div v-if="message.show" class="message" :class="message.status">
      {{ message.text }}
    </div>

    <!-- Formulário de criar despesa recorrente -->
    <div v-if="showForm" class="form-container">
      <h4>Adicionar Despesa Recorrente</h4>
      
      <div class="form-group">
        <label>Nome da Conta *</label>
        <input 
          v-model="formData.description"
          type="text"
          placeholder="Ex: Salário Repositor"
          class="input"
        >
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Valor Unitário (R$) *</label>
          <input 
            v-model.number="formData.unitValue"
            type="number"
            step="0.01"
            min="0"
            placeholder="1500.00"
            class="input"
          >
        </div>

        <div class="form-group">
          <label>Quantidade *</label>
          <input 
            v-model.number="formData.quantity"
            type="number"
            step="1"
            min="1"
            placeholder="1"
            class="input"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Frequência</label>
        <select v-model="formData.frequency" class="input">
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
        </select>
      </div>

      <div class="form-group">
        <label>Data de Início</label>
        <input 
          v-model="formData.startDate"
          type="date"
          class="input"
        >
      </div>

      <div class="form-group">
        <label>Data de Término (Opcional)</label>
        <input 
          v-model="formData.endDate"
          type="date"
          class="input"
        >
      </div>

      <div class="total-preview">
        <span class="preview-label">Total:</span>
        <span class="preview-value">R$ {{ totalValue().toFixed(2) }}</span>
      </div>

      <div class="form-actions">
        <button 
          class="btn-success" 
          @click="handleCreateExpense" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Salvando...' : 'Criar' }}
        </button>
        <button class="btn-cancel" @click="resetForm">Cancelar</button>
      </div>
    </div>

    <!-- Lista de despesas recorrentes criadas -->
    <div class="expenses-list" v-if="expenseStore.expenses.length > 0">
      <div 
        v-for="expense in expenseStore.expenses"
        :key="expense.id"
        class="expense-card"
      >
        <div class="expense-header">
          <div class="expense-title">
            <h5>{{ expense.description }}</h5>
            <span class="frequency">{{ frequencyLabels[expense.frequency] }}</span>
          </div>
          <div class="expense-value">
            <span class="amount">R$ {{ expense.totalAmount.toFixed(2) }}</span>
            <button 
              class="btn-delete"
              @click="handleDeleteExpense(expense.id!)"
              title="Remover"
            >
              <Trash2 size="16" />
            </button>
          </div>
        </div>

        <div class="expense-details">
          <div class="detail-item">
            <span class="detail-label">Data de Início:</span>
            <span class="detail-value">{{ expense.startDate }}</span>
          </div>
          <div v-if="expense.endDate" class="detail-item">
            <span class="detail-label">Data de Término:</span>
            <span class="detail-value">{{ expense.endDate }}</span>
          </div>
          <div v-if="expense.participants[0]?.quantity && expense.participants[0]?.quantity > 0" class="detail-item">
            <span class="detail-label">Quantidade:</span>
            <span class="detail-value">{{ expense.participants[0]?.quantity }}x</span>
          </div>
          <div v-if="expense.participants[0]?.amount" class="detail-item">
            <span class="detail-label">Valor Unitário:</span>
            <span class="detail-value">R$ {{ expense.participants[0]?.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!showForm" class="empty-state">
      Nenhuma despesa recorrente criada ainda.
    </div>
  </div>
</template>

<style scoped>
.recurring-manager {
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
}

.total-preview {
  background: var(--color-surface);
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid var(--color-primary);
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.preview-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
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

.expenses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expense-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.expense-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.expense-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.expense-title {
  flex: 1;
}

.expense-title h5 {
  margin: 0 0 6px 0;
  color: var(--color-text);
}

.frequency {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.expense-value {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: right;
}

.amount {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.btn-delete {
  background: rgba(255, 68, 68, 0.1);
  color: #c41e3a;
  border: 1px solid rgba(255, 68, 68, 0.2);
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background: rgba(255, 68, 68, 0.2);
}

.expense-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.detail-value {
  color: var(--color-text);
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .total-preview {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
