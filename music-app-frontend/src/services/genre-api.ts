import { apiClient } from './http'

export interface Genre {
  id: string
  name: string
  description: string
  color: string
  icon: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 分类相关API
export const genreApi = {
  // 获取所有分类
  async getGenres() {
    try {
      const response = await apiClient.get('/genres')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类列表失败')
    }
  },

  // 获取单个分类详情
  async getGenre(id: string) {
    try {
      const response = await apiClient.get(`/genres/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类详情失败')
    }
  },

  // 按分类名称获取分类
  async getGenreByName(name: string) {
    try {
      const response = await apiClient.get(`/genres/name/${name}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类详情失败')
    }
  },

  // 获取活跃的分类（用于前端展示）
  async getActiveGenres() {
    try {
      const response = await apiClient.get('/genres/active')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取活跃分类失败')
    }
  },
}
