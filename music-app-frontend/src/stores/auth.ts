import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userInitials = computed(() => {
    if (!user.value?.name) return ''
    return user.value.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  })

  // 从localStorage恢复认证状态
  const restoreAuth = () => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedRefreshToken = localStorage.getItem('auth_refresh_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser) {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error)
      clearAuth()
    }
  }

  // 保存认证状态到localStorage
  const saveAuth = (authData: AuthResponse) => {
    try {
      user.value = authData.user
      token.value = authData.token
      refreshToken.value = authData.refreshToken

      localStorage.setItem('auth_token', authData.token)
      localStorage.setItem('auth_refresh_token', authData.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(authData.user))
    } catch (error) {
      console.error('Failed to save auth state:', error)
    }
  }

  // 清除认证状态
  const clearAuth = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    error.value = null

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_refresh_token')
    localStorage.removeItem('auth_user')
  }

  // 设置错误信息
  const setError = (errorMessage: string) => {
    error.value = errorMessage
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  // 检查token是否过期
  const isTokenExpired = () => {
    if (!token.value) return true
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // 初始化时恢复认证状态
  restoreAuth()

  return {
    // 状态
    user,
    token,
    refreshToken,
    isLoading,
    error,
    
    // 计算属性
    isAuthenticated,
    userInitials,
    
    // 方法
    saveAuth,
    clearAuth,
    setError,
    clearError,
    setLoading,
    updateUser,
    isTokenExpired,
    restoreAuth,
  }
})
