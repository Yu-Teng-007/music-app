import { apiClient } from './http'
import type { FavoriteQueryParams } from '@/types/api'

// 收藏相关API
export const favoritesApi = {
  // 添加收藏
  async addFavorite(songId: string) {
    try {
      const response = await apiClient.post('/favorites', { songId })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加收藏失败')
    }
  },

  // 取消收藏
  async removeFavorite(songId: string) {
    try {
      const response = await apiClient.delete(`/favorites/${songId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '取消收藏失败')
    }
  },

  // 获取收藏列表
  async getFavorites(params?: FavoriteQueryParams) {
    try {
      const response = await apiClient.get('/favorites', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取收藏列表失败')
    }
  },

  // 检查收藏状态
  async checkFavorite(songId: string) {
    try {
      const response = await apiClient.get(`/favorites/check/${songId}`)
      return response.data.data.isFavorite
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '检查收藏状态失败')
    }
  },

  // 获取收藏数量
  async getFavoriteCount() {
    try {
      const response = await apiClient.get('/favorites/count')
      return response.data.data.count
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取收藏数量失败')
    }
  },
}
