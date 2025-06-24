import { type AxiosResponse } from 'axios'
import { apiClient } from './http'
import type { ApiResponse, ChangePasswordData, ResetPasswordData } from '@/types/api'
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/stores/auth'

// 认证相关API
export const authApi = {
  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post(
        '/auth/login',
        credentials
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败，请检查用户名和密码')
    }
  },

  // 用户注册
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post(
        '/auth/register',
        credentials
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '注册失败，请稍后重试')
    }
  },

  // 刷新token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ token: string; refreshToken: string }>> =
        await apiClient.post('/auth/refresh', { refreshToken })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token刷新失败')
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/me')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户信息失败')
    }
  },

  // 获取用户档案（包含个性化信息）
  async getUserProfile(): Promise<User & { greeting: string; subGreeting: string }> {
    try {
      const response: AxiosResponse<ApiResponse<User & { greeting: string; subGreeting: string }>> =
        await apiClient.get('/auth/profile')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户档案失败')
    }
  },

  // 用户登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error: any) {
      // 即使服务器登出失败，也要清除本地状态
      console.error('Server logout failed:', error)
    }
  },

  // 更新用户信息
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.put(
        '/auth/profile',
        userData
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新用户信息失败')
    }
  },

  // 修改密码
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.put('/auth/change-password', data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '修改密码失败')
    }
  },

  // 发送短信验证码
  async sendSmsCode(phone: string, type: 'register' | 'login'): Promise<void> {
    try {
      await apiClient.post('/auth/send-sms', { phone, type })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送验证码失败')
    }
  },

  // 获取验证码（仅开发环境）
  async getSmsCode(
    phone: string,
    type: 'register' | 'login'
  ): Promise<{ code: string; expiresAt: string } | null> {
    try {
      const response: AxiosResponse<ApiResponse<{ code: string; expiresAt: string } | null>> =
        await apiClient.get(`/auth/get-sms-code?phone=${phone}&type=${type}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取验证码失败')
    }
  },

  // 获取所有验证码（仅开发环境）
  async getAllSmsCodes(): Promise<
    Array<{ phone: string; code: string; type: string; expiresAt: string }>
  > {
    try {
      const response: AxiosResponse<
        ApiResponse<Array<{ phone: string; code: string; type: string; expiresAt: string }>>
      > = await apiClient.get('/auth/get-all-sms-codes')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取验证码列表失败')
    }
  },
}
