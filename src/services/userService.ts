import type {userLoginType, userRegisterType} from "@/types/UserTypes";
import axiosInstance from "@/plugins/axios";
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
