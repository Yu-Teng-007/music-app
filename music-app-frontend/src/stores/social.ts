import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialApi } from '@/services'
import type { SocialStats, CreateFeedDto, FollowQueryParams } from '@/services/social-api'
import type { User, UserFeed, FeedLike, FeedQueryParams } from '@/types'
import { FeedType } from '@/types'

export const useSocialStore = defineStore('social', () => {
  // 状态
  const feeds = ref<UserFeed[]>([])
  const following = ref<User[]>([])
  const followers = ref<User[]>([])
  const socialStats = ref<SocialStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 分页信息
  const feedsMeta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  const followingMeta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  const followersMeta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // 计算属性
  const hasMoreFeeds = computed(() => {
    return feedsMeta.value.page < feedsMeta.value.totalPages
  })

  const hasMoreFollowing = computed(() => {
    return followingMeta.value.page < followingMeta.value.totalPages
  })

  const hasMoreFollowers = computed(() => {
    return followersMeta.value.page < followersMeta.value.totalPages
  })

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // 设置错误信息
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // 清除错误信息
  const clearError = () => {
    error.value = null
  }

  // 关注用户
  const followUser = async (userId: string) => {
    try {
      setLoading(true)
      clearError()

      await socialApi.followUser(userId)

      // 更新本地状态
      if (socialStats.value) {
        socialStats.value.followingCount++
      }

      return true
    } catch (error: any) {
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 取消关注用户
  const unfollowUser = async (userId: string) => {
    try {
      setLoading(true)
      clearError()

      await socialApi.unfollowUser(userId)

      // 更新本地状态
      if (socialStats.value) {
        socialStats.value.followingCount--
      }

      // 从关注列表中移除
      const index = following.value.findIndex(user => user.id === userId)
      if (index > -1) {
        following.value.splice(index, 1)
      }

      return true
    } catch (error: any) {
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 检查是否关注
  const checkFollowing = async (userId: string): Promise<boolean> => {
    try {
      const result = await socialApi.checkFollowing(userId)
      return result.isFollowing
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 获取关注列表
  const getFollowing = async (userId: string, params?: FollowQueryParams, append = false) => {
    try {
      setLoading(true)
      clearError()

      const result = await socialApi.getFollowing(userId, params)

      if (append) {
        following.value.push(...result.items)
      } else {
        following.value = result.items
      }

      followingMeta.value = result.meta

      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 获取粉丝列表
  const getFollowers = async (userId: string, params?: FollowQueryParams, append = false) => {
    try {
      setLoading(true)
      clearError()

      const result = await socialApi.getFollowers(userId, params)

      if (append) {
        followers.value.push(...result.items)
      } else {
        followers.value = result.items
      }

      followersMeta.value = result.meta

      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 发布动态
  const createFeed = async (feedData: CreateFeedDto) => {
    try {
      setLoading(true)
      clearError()

      const newFeed = await socialApi.createFeed(feedData)

      // 添加到动态列表开头
      feeds.value.unshift(newFeed)

      // 更新统计
      if (socialStats.value) {
        socialStats.value.feedCount++
      }

      return newFeed
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 获取动态列表
  const getFeeds = async (params?: FeedQueryParams, append = false) => {
    try {
      setLoading(true)
      clearError()

      const result = await socialApi.getFeeds(params)

      if (append) {
        feeds.value.push(...result.items)
      } else {
        feeds.value = result.items
      }

      feedsMeta.value = result.meta

      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 获取用户动态
  const getUserFeeds = async (userId: string, params?: FeedQueryParams, append = false) => {
    try {
      setLoading(true)
      clearError()

      const result = await socialApi.getUserFeeds(userId, params)

      if (append) {
        feeds.value.push(...result.items)
      } else {
        feeds.value = result.items
      }

      feedsMeta.value = result.meta

      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 删除动态
  const deleteFeed = async (feedId: string) => {
    try {
      setLoading(true)
      clearError()

      await socialApi.deleteFeed(feedId)

      // 从列表中移除
      const index = feeds.value.findIndex(feed => feed.id === feedId)
      if (index > -1) {
        feeds.value.splice(index, 1)
      }

      // 更新统计
      if (socialStats.value) {
        socialStats.value.feedCount--
      }

      return true
    } catch (error: any) {
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 点赞动态
  const likeFeed = async (feedId: string) => {
    try {
      await socialApi.likeFeed(feedId)

      // 更新本地状态
      const feed = feeds.value.find(f => f.id === feedId)
      if (feed) {
        feed.likeCount = (feed.likeCount || 0) + 1
      }

      return true
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 取消点赞
  const unlikeFeed = async (feedId: string) => {
    try {
      await socialApi.unlikeFeed(feedId)

      // 更新本地状态
      const feed = feeds.value.find(f => f.id === feedId)
      if (feed) {
        feed.likeCount = Math.max((feed.likeCount || 0) - 1, 0)
      }

      return true
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 获取社交统计
  const getSocialStats = async (userId: string) => {
    try {
      const stats = await socialApi.getSocialStats(userId)
      socialStats.value = stats
      return stats
    } catch (error: any) {
      setError(error.message)
      return null
    }
  }

  // 获取我的社交统计
  const getMySocialStats = async () => {
    try {
      const stats = await socialApi.getMySocialStats()
      socialStats.value = stats
      return stats
    } catch (error: any) {
      setError(error.message)
      return null
    }
  }

  // 分享歌曲
  const shareSong = async (songId: string, content?: string) => {
    return await createFeed({
      type: FeedType.SHARE_SONG,
      songId,
      content,
    })
  }

  // 分享歌单
  const sharePlaylist = async (playlistId: string, content?: string) => {
    return await createFeed({
      type: FeedType.SHARE_PLAYLIST,
      playlistId,
      content,
    })
  }

  // 清空状态
  const clearState = () => {
    feeds.value = []
    following.value = []
    followers.value = []
    socialStats.value = null
    error.value = null
  }

  return {
    // 状态
    feeds,
    following,
    followers,
    socialStats,
    isLoading,
    error,
    feedsMeta,
    followingMeta,
    followersMeta,

    // 计算属性
    hasMoreFeeds,
    hasMoreFollowing,
    hasMoreFollowers,

    // 方法
    setLoading,
    setError,
    clearError,
    followUser,
    unfollowUser,
    checkFollowing,
    getFollowing,
    getFollowers,
    createFeed,
    getFeeds,
    getUserFeeds,
    deleteFeed,
    likeFeed,
    unlikeFeed,
    getSocialStats,
    getMySocialStats,
    shareSong,
    sharePlaylist,
    clearState,
  }
})
