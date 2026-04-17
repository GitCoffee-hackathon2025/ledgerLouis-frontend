import { defineStore } from "pinia";
import { ref } from "vue";
import type { userLoginType, userRegisterType } from "@/types/UserTypes";


export const useUserStore = defineStore('user', () => {
    
  const userRegisterData = ref<userRegisterType | null>(null);
  const userLoginData = ref<userLoginType | null>(null);

  const setUserRegister = (userData: userRegisterType) => {
    userRegisterData.value = userData;
  };

  const setUserLogin = (userData: userLoginType) => {
    userLoginData.value = userData;
  };

  const clearUser = () => {
    userRegisterData.value = null;
    userLoginData.value = null;
  };

  return {
    userRegisterData,
    userLoginData,
    setUserRegister,
    setUserLogin,
    clearUser
  };
});