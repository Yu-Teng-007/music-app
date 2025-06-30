// 社交功能相关类型定义
import type { User } from './user'
import type { Song } from './song'
import type { Playlist } from './playlist'

export enum FeedType {
  SHARE_SONG = 'share_song',
  SHARE_PLAYLIST = 'share_playlist',
  CREATE_PLAYLIST = 'create_playlist',
  FOLLOW_USER = 'follow_user',
  LIKE_SONG = 'like_song',
}

export interface UserFeed {
  id: string
  userId: string
  type: FeedType
  content: string
  metadata?: any
  isPublic: boolean
  shareCount: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
  user?: User
  song?: Song
  playlist?: Playlist
  targetUser?: User
  likes?: FeedLike[]
  comments?: FeedComment[]
  likeCount: number
  commentCount: number
  isLiked?: boolean
}

export interface FeedLike {
  id: string
  userId: string
  feedId: string
  createdAt: string
  user?: User
}

export interface FeedComment {
  id: string
  userId: string
  feedId: string
  content: string
  createdAt: string
  user?: User
}

export interface CreateFeedRequest {
  type: FeedType
  content: string
  songId?: string
  playlistId?: string
  targetUserId?: string
  isPublic?: boolean
}

export interface FeedQueryParams {
  page?: number
  limit?: number
  userId?: string
  type?: FeedType
  isPublic?: boolean
}
