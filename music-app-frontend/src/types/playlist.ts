// 歌单相关类型定义
import type { User } from './user'
import type { Song } from './song'

export interface Playlist {
  id: string
  name: string
  title?: string // 兼容性属性，与 name 相同
  description: string
  coverUrl?: string
  isPrivate: boolean
  isDefault?: boolean
  createdAt: string
  updatedAt: string
  user?: User
  userId: string
  songs?: Song[]
  songCount?: number
}

export interface PlaylistQueryParams {
  page?: number
  limit?: number
  search?: string
  userId?: string
  isPrivate?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'ASC' | 'DESC'
}

export interface PlaylistData {
  name: string
  description?: string
  coverUrl?: string
  isPrivate?: boolean
}

export interface PlaylistUpdateData {
  name?: string
  description?: string
  coverUrl?: string
  isPrivate?: boolean
}
