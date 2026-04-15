
import axios from 'axios'


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,                
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') 

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
      localStorage.removeItem('auth_token')

    }

    if (error.response?.status === 500) {
      console.error('Erro interno no servidor')
    }

    return Promise.reject(error)
  }
)

export default api