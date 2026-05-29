import type {userLoginType, userRegisterType} from "@/types/UserTypes";
import axiosInstance from "@/plugins/axios";
import { useUserStore } from "@/stores/userStore";

export interface UserResponseData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UploadAvatarResponse {
    success: boolean;
    message: string;
    avatar?: string;
}

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

    async getUserInfo(): Promise<UserResponseData> {
        try {
            const response = await axiosInstance.get<UserResponseData>(`/users/byID`)

            console.log('Informações do usuário obtidas:', response.data)
            return response.data
        } catch (error) {
            console.error('Erro ao buscar usuário:', error)
            throw error
        }
    }

    async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await axiosInstance.post<UploadAvatarResponse>(
                '/users/me/profile-image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            // Guardar a URL do avatar na store
            if (response.data.avatar) {
                const userStore = useUserStore()
                userStore.setavatar(response.data.avatar)
                console.log('Avatar URL salva na store:', response.data.avatar)
            }

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

