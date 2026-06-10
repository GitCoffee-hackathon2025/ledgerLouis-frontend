
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,                
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    // ✅ Pega o accessToken da store (está em memória)
    const userStore = useUserStore()
    console.log('Interceptando requisição. Access token atual na store:', userStore.accessToken)
    const token = userStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expirado ou inválido')
      const userStore = useUserStore()
      userStore.clearTokens()
      window.location.href = '/entrar'
    }

    if (error.response?.status === 500) {
      console.error('Erro interno no servidor')
    }

    return Promise.reject(error)
  }
)

export default api