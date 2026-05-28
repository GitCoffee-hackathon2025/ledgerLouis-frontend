import type {userLoginType, userRegisterType} from "@/types/UserTypes";
import axiosInstance from "@/plugins/axios";
import { useUserStore } from "@/stores/userStore";

export default class UserService {

    async register(userData: userRegisterType) {
        try {
            console.log('Dados de registro recebidos:', userData);
            const response = await axiosInstance.post('/users/register', userData)
            return response.data
        } catch (error) {
            console.error('Erro ao registrar usuário:', error)
            throw error
        }
    }
    
    async login(userLoginData: userLoginType) {
        try {
            console.log('Dados de login recebidos:', userLoginData);
            const response = await axiosInstance.post('/auth/login', userLoginData)
            const { accessToken, refreshToken } = response.data

            const userStore = useUserStore()
            userStore.setTokens({
                accessToken,
                refreshToken
            })


            localStorage.setItem('token', accessToken)
            
            return response.data
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            throw error
        }
    }

    async getUserInfo() {
        try {
            const response = await axiosInstance.get(`/users/byID`)
            return response.data
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            throw error
        }
    }

    async uploadAvatar(file: File) {
  try {

    const formData = new FormData()

    formData.append(
      'file',
      file
    )

    
    const response =
      await axiosInstance.post(
        '/users/me/profile-image',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
      )

    return response.data

  } catch (error) {
    console.error(
      'Erro ao fazer upload de avatar:',
      error
    )

    throw error
  }
}
}
