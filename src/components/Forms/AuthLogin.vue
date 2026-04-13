<script setup lang="ts">
import { reactive } from 'vue';
import BaseInput from '../inputs/BaseInput.vue';
import PrimaryButton from '../inputs/PrimaryButton.vue';

const loginData = reactive({
  identity: '',
  password: '',
  rememberMe: false
});

const handleLogin = () => {
  console.log('Tentativa de login:', loginData);
};
</script>

<template>
  <div class="login-card">
    <form @submit.prevent="handleLogin" class="form-content">
      
      <BaseInput 
        label="E-mail ou CNPJ"
        placeholder="Digite seu acesso"
        v-model="loginData.identity"
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