import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { userLoginType, userRegisterType } from '@/types/UserTypes';

export const useUserStore = defineStore('user', () => {
  const userRegisterData = reactive<userRegisterType>({
    name: '',
    email: '',
    password: '',
  });
  
  const userLoginData = reactive<userLoginType>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // ✅ Tokens (accessToken em memória, refreshToken no localStorage)
  const accessToken = ref<string>('')

  const setUserRegister = (userData: userRegisterType) => {
    Object.assign(userRegisterData, userData);
  };

  const setUserLogin = (userData: userLoginType) => {
    Object.assign(userLoginData, userData);
  };

  // ✅ NOVO: Guardar tokens após login
  const setTokens = (tokensData: { accessToken: string; refreshToken: string }) => {
    // Access token fica em memória (store Pinia)
    accessToken.value = tokensData.accessToken
    
    console.log('Tokens salvos na store:', {
      accessToken: accessToken.value,
      refreshToken: tokensData.refreshToken
    })
    // Refresh token fica no localStorage (persiste após reload)
    localStorage.setItem('refresh_token', tokensData.refreshToken)
  }

  // ✅ NOVO: Limpar tokens ao deslogar
  const clearTokens = () => {
    accessToken.value = ''
    localStorage.removeItem('refresh_token')
  }

  // ✅ NOVO: Restaurar accessToken da memória ao carregar (se houver)
  const restoreAccessToken = (token: string) => {
    accessToken.value = token
  }

  const clearUser = () => {
    Object.assign(userRegisterData, {
      name: '',
      email: '',
      password: '',
    });
    Object.assign(userLoginData, {
      email: '',
      password: '',
      rememberMe: false
    });
    clearTokens()
  };

  return {
    userRegisterData,
    userLoginData,
    accessToken,
    setUserRegister,
    setUserLogin,
    setTokens,
    clearTokens,
    restoreAccessToken,
    clearUser,
  };
});