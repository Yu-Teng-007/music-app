import { apiClient } from './http'
import type { PaginationParams } from '@/types/api'

// 搜索历史相关API
export const searchHistoryApi = {
  // 添加搜索历史
  async addSearchHistory(keyword: string) {
    try {
      const response = await apiClient.post('/search-history', { keyword })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加搜索历史失败')
    }
  },

  // 获取搜索历史列表
  async getSearchHistoryList(params?: PaginationParams) {
    try {
      const response = await apiClient.get('/search-history', { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取搜索历史失败')
    }
  },

  // 删除搜索历史
  async deleteSearchHistory(id: string) {
    try {
      const response = await apiClient.delete(`/search-history/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除搜索历史失败')
    }
  },

  // 清空搜索历史
  async clearSearchHistory() {
    try {
      const response = await apiClient.delete('/search-history')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '清空搜索历史失败')
    }
  },
}
