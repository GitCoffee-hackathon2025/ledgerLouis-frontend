<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { RecurringExpenseDistribution } from '@/types/CompanyTypes';
import { Plus, Trash2, Zap } from 'lucide-vue-next';
import { useRecurringExpenseStore } from '@/stores/recurringExpenseStore';

const expenseStore = useRecurringExpenseStore();

const showForm = ref(false);
const isLoading = ref(false);
const message = reactive({ status: '', text: '', show: false });

const newExpense = reactive<Omit<RecurringExpenseDistribution, 'id' | 'createdAt'>>({
  description: '',
  totalAmount: 0,
  frequency: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  participants: [],
  category: '',
});

const salaryInputs = ref<Array<{ tempId: string; amount: number }>>([]);

const frequencyLabels: Record<string, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

const amountPerSalary = computed(() => {
  if (salaryInputs.value.length === 0) return 0;
  return newExpense.totalAmount / salaryInputs.value.length;
});

const totalDistributed = computed(() =>
  salaryInputs.value.reduce((sum, s) => sum + s.amount, 0)
);

const resetForm = () => {
  newExpense.description = '';
  newExpense.totalAmount = 0;
  newExpense.frequency = 'monthly';
  newExpense.startDate = new Date().toISOString().split('T')[0];
  newExpense.endDate = '';
  newExpense.participants = [];
  newExpense.category = '';
  salaryInputs.value = [];
  showForm.value = false;
};

const addSalaryLine = () => {
  salaryInputs.value.push({
    tempId: Math.random().toString(36).substr(2, 9),
    amount: amountPerSalary.value,
  });
};

const removeSalaryLine = (index: number) => {
  salaryInputs.value.splice(index, 1);
};

const handleAutoDistribute = () => {
  if (salaryInputs.value.length === 0) {
    message.status = 'error';
    message.text = 'Adicione pelo menos um salário';
    message.show = true;
    return;
  }

  if (newExpense.totalAmount <= 0) {
    message.status = 'error';
    message.text = 'Digite um valor total maior que zero';
    message.show = true;
    return;
  }

  salaryInputs.value.forEach(salary => {
    salary.amount = amountPerSalary.value;
  });

  message.status = 'success';
  message.text = 'Valores distribuídos automaticamente!';
  message.show = true;
  setTimeout(() => { message.show = false; }, 2000);
};

const handleCreateExpense = async () => {
  if (!newExpense.description.trim()) {
    message.status = 'error';
    message.text = 'Digite uma descrição';
    message.show = true;
    return;
  }

  if (newExpense.totalAmount <= 0) {
    message.status = 'error';
    message.text = 'Digite um valor maior que zero';
    message.show = true;
    return;
  }

  if (salaryInputs.value.length === 0) {
    message.status = 'error';
    message.text = 'Adicione pelo menos um salário';
    message.show = true;
    return;
  }

  try {
    isLoading.value = true;

    // Mapear salários para participantes com ID simples
    const participants = salaryInputs.value.map((salary, index) => ({
      participantId: `emp_${index + 1}`,
      participantName: `Salário ${index + 1}`,
      amount: salary.amount,
    }));

    const expenseData = {
      description: newExpense.description,
      totalAmount: newExpense.totalAmount,
      frequency: newExpense.frequency,
      startDate: newExpense.startDate,
      endDate: newExpense.endDate || undefined,
      category: newExpense.category,
      participants,
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
      <h4>Criar Despesa Recorrente</h4>
      
      <div class="form-group">
        <label>Descrição da Despesa *</label>
        <input 
          v-model="newExpense.description"
          type="text"
          placeholder="Ex: Folha de Pagamento"
          class="input"
        >
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Valor Total (R$) *</label>
          <input 
            v-model.number="newExpense.totalAmount"
            type="number"
            step="100"
            min="0"
            placeholder="0.00"
            class="input"
          >
        </div>

        <div class="form-group">
          <label>Frequência</label>
          <select v-model="newExpense.frequency" class="input">
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Data de Início</label>
          <input 
            v-model="newExpense.startDate"
            type="date"
            class="input"
          >
        </div>

        <div class="form-group">
          <label>Data de Término (Opcional)</label>
          <input 
            v-model="newExpense.endDate"
            type="date"
            class="input"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Categoria (Opcional)</label>
        <input 
          v-model="newExpense.category"
          type="text"
          placeholder="Ex: Folha de Pagamento"
          class="input"
        >
      </div>

      <!-- Distribuição de Salários -->
      <div class="salaries-section" v-if="salaryInputs.length > 0">
        <div class="salaries-header">
          <h5>Distribuição de Salários</h5>
          <button class="btn-auto-distribute" @click="handleAutoDistribute">
            <Zap size="16" />
            Distribuir
          </button>
        </div>

        <div class="salaries-info">
          <div class="info-stat">
            <span class="label">Valor por Salário:</span>
            <span class="value">R$ {{ amountPerSalary.toFixed(2) }}</span>
          </div>
          <div class="info-stat">
            <span class="label">Total:</span>
            <span class="value">R$ {{ totalDistributed.toFixed(2) }}</span>
          </div>
          <div class="info-stat">
            <span class="label">Salários:</span>
            <span class="value">{{ salaryInputs.length }}</span>
          </div>
        </div>

        <div class="salaries-list">
          <div 
            v-for="(salary, index) in salaryInputs"
            :key="salary.tempId"
            class="salary-item"
          >
            <span class="salary-label">Salário {{ index + 1 }}</span>
            <div class="salary-input-group">
              <span class="currency">R$</span>
              <input 
                v-model.number="salaryInputs[index].amount"
                type="number"
                step="0.01"
                min="0"
                class="amount-input"
              >
              <button 
                class="btn-remove"
                @click="removeSalaryLine(index)"
                title="Remover"
              >
                <Trash2 size="16" />
              </button>
            </div>
          </div>
        </div>

        <button class="btn-add-salary" @click="addSalaryLine">
          <Plus size="14" />
          Adicionar Salário
        </button>
      </div>

      <div class="form-actions">
        <button 
          class="btn-success" 
          @click="handleCreateExpense" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Salvando...' : 'Criar Despesa' }}
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
            <span class="detail-label">Período:</span>
            <span class="detail-value">{{ expense.startDate }}</span>
            <span v-if="expense.endDate" class="detail-value">até {{ expense.endDate }}</span>
          </div>
          <div v-if="expense.category" class="detail-item">
            <span class="detail-label">Categoria:</span>
            <span class="detail-value">{{ expense.category }}</span>
          </div>
        </div>

        <div class="salaries-breakdown">
          <h6>Salários ({{ expense.participants.length }})</h6>
          <div class="breakdown-list">
            <div 
              v-for="participant in expense.participants"
              :key="participant.participantId"
              class="breakdown-item"
            >
              <span class="participant-id">{{ participant.participantName }}</span>
              <span class="amount">R$ {{ participant.amount.toFixed(2) }}</span>
            </div>
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

.salaries-section {
  background: var(--color-surface);
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  border: 1px solid var(--color-border);
}

.salaries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.salaries-header h5 {
  margin: 0;
  color: var(--color-text);
}

.btn-auto-distribute {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-auto-distribute:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(29, 185, 84, 0.3);
}

.salaries-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--color-bg);
  border-radius: 6px;
}

.info-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-stat .label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.info-stat .value {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.95rem;
}

.salaries-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.salary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.salary-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  min-width: 100px;
}

.salary-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.amount-input {
  width: 120px;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--color-surface);
  color: var(--color-text);
}

.amount-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-remove {
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

.btn-remove:hover {
  background: rgba(255, 68, 68, 0.2);
}

.btn-add-salary {
  width: 100%;
  background: var(--color-bg);
  color: var(--color-primary);
  border: 2px dashed var(--color-border);
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-add-salary:hover {
  border-color: var(--color-primary);
  background: rgba(29, 185, 84, 0.05);
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

.salaries-breakdown h6 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 0.95rem;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: var(--color-surface);
  border-radius: 4px;
  font-size: 0.9rem;
}

.participant-id {
  color: var(--color-text);
}

.breakdown-item .amount {
  color: var(--color-primary);
  font-weight: 600;
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

  .salaries-info {
    grid-template-columns: 1fr;
  }

  .salary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .salary-input-group {
    width: 100%;
  }
}
</style>
