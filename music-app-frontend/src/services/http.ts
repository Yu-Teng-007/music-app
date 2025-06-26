import axios, { type AxiosInstance } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 减少超时时间，避免长时间卡住
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证错误和网络错误
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // 网络错误处理
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('API请求超时，请检查网络连接或后端服务状态')
      error.message = '网络请求超时，请稍后重试'
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('网络连接失败，请检查后端服务是否启动')
      error.message = '无法连接到服务器，请检查网络连接'
    }

    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')

      // 可以在这里触发重新登录逻辑
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
