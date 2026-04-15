import type {userLoginType, userRegisterType} from "@/types/UserTypes";
import axiosInstance from "@/plugins/axios";
import { inject } from "vue";

const api = inject('api') as typeof axiosInstance
class UserService {
    async register(userData: userRegisterType) {
       /* try {
            const response = await axiosInstance.post('/users/register', userData)
            return response.data
        } catch (error) {
            console.error('Erro ao registrar usuário:', error)
            throw error
        }*/
       console.log('Dados de registro recebidos:', userData);
       return { success: true, message: 'Registro simulado com sucesso!' };
    }

    async login(userLoginData: userLoginType) {
        try {
            const response = await axiosInstance.post('/users/login', userLoginData)
            const { token } = response.data
            localStorage.setItem('auth_token', token)
            return response.data
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            throw error
        }
    }
}

export default new UserService()