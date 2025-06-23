import { apiClient } from './http'
import type { PlaylistQueryParams, PlaylistData, PlaylistUpdateData } from '@/types/api'

// 播放列表相关API
export const playlistApi = {
  // 获取播放列表
  async getPlaylists(params?: PlaylistQueryParams) {
    try {
      const response = await apiClient.get('/playlists', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放列表失败')
    }
  },

  // 获取我的播放列表
  async getMyPlaylists() {
    try {
      const response = await apiClient.get('/playlists/my')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取我的播放列表失败')
    }
  },

  // 获取公开播放列表
  async getPublicPlaylists(limit?: number) {
    try {
      const response = await apiClient.get('/playlists/public', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取公开播放列表失败')
    }
  },

  // 获取推荐播放列表
  async getRecommendedPlaylists(limit?: number) {
    try {
      const response = await apiClient.get('/playlists/recommended', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取推荐播放列表失败')
    }
  },

  // 搜索播放列表
  async searchPlaylists(keyword: string, limit?: number) {
    try {
      const response = await apiClient.get('/playlists/search', {
        params: { keyword, limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '搜索播放列表失败')
    }
  },

  // 获取播放列表详情
  async getPlaylist(id: string) {
    try {
      const response = await apiClient.get(`/playlists/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放列表详情失败')
    }
  },

  // 创建播放列表
  async createPlaylist(data: PlaylistData) {
    try {
      const response = await apiClient.post('/playlists', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建播放列表失败')
    }
  },

  // 更新播放列表
  async updatePlaylist(id: string, data: PlaylistUpdateData) {
    try {
      const response = await apiClient.patch(`/playlists/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新播放列表失败')
    }
  },

  // 删除播放列表
  async deletePlaylist(id: string) {
    try {
      await apiClient.delete(`/playlists/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除播放列表失败')
    }
  },

  // 添加歌曲到播放列表
  async addSongToPlaylist(playlistId: string, songId: string) {
    try {
      const response = await apiClient.post(`/playlists/${playlistId}/songs`, { songId })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加歌曲到播放列表失败')
    }
  },

  // 从播放列表移除歌曲
  async removeSongFromPlaylist(playlistId: string, songId: string) {
    try {
      const response = await apiClient.delete(`/playlists/${playlistId}/songs/${songId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '从播放列表移除歌曲失败')
    }
  },
}
