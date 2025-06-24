import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/services/auth-api'

export interface User {
  id: string
  phone?: string
  username?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  loginType: 'phone' | 'username'
  phone?: string
  smsCode?: string
  username?: string
  password?: string
}

export interface RegisterCredentials {
  registerType: 'phone' | 'username'
  phone?: string
  smsCode?: string
  username?: string
  password?: string
  confirmPassword?: string
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
    if (user.value?.username) {
      return user.value.username.slice(0, 2).toUpperCase()
    }
    if (user.value?.phone) {
      return user.value.phone.slice(-2)
    }
    return '用户'
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

  // 认证相关的业务逻辑 actions

  // 用户登录
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      const authResponse = await authApi.login(credentials)
      saveAuth(authResponse)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 用户注册
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      const authResponse = await authApi.register(credentials)
      saveAuth(authResponse)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 用户登出
  const logout = async (): Promise<void> => {
    setLoading(true)

    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      clearAuth()
      setLoading(false)
    }
  }

  // 刷新用户信息
  const refreshUserInfo = async (): Promise<void> => {
    if (!isAuthenticated.value) return

    try {
      const userData = await authApi.getCurrentUser()
      updateUser(userData)
    } catch (error: any) {
      console.error('Failed to refresh user info:', error)
      // 如果获取用户信息失败，可能token已过期
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        clearAuth()
      }
    }
  }

  // 获取用户档案（包含个性化信息）
  const getUserProfile = async () => {
    if (!isAuthenticated.value) {
      throw new Error('用户未登录')
    }

    try {
      return await authApi.getUserProfile()
    } catch (error: any) {
      console.error('Failed to get user profile:', error)
      // 如果获取用户档案失败，可能token已过期
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        clearAuth()
      }
      throw error
    }
  }

  // 更新用户资料
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      const updatedUser = await authApi.updateProfile(userData)
      updateUser(updatedUser)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 修改密码
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      await authApi.changePassword({ currentPassword, newPassword })
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 发送短信验证码
  const sendSmsCode = async (phone: string, type: 'register' | 'login'): Promise<void> => {
    setLoading(true)
    clearError()

    try {
      await authApi.sendSmsCode(phone, type)
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 检查认证状态
  const checkAuthStatus = (): boolean => {
    if (!isAuthenticated.value) return false

    if (isTokenExpired()) {
      clearAuth()
      return false
    }

    return true
  }

  // 自动刷新token（如果需要）
  const autoRefreshToken = async (): Promise<boolean> => {
    if (!refreshToken.value) return false

    try {
      const tokens = await authApi.refreshToken(refreshToken.value)

      // 更新token
      token.value = tokens.token
      refreshToken.value = tokens.refreshToken

      // 更新localStorage
      localStorage.setItem('auth_token', tokens.token)
      localStorage.setItem('auth_refresh_token', tokens.refreshToken)

      return true
    } catch (error) {
      console.error('Auto refresh token failed:', error)
      clearAuth()
      return false
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

    // 基础方法
    saveAuth,
    clearAuth,
    setError,
    clearError,
    setLoading,
    updateUser,
    isTokenExpired,
    restoreAuth,

    // 业务逻辑 actions
    login,
    register,
    logout,
    refreshUserInfo,
    getUserProfile,
    updateProfile,
    changePassword,
    sendSmsCode,
    checkAuthStatus,
    autoRefreshToken,
  }
})
