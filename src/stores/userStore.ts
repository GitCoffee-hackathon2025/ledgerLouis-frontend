import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type { userLoginType, userRegisterType } from '@/types/UserTypes';

export const useUserStore = defineStore('user', () => {
  const userRegisterData = reactive<userRegisterType>({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  });
  const userLoginData = reactive<userLoginType>({
    email: '',
    password: '',
    rememberMe: false
  });

  const setUserRegister = (userData: userRegisterType) => {
    Object.assign(userRegisterData, userData);
  };

  const setUserLogin = (userData: userLoginType) => {
    Object.assign(userLoginData, userData);
  };

  const clearUser = () => {
    Object.assign(userRegisterData, {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: ''
    });
    Object.assign(userLoginData, {
      email: '',
      password: '',
      rememberMe: false
    });
  };

  return {
    userRegisterData,
    userLoginData,
    setUserRegister,
    setUserLogin,
    clearUser
  };
});