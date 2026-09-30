<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import UserService from '../../services/userService';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/composables/useToast';
import { apiErrorMessage, apiErrorStatus } from '@/utils/apiError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const userService = new UserService();

const loginData = userStore.userLoginData;
const error = ref('');
const loading = ref(false);

const validate = () => {
  if (!loginData.email || !loginData.password) return 'Preencha todos os campos.';
  if (!EMAIL_REGEX.test(loginData.email)) return 'Digite um e-mail válido.';
  if (loginData.password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  return '';
};

const handleLogin = async () => {
  loginData.email = loginData.email.trim().toLowerCase();
  error.value = validate();
  if (error.value) return;

  if (loginData.rememberMe) localStorage.setItem('rememberMe', 'true');
  else localStorage.removeItem('rememberMe');

  // Limpar avatar da conta anterior
  userStore.setavatar('');

  loading.value = true;
  try {
    await userService.login(loginData);
    toast.success('Login realizado com sucesso!');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.push(redirect);
  } catch (err) {
    const status = apiErrorStatus(err);
    error.value =
      status === 429
        ? 'Muitas tentativas. Aguarde alguns segundos e tente novamente.'
        : status === 401
          ? 'E-mail ou senha inválidos.'
          : apiErrorMessage(err, 'Não foi possível conectar ao servidor.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleLogin">
    <BaseInput
      id="loginEmail"
      v-model="loginData.email"
      label="E-mail"
      type="email"
      placeholder="voce@empresa.com"
      autocomplete="email"
    />
    <BaseInput
      id="loginPassword"
      v-model="loginData.password"
      label="Senha"
      type="password"
      placeholder="••••••••"
      autocomplete="current-password"
    />

    <div class="extra-options">
      <label class="checkbox">
        <input v-model="loginData.rememberMe" type="checkbox" />
        Lembrar de mim
      </label>
      <a href="#" class="link">Esqueceu a senha?</a>
    </div>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <BaseButton type="submit" size="lg" block :loading="loading">Entrar</BaseButton>
  </form>
</template>

<style scoped>
.extra-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
}
</style>
