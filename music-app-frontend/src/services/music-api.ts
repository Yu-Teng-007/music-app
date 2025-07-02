import { apiClient } from './http'
import type { SongQueryParams } from '@/types/api'

// 音乐相关API
export const musicApi = {
  // 创建歌曲
  async createSong(songData: any) {
    try {
      const response = await apiClient.post('/songs', songData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建歌曲失败')
    }
  },

  // 获取歌曲列表
  async getSongs(params?: SongQueryParams) {
    try {
      const response = await apiClient.get('/songs', { params })
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取歌曲列表失败')
    }
  },

  // 获取单个歌曲详情
  async getSong(id: string) {
    try {
      const response = await apiClient.get(`/songs/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取歌曲详情失败')
    }
  },

  // 播放歌曲（增加播放次数）
  async playSong(id: string) {
    try {
      const response = await apiClient.post(`/songs/${id}/play`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '播放歌曲失败')
    }
  },

  // 获取推荐歌曲
  async getRecommendedSongs(limit?: number) {
    try {
      const response = await apiClient.get('/songs/recommended', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取推荐歌曲失败')
    }
  },

  // 获取热门歌曲
  async getPopularSongs(limit?: number) {
    try {
      const response = await apiClient.get('/songs/popular', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取热门歌曲失败')
    }
  },

  // 搜索歌曲
  async searchSongs(keyword: string, limit?: number) {
    try {
      const response = await apiClient.get('/songs/search', {
        params: { keyword, limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '搜索歌曲失败')
    }
  },

  // 按分类获取歌曲
  async getSongsByGenre(genre: string, params: any = {}) {
    try {
      const response = await apiClient.get(`/songs/genre/${genre}`, {
        params,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类歌曲失败')
    }
  },

  // 按艺术家获取歌曲
  async getSongsByArtist(artist: string, limit?: number) {
    try {
      const response = await apiClient.get(`/songs/artist/${artist}`, {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取艺术家歌曲失败')
    }
  },

  // 获取我的歌曲
  async getMySongs(params?: SongQueryParams) {
    try {
      const response = await apiClient.get('/songs/my', { params })
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取我的歌曲失败')
    }
  },

  // 获取我的歌曲统计
  async getMyStats() {
    try {
      const response = await apiClient.get('/songs/my/stats')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取统计信息失败')
    }
  },

  // 更新歌曲信息
  async updateSong(id: string, data: any) {
    try {
      const response = await apiClient.patch(`/songs/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新歌曲失败')
    }
  },

  // 删除歌曲
  async deleteSong(id: string) {
    try {
      await apiClient.delete(`/songs/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除歌曲失败')
    }
  },
}
