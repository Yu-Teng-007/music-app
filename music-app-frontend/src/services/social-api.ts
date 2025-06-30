import { apiClient } from './http'
import type { PaginationParams } from '@/types/api'

// 社交功能相关类型定义
export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: string
  follower?: import('@/types').User
  following?: import('@/types').User
}

export interface UserFeed {
  id: string
  userId: string
  type: FeedType
  content?: string
  metadata?: any
  songId?: string
  playlistId?: string
  targetUserId?: string
  likeCount: number
  commentCount: number
  shareCount: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
  user?: import('@/types').User
  song?: import('@/types').Song
  playlist?: import('@/types').Playlist
  targetUser?: import('@/types').User
}

export interface FeedLike {
  id: string
  userId: string
  feedId: string
  createdAt: string
  user?: import('@/types').User
  feed?: UserFeed
}

export interface FeedComment {
  id: string
  userId: string
  feedId: string
  content: string
  replyToId?: string
  likeCount: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
  user?: import('@/types').User
  feed?: UserFeed
  replyTo?: FeedComment
}

export interface SocialStats {
  followingCount: number
  followerCount: number
  feedCount: number
  totalLikes: number
}

export enum FeedType {
  SHARE_SONG = 'share_song',
  SHARE_PLAYLIST = 'share_playlist',
  LIKE_SONG = 'like_song',
  CREATE_PLAYLIST = 'create_playlist',
  FOLLOW_USER = 'follow_user',
  COMMENT_SONG = 'comment_song',
}

export interface CreateFeedDto {
  type: FeedType
  content?: string
  songId?: string
  playlistId?: string
  targetUserId?: string
  metadata?: any
}

export interface FeedQueryParams extends PaginationParams {
  userId?: string
  type?: FeedType
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface FollowQueryParams extends PaginationParams {
  search?: string
}

export interface CreateFeedCommentDto {
  content: string
  replyToId?: string
}

// 社交功能API
export const socialApi = {
  // 关注相关
  async followUser(userId: string) {
    try {
      const response = await apiClient.post(`/social/follow/${userId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '关注用户失败')
    }
  },

  async unfollowUser(userId: string) {
    try {
      await apiClient.delete(`/social/follow/${userId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '取消关注失败')
    }
  },

  async checkFollowing(userId: string): Promise<{ isFollowing: boolean }> {
    try {
      const response = await apiClient.get(`/social/follow/check/${userId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '检查关注状态失败')
    }
  },

  async getFollowing(userId: string, params?: FollowQueryParams) {
    try {
      const response = await apiClient.get(`/social/following/${userId}`, { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取关注列表失败')
    }
  },

  async getFollowers(userId: string, params?: FollowQueryParams) {
    try {
      const response = await apiClient.get(`/social/followers/${userId}`, { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取粉丝列表失败')
    }
  },

  // 动态相关
  async createFeed(feedData: CreateFeedDto) {
    try {
      const response = await apiClient.post('/social/feeds', feedData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发布动态失败')
    }
  },

  async getFeeds(params?: FeedQueryParams) {
    try {
      const response = await apiClient.get('/social/feeds', { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取动态列表失败')
    }
  },

  async getUserFeeds(userId: string, params?: FeedQueryParams) {
    try {
      const response = await apiClient.get(`/social/feeds/user/${userId}`, { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户动态失败')
    }
  },

  async deleteFeed(feedId: string) {
    try {
      await apiClient.delete(`/social/feeds/${feedId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除动态失败')
    }
  },

  // 点赞相关
  async likeFeed(feedId: string) {
    try {
      const response = await apiClient.post(`/social/feeds/${feedId}/like`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '点赞失败')
    }
  },

  async unlikeFeed(feedId: string) {
    try {
      await apiClient.delete(`/social/feeds/${feedId}/like`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '取消点赞失败')
    }
  },

  // 统计相关
  async getSocialStats(userId: string): Promise<SocialStats> {
    try {
      const response = await apiClient.get(`/social/stats/${userId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取社交统计失败')
    }
  },

  async getMySocialStats(): Promise<SocialStats> {
    try {
      const response = await apiClient.get('/social/stats/me')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取我的社交统计失败')
    }
  },

  // 分享歌曲
  async shareSong(songId: string, content?: string) {
    return this.createFeed({
      type: FeedType.SHARE_SONG,
      songId,
      content,
    })
  },

  // 分享歌单
  async sharePlaylist(playlistId: string, content?: string) {
    return this.createFeed({
      type: FeedType.SHARE_PLAYLIST,
      playlistId,
      content,
    })
  },

  // 分享喜欢的歌曲
  async shareLikeSong(songId: string, content?: string) {
    return this.createFeed({
      type: FeedType.LIKE_SONG,
      songId,
      content,
    })
  },
}
