import axios, { type AxiosInstance } from 'axios'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 减少超时时间，避免长时间卡住
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用凭据以支持session和CSRF
})

// 请求拦截器 - 添加认证token和CSRF token
apiClient.interceptors.request.use(
  async config => {
    // 添加认证token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 对于需要CSRF保护的请求添加CSRF token
    const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(
      config.method?.toLowerCase() || ''
    )
    const isExcludedPath = ['/auth/login', '/auth/register', '/auth/send-sms', '/csrf-token'].some(
      path => config.url?.includes(path)
    )

    if (needsCsrf && !isExcludedPath) {
      try {
        // 动态导入CSRF服务以避免循环依赖
        const { csrfService } = await import('./csrf-api')
        const csrfToken = await csrfService.getToken()
        config.headers['x-csrf-token'] = csrfToken
      } catch (error) {
        console.warn('获取CSRF token失败:', error)
        // 不阻止请求，让服务器处理CSRF验证失败
      }
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证错误、CSRF错误和网络错误
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

    // CSRF错误处理
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      console.warn('CSRF验证失败，尝试刷新CSRF token')
      try {
        // 动态导入CSRF服务以避免循环依赖
        const { csrfService } = await import('./csrf-api')
        await csrfService.refreshToken()

        // 重试原始请求
        const originalRequest = error.config
        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true
          const newCsrfToken = await csrfService.getToken()
          originalRequest.headers['x-csrf-token'] = newCsrfToken
          return apiClient(originalRequest)
        }
      } catch (csrfError) {
        console.error('CSRF token刷新失败:', csrfError)
        error.message = 'CSRF验证失败，请刷新页面重试'
      }
    }

    // 认证错误处理
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
