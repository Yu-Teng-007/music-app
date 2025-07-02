import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 用于跟踪是否正在刷新令牌
let isRefreshing = false
// 存储等待刷新完成的请求
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

// 处理等待队列
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 添加认证token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    // 如果是成功响应，返回data字段中的实际数据
    if (data.success) {
      return data.data
    }

    // 如果是错误响应，抛出错误
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  async (error) => {
    const originalRequest = error.config

    // 处理HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response

      // 处理401未授权错误
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // 如果正在刷新令牌，将请求加入等待队列
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return request(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // 尝试刷新令牌
          const refreshTokenValue = localStorage.getItem('admin_refresh_token')
          if (!refreshTokenValue) {
            throw new Error('没有刷新令牌')
          }

          // 动态导入认证API以避免循环依赖
          const { authApi } = await import('@/api/auth')
          const response = await authApi.refreshToken(refreshTokenValue)

          // 更新本地存储
          localStorage.setItem('admin_token', response.accessToken)
          localStorage.setItem('admin_user', JSON.stringify(response.user))
          localStorage.setItem('admin_permissions', JSON.stringify(response.permissions))
          localStorage.setItem('admin_refresh_token', response.refreshToken)

          // 更新原始请求的Authorization头
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`

          // 处理等待队列
          processQueue(null, response.accessToken)

          // 重试原始请求
          return request(originalRequest)
        } catch (refreshError) {
          // 刷新失败，清除所有认证信息
          processQueue(refreshError, null)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          localStorage.removeItem('admin_permissions')
          localStorage.removeItem('admin_refresh_token')

          // 跳转到登录页
          window.location.href = '/login'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      // 处理其他错误状态码
      switch (status) {
        case 403:
          // 权限不足
          console.error('权限不足:', data.message)
          break
        case 404:
          console.error('资源不存在:', data.message)
          break
        case 500:
          console.error('服务器错误:', data.message)
          break
        default:
          console.error('请求错误:', data.message || error.message)
      }

      return Promise.reject(new Error(data.message || error.message))
    }

    // 网络错误或其他错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时'))
    }

    return Promise.reject(new Error(error.message || '网络错误'))
  },
)

export default request

// 封装常用的请求方法
export const api = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.patch(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config)
  },
}
