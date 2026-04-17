<script setup lang="ts">
import { reactive } from 'vue';
import BaseInput from '../inputs/BaseInput.vue';
import PrimaryButton from '../inputs/PrimaryButton.vue';
import  UserService  from '../../services/userService';
import type { userLoginType} from '../../types/UserTypes';
import ResponsePopUp from './ResponsePopUp.vue';
import { useUserStore } from '@/stores/userStore';
const userStore = useUserStore();
const loginData = userStore.userLoginData as userLoginType;
const userService = new UserService();

const response = reactive({
  status: '',
  message: '',
  show: false
});

const handleLogin = async () => {
  try {
    if(!loginData.email || !loginData.password) {
      response.status = 'error';
      response.message = 'Preencha todos os campos';
      response.show = true;
      return;
    }
    if(loginData.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    await userService.login(loginData);
    response.status = 'success';
    response.message = 'Login realizado com sucesso!';
    response.show = true;
  } catch (error: any) {
    response.status = 'error';
    response.message = error?.response?.data?.message || 'Erro ao fazer login';
    response.show = true;
  }
};
</script>

<template>
  <ResponsePopUp :status="response.status" :message="response.message" :show="response.show" @close="response.show = false" />
  <div class="login-card">
    <form @submit.prevent="handleLogin" class="form-content">
      
      <BaseInput 
        label="E-mail ou CNPJ"
        placeholder="Digite seu acesso"
        v-model="loginData.email"
      />
      
      <BaseInput 
        label="Senha"
        type="password"
        placeholder="••••••••"
        v-model="loginData.password"
      />

      <div class="extra-options">
        <label class="remember-me">
          <input type="checkbox" v-model="loginData.rememberMe"> 
          Lembrar de mim
        </label>
        <a href="#" class="forgot-password">Esqueceu a senha?</a>
      </div>

      <div class="actions">
        <PrimaryButton type="submit">Entrar</PrimaryButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 400px;
  border-radius: 0 0 20px 20px; 
  overflow: hidden;
}

.form-content {
  padding: 2rem 1.5rem;
}

.extra-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-family: var(--font-body);
  font-size: 0.85rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-placeholder);
  cursor: pointer;
}

.forgot-password {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.forgot-password:hover {
  text-decoration: underline;
}

.actions {
  margin-top: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>    