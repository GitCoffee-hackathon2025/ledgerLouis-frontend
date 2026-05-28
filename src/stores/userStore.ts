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

  const accessToken = ref<string>('')

  const avatarUrl = ref<string>('')

  const setUserRegister = (userData: userRegisterType) => {
    Object.assign(userRegisterData, userData);
  };

  const setUserLogin = (userData: userLoginType) => {
    Object.assign(userLoginData, userData);
  };

  //Guardar tokens após login
  const setTokens = (tokensData: { accessToken: string; refreshToken: string }) => {
    // Access token fica em memória 
    accessToken.value = tokensData.accessToken
    
    console.log('Tokens salvos na store:', {
      accessToken: accessToken.value,
      refreshToken: tokensData.refreshToken
    })
    // Refresh token fica no localStorage 
    localStorage.setItem('refresh_token', tokensData.refreshToken)
  }

  //  Guardar avatar URL na store
  const setAvatarUrl = (url: string) => {
    avatarUrl.value = url
  }

  // Limpar tokens ao deslogar
  const clearTokens = () => {
    accessToken.value = ''
    localStorage.removeItem('refresh_token')
  }

  //  Restaurar accessToken da memória ao carregar (se houver)
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
    avatarUrl.value = ''
    clearTokens()
  };

  return {
    userRegisterData,
    userLoginData,
    accessToken,
    avatarUrl,
    setUserRegister,
    setUserLogin,
    setTokens,
    setAvatarUrl,
    clearTokens,
    restoreAccessToken,
    clearUser,
  };
});