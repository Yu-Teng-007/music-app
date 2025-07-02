import { api } from '@/utils/request'
import type { Song, QueryParams } from '@/types'

// 歌曲管理API
export const songsApi = {
  // 获取歌曲列表
  getList(params: QueryParams & {
    genre?: string
    artist?: string
    album?: string
    year?: number
  }): Promise<{
    data: Song[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }> {
    return api.get('/admin/songs', { params })
  },

  // 获取歌曲详情
  getDetail(id: string): Promise<Song> {
    return api.get(`/admin/songs/${id}`)
  },

  // 创建歌曲
  create(data: Partial<Song>): Promise<Song> {
    return api.post('/admin/songs', data)
  },

  // 更新歌曲
  update(id: string, data: Partial<Song>): Promise<Song> {
    return api.patch(`/admin/songs/${id}`, data)
  },

  // 删除歌曲
  delete(id: string): Promise<void> {
    return api.delete(`/admin/songs/${id}`)
  },

  // 批量删除歌曲
  batchDelete(ids: string[]): Promise<void> {
    return api.post('/admin/songs/batch-delete', { ids })
  },

  // 获取歌曲统计
  getStatistics(): Promise<{
    totalSongs: number
    totalPlayCount: number
    genreStats: Array<{ genre: string; count: number }>
    artistStats: Array<{ artist: string; count: number; totalPlays: number }>
    recentUploads: Song[]
  }> {
    return api.get('/admin/songs/statistics')
  },

  // 获取热门歌曲
  getPopular(limit?: number): Promise<Song[]> {
    return api.get('/admin/songs/popular', { params: { limit } })
  },

  // 更新播放次数
  updatePlayCount(id: string, increment?: number): Promise<Song> {
    return api.post(`/admin/songs/${id}/play-count`, { increment })
  },
}
