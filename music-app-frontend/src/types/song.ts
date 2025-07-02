// 歌曲相关类型定义
export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl: string
  genre?: string
  year?: number
  playCount: number
  lyrics?: string
  fileSize?: number
  originalFileName?: string
  sourceId?: string
  sourceUrl?: string
  uploaderId?: string
  createdAt: string
  updatedAt: string
}

export interface SongQueryParams {
  page?: number
  limit?: number
  search?: string
  genre?: string
  artist?: string
  album?: string
  year?: number
  sortBy?: 'title' | 'artist' | 'album' | 'year' | 'playCount' | 'createdAt'
  sortOrder?: 'ASC' | 'DESC'
}
