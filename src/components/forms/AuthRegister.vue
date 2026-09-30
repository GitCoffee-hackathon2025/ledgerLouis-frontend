<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';
import UserService from '../../services/userService';
import type { userRegisterType } from '@/types/UserTypes';
import { useToast } from '@/composables/useToast';
import { apiErrorMessage } from '@/utils/apiError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userService = new UserService();
const router = useRouter();
const toast = useToast();

const formData = reactive<userRegisterType>({ name: '', email: '', password: '' });
const error = ref('');
const loading = ref(false);

const validate = () => {
  if (!formData.name || !formData.email || !formData.password) return 'Preencha todos os campos.';
  if (formData.name.length < 7) return 'O nome deve conter pelo menos 7 caracteres.';
  if (!EMAIL_REGEX.test(formData.email)) return 'Digite um e-mail válido.';
  if (formData.password.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
  if (!/\d/.test(formData.password)) return 'A senha deve conter pelo menos um número.';
  return '';
};

const handleRegister = async () => {
  error.value = validate();
  if (error.value) return;

  loading.value = true;
  try {
    await userService.register(formData);
    toast.success('Conta criada! Agora é só entrar.');
    router.push({ name: 'entrar' });
  } catch (err) {
    error.value = apiErrorMessage(err, 'Erro ao cadastrar usuário.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleRegister">
    <BaseInput
      id="registerName"
      v-model="formData.name"
      label="Nome completo"
      placeholder="Como devemos te chamar?"
      autocomplete="name"
    />
    <BaseInput
      id="registerEmail"
      v-model="formData.email"
      label="E-mail"
      type="email"
      placeholder="voce@empresa.com"
      autocomplete="email"
    />
    <BaseInput
      id="registerPassword"
      v-model="formData.password"
      label="Senha"
      type="password"
      placeholder="••••••••"
      autocomplete="new-password"
      hint="Mínimo de 8 caracteres, com pelo menos um número."
    />

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <BaseButton type="submit" size="lg" block :loading="loading">Criar conta</BaseButton>
  </form>
</template>
