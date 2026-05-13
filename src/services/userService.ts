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
            const response = await axiosInstance.post('/auth/login', userLoginData)
            const { accessToken, refreshToken } = response.data
            console.log('Dados de login recebidos:', response.data)

            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('refresh_token', refreshToken)

            console.log('access_token:', accessToken)
            
            return response.data
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            throw error
        }
    }
    async getUserInfo() {
        try {
            const response = await axiosInstance.get(`/auth/`)
            return response.data
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            throw error
        }
    }
}
