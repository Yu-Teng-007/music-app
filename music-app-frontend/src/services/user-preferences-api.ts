import { apiClient } from './http'

export interface UserPreference {
  id: string
  userId: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

export interface UpsertPreferenceDto {
  key: string
  value: string
}

// 用户偏好设置相关API
export const userPreferencesApi = {
  // 获取所有用户偏好设置
  async getAllPreferences(): Promise<UserPreference[]> {
    try {
      const response = await apiClient.get('/user-preferences')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户偏好设置失败')
    }
  },

  // 获取指定键的用户偏好设置
  async getPreference(key: string): Promise<UserPreference | null> {
    try {
      const response = await apiClient.get(`/user-preferences/${key}`)
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw new Error(error.response?.data?.message || '获取用户偏好设置失败')
    }
  },

  // 更新或创建用户偏好设置
  async upsertPreference(preference: UpsertPreferenceDto): Promise<UserPreference> {
    try {
      const response = await apiClient.put('/user-preferences', preference)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '保存用户偏好设置失败')
    }
  },

  // 批量更新或创建用户偏好设置
  async bulkUpsertPreferences(preferences: UpsertPreferenceDto[]): Promise<UserPreference[]> {
    try {
      const response = await apiClient.put('/user-preferences/bulk', { preferences })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '批量保存用户偏好设置失败')
    }
  },

  // 删除指定键的用户偏好设置
  async deletePreference(key: string): Promise<void> {
    try {
      await apiClient.delete(`/user-preferences/${key}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除用户偏好设置失败')
    }
  },

  // 清空所有用户偏好设置
  async clearAllPreferences(): Promise<void> {
    try {
      await apiClient.delete('/user-preferences')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '清空用户偏好设置失败')
    }
  },
}
