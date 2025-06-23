import { apiClient } from './http'
import type { SongQueryParams } from '@/types/api'

// 音乐相关API
export const musicApi = {
  // 获取歌曲列表
  async getSongs(params?: SongQueryParams) {
    try {
      const response = await apiClient.get('/songs', { params })
      return response.data.data
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

  // 按类型获取歌曲
  async getSongsByGenre(genre: string, limit?: number) {
    try {
      const response = await apiClient.get(`/songs/genre/${genre}`, {
        params: { limit },
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
}
