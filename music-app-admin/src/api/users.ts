import { api } from '@/utils/request'
import type { AdminUser, QueryParams } from '@/types'

// 管理员用户API
export const usersApi = {
  // 获取管理员用户列表
  getList(params: QueryParams): Promise<{
    data: AdminUser[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> {
    return api.get('/admin/users', { params })
  },

  // 获取管理员用户详情
  getDetail(id: string): Promise<AdminUser> {
    return api.get(`/admin/users/${id}`)
  },

  // 创建管理员用户
  create(data: Partial<AdminUser> & { password: string; roleIds?: string[] }): Promise<AdminUser> {
    return api.post('/admin/users', data)
  },

  // 更新管理员用户
  update(id: string, data: Partial<AdminUser> & { roleIds?: string[] }): Promise<AdminUser> {
    return api.patch(`/admin/users/${id}`, data)
  },

  // 删除管理员用户
  delete(id: string): Promise<void> {
    return api.delete(`/admin/users/${id}`)
  },

  // 重置密码
  resetPassword(id: string, password: string): Promise<void> {
    return api.post(`/admin/users/${id}/reset-password`, { password })
  },

  // 启用/禁用用户
  toggleStatus(id: string): Promise<AdminUser> {
    return api.post(`/admin/users/${id}/toggle-status`)
  },
}
