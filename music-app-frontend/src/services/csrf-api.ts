import { type AxiosResponse } from 'axios'
import { apiClient } from './http'
import type { ApiResponse } from '@/types/api'

// CSRF相关API
export const csrfApi = {
  // 获取CSRF token
  async getCsrfToken(): Promise<string> {
    try {
      const response: AxiosResponse<ApiResponse<{ csrfToken: string }>> = await apiClient.get(
        '/csrf-token',
        {
          // 确保请求包含凭据以获取session
          withCredentials: true,
        }
      )
      return response.data.data.csrfToken
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取CSRF令牌失败')
    }
  },
}

// CSRF服务类
export class CsrfService {
  private csrfToken: string | null = null
  private tokenPromise: Promise<string> | null = null

  /**
   * 获取CSRF token（带缓存）
   */
  async getToken(): Promise<string> {
    // 如果已有token，直接返回
    if (this.csrfToken) {
      return this.csrfToken
    }

    // 如果正在获取token，等待现有请求
    if (this.tokenPromise) {
      return this.tokenPromise
    }

    // 发起新的token获取请求
    this.tokenPromise = this.fetchToken()
    
    try {
      this.csrfToken = await this.tokenPromise
      return this.csrfToken
    } finally {
      this.tokenPromise = null
    }
  }

  /**
   * 从服务器获取新的CSRF token
   */
  private async fetchToken(): Promise<string> {
    try {
      const token = await csrfApi.getCsrfToken()
      console.log('CSRF token获取成功')
      return token
    } catch (error) {
      console.error('获取CSRF token失败:', error)
      throw error
    }
  }

  /**
   * 清除缓存的token（当token失效时调用）
   */
  clearToken(): void {
    this.csrfToken = null
    this.tokenPromise = null
  }

  /**
   * 刷新token
   */
  async refreshToken(): Promise<string> {
    this.clearToken()
    return this.getToken()
  }

  /**
   * 检查是否有有效的token
   */
  hasToken(): boolean {
    return !!this.csrfToken
  }
}

// 导出单例实例
export const csrfService = new CsrfService()
