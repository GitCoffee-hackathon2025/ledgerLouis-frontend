
<script setup lang="ts">
import { reactive } from 'vue';
import BaseInput from '../inputs/BaseInput.vue';
import PrimaryButton from '../inputs/PrimaryButton.vue';
import UserService from '../../services/userService';
import ResponsePopUp from './ResponsePopUp.vue';
import type { userRegisterType } from '@/types/UserTypes';

const userService = new UserService();

const formData = reactive<userRegisterType>({
  name: '',
  email: '',
  password: '',
  // passwordConfirmation: ''
});

const response = reactive({
  status: '',
  message: '',
  show: false
});

const handleRegister = async () => {
  try {
    if (!formData.name || !formData.email || !formData.password) {
      response.status = 'error';
      response.message = 'Preencha todos os campos';
      response.show = true;
      return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      response.status = 'error';
      response.message = 'Digite um e-mail válido';
      response.show = true;
      return;
    }

  
    if (formData.password.length < 8) {
      response.status = 'error';
      response.message = 'A senha deve ter no mínimo 8 caracteres';
      response.show = true;
      return;
    }

    await userService.register(formData);

    response.status = 'success';
    response.message = 'Cadastro realizado com sucesso!';
    response.show = true;

  } catch (error: any) {
    response.status = 'error';
    response.message =
      error?.response?.data?.message || 'Erro ao cadastrar usuário';
    response.show = true;
  }

  setTimeout(() => {
    response.show = false;
  }, 3000);
};
</script>
<template>
  <div class="register-card">
    <ResponsePopUp :status="response.status" :message="response.message" :show="response.show"  @close="response.show = false"/>
    <form @submit.prevent="handleRegister" class="form-content">
      <BaseInput 
        label="Nome de Usuário"
        placeholder="Digite o nome"
        v-model="formData.name"
      />
      
      <BaseInput 
        label="E-mail"
        placeholder="exemplo@email.com"
        v-model="formData.email"
      />
      
      <BaseInput 
        label="Senha"
        type="password"
        placeholder="••••••••"
        v-model="formData.password"
      />
      
      <!-- <BaseInput 
        label="Confirmar Senha"
        type="password"
        placeholder="••••••••"
        v-model="formData.passwordConfirmation"
      /> -->

      <div class="actions">
        <PrimaryButton type="submit" label="Cadastrar" >Cadastrar</PrimaryButton>
        
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-card {
  background-color: var(--color-surface);
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