import { apiClient } from './http'
import type { PaginationParams, SearchParams } from '@/types/api'

// 播放历史相关API
export const historyApi = {
  // 添加播放记录
  async addHistory(songId: string) {
    try {
      const response = await apiClient.post('/history', { songId })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加播放记录失败')
    }
  },

  // 获取播放历史列表
  async getHistoryList(params?: PaginationParams & SearchParams) {
    try {
      const response = await apiClient.get('/history', { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放历史失败')
    }
  },

  // 获取播放历史详情
  async getHistoryDetail(id: string) {
    try {
      const response = await apiClient.get(`/history/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放历史详情失败')
    }
  },

  // 删除播放历史
  async deleteHistory(id: string) {
    try {
      const response = await apiClient.delete(`/history/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除播放历史失败')
    }
  },

  // 清空播放历史
  async clearHistory() {
    try {
      const response = await apiClient.delete('/history')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '清空播放历史失败')
    }
  },
}
