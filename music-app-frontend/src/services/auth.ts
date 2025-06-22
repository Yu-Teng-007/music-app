import { useAuthStore } from '@/stores/auth'
import { authApi } from './api'
import type { LoginCredentials, RegisterCredentials } from '@/stores/auth'

// 认证服务类
export class AuthService {
  private authStore = useAuthStore()

  // 用户登录
  async login(credentials: LoginCredentials): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      const authResponse = await authApi.login(credentials)
      this.authStore.saveAuth(authResponse)
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 用户注册
  async register(credentials: RegisterCredentials): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      const authResponse = await authApi.register(credentials)
      this.authStore.saveAuth(authResponse)
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 用户登出
  async logout(): Promise<void> {
    this.authStore.setLoading(true)

    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.authStore.clearAuth()
      this.authStore.setLoading(false)
    }
  }

  // 刷新用户信息
  async refreshUserInfo(): Promise<void> {
    if (!this.authStore.isAuthenticated) return

    try {
      const user = await authApi.getCurrentUser()
      this.authStore.updateUser(user)
    } catch (error: any) {
      console.error('Failed to refresh user info:', error)
      // 如果获取用户信息失败，可能token已过期
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        this.authStore.clearAuth()
      }
    }
  }

  // 更新用户资料
  async updateProfile(userData: Partial<any>): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      const updatedUser = await authApi.updateProfile(userData)
      this.authStore.updateUser(updatedUser)
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      await authApi.changePassword({ currentPassword, newPassword })
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 忘记密码
  async forgotPassword(email: string): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      await authApi.forgotPassword(email)
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 重置密码
  async resetPassword(token: string, password: string): Promise<void> {
    this.authStore.setLoading(true)
    this.authStore.clearError()

    try {
      await authApi.resetPassword({ token, password })
    } catch (error: any) {
      this.authStore.setError(error.message)
      throw error
    } finally {
      this.authStore.setLoading(false)
    }
  }

  // 检查认证状态
  checkAuthStatus(): boolean {
    if (!this.authStore.isAuthenticated) return false
    
    if (this.authStore.isTokenExpired()) {
      this.authStore.clearAuth()
      return false
    }
    
    return true
  }

  // 自动刷新token（如果需要）
  async autoRefreshToken(): Promise<boolean> {
    if (!this.authStore.refreshToken) return false

    try {
      const tokens = await authApi.refreshToken(this.authStore.refreshToken)
      
      // 更新token
      this.authStore.token = tokens.token
      this.authStore.refreshToken = tokens.refreshToken
      
      // 更新localStorage
      localStorage.setItem('auth_token', tokens.token)
      localStorage.setItem('auth_refresh_token', tokens.refreshToken)
      
      return true
    } catch (error) {
      console.error('Auto refresh token failed:', error)
      this.authStore.clearAuth()
      return false
    }
  }
}

// 创建单例实例
export const authService = new AuthService()

// 表单验证工具函数
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return '邮箱不能为空'
  if (!emailRegex.test(email)) return '请输入有效的邮箱地址'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return '密码不能为空'
  if (password.length < 6) return '密码长度至少6位'
  if (password.length > 50) return '密码长度不能超过50位'
  return null
}

export const validateName = (name: string): string | null => {
  if (!name) return '姓名不能为空'
  if (name.length < 2) return '姓名长度至少2位'
  if (name.length > 20) return '姓名长度不能超过20位'
  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return '确认密码不能为空'
  if (password !== confirmPassword) return '两次输入的密码不一致'
  return null
}
