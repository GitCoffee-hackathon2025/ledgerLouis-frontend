
<script setup lang="ts">
import { reactive } from 'vue';
import BaseInput from '../inputs/BaseInput.vue';

import PrimaryButton from '../inputs/PrimaryButton.vue';

const formData = reactive({
  name: '',
  identity: '',
  password: '',
  confirmPassword: ''
});

const handleRegister = () => {
  console.log('Dados enviados:', formData);
};
</script>
<template>
  <div class="register-card">
    
    <form @submit.prevent="handleRegister" class="form-content">
      <BaseInput 
        label="Nome da Empresa"
        placeholder="Digite o nome"
        v-model="formData.name"
      />
      
      <BaseInput 
        label="E-mail ou CNPJ"
        placeholder="exemplo@email.com"
        v-model="formData.identity"
      />
      
      <BaseInput 
        label="Senha"
        type="password"
        placeholder="••••••••"
        v-model="formData.password"
      />
      
      <BaseInput 
        label="Confirmar Senha"
        type="password"
        placeholder="••••••••"
        v-model="formData.confirmPassword"
      />

      <div class="actions">
        <PrimaryButton type="submit" label="Cadastrar" >Cadastrar</PrimaryButton>
        
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 400px;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.form-content {
  padding: 2rem 1.5rem;
}

.actions {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>