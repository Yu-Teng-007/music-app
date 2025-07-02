import { api } from '@/utils/request'
import type { LoginForm, LoginResponse, AdminUser } from '@/types'

// 管理员认证API
export const authApi = {
  // 登录
  login(data: LoginForm): Promise<LoginResponse> {
    return api.post('/admin/auth/login', data)
  },

  // 获取当前用户信息
  getProfile(): Promise<{ user: AdminUser; permissions: string[] }> {
    return api.get('/admin/auth/profile')
  },

  // 刷新token
  refreshToken(refreshToken: string): Promise<LoginResponse> {
    return api.post('/admin/auth/refresh', { refreshToken })
  },

  // 登出
  logout(): Promise<void> {
    return api.post('/admin/auth/logout')
  },
}
