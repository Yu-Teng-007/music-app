import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { favoritesApi } from '@/services/favorites-api'
import type { Song } from './music'

export interface Favorite {
  id: string
  songId: string
  userId: string
  createdAt: string
  song?: Song
}

export const useFavoritesStore = defineStore('favorites', () => {
  // 收藏列表
  const favorites = ref<Favorite[]>([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 计算属性
  const favoriteCount = computed(() => favorites.value.length)
  
  const favoriteSongIds = computed(() => 
    favorites.value.map(fav => fav.songId)
  )
  
  // 检查歌曲是否已收藏
  const isFavorite = (songId: string): boolean => {
    return favoriteSongIds.value.includes(songId)
  }
  
  // 获取收藏的歌曲列表
  const favoriteSongs = computed(() => 
    favorites.value
      .filter(fav => fav.song)
      .map(fav => fav.song!)
  )
  
  // 加载收藏列表
  const loadFavorites = async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    try {
      isLoading.value = true
      const response = await favoritesApi.getFavorites(params)
      
      if (response.success && response.data) {
        // 如果是分页加载，追加数据；否则替换数据
        if (params?.page && params.page > 1) {
          favorites.value.push(...response.data)
        } else {
          favorites.value = response.data
        }
      }
      
      return response
    } catch (error) {
      console.error('加载收藏列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  // 添加收藏
  const addFavorite = async (songId: string) => {
    try {
      // 检查是否已收藏
      if (isFavorite(songId)) {
        return
      }
      
      const response = await favoritesApi.addFavorite(songId)
      
      if (response.success && response.data) {
        // 添加到本地列表
        favorites.value.unshift(response.data)
      }
      
      return response
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw error
    }
  }
  
  // 取消收藏
  const removeFavorite = async (songId: string) => {
    try {
      const response = await favoritesApi.removeFavorite(songId)
      
      if (response.success) {
        // 从本地列表中移除
        const index = favorites.value.findIndex(fav => fav.songId === songId)
        if (index > -1) {
          favorites.value.splice(index, 1)
        }
      }
      
      return response
    } catch (error) {
      console.error('取消收藏失败:', error)
      throw error
    }
  }
  
  // 切换收藏状态
  const toggleFavorite = async (songId: string) => {
    if (isFavorite(songId)) {
      await removeFavorite(songId)
    } else {
      await addFavorite(songId)
    }
  }
  
  // 检查收藏状态（从服务器）
  const checkFavoriteStatus = async (songId: string) => {
    try {
      const response = await favoritesApi.checkFavorite(songId)
      return response.success ? response.data.isFavorite : false
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      return false
    }
  }
  
  // 获取收藏数量（从服务器）
  const getFavoriteCount = async () => {
    try {
      const response = await favoritesApi.getFavoriteCount()
      return response.success ? response.data.count : 0
    } catch (error) {
      console.error('获取收藏数量失败:', error)
      return 0
    }
  }
  
  // 清空收藏列表
  const clearFavorites = () => {
    favorites.value = []
  }
  
  // 批量添加收藏
  const addMultipleFavorites = async (songIds: string[]) => {
    const results = []
    
    for (const songId of songIds) {
      try {
        const result = await addFavorite(songId)
        results.push({ songId, success: true, data: result })
      } catch (error) {
        results.push({ songId, success: false, error })
      }
    }
    
    return results
  }
  
  // 批量取消收藏
  const removeMultipleFavorites = async (songIds: string[]) => {
    const results = []
    
    for (const songId of songIds) {
      try {
        const result = await removeFavorite(songId)
        results.push({ songId, success: true, data: result })
      } catch (error) {
        results.push({ songId, success: false, error })
      }
    }
    
    return results
  }
  
  return {
    // 状态
    favorites,
    isLoading,
    
    // 计算属性
    favoriteCount,
    favoriteSongIds,
    favoriteSongs,
    
    // 方法
    isFavorite,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    checkFavoriteStatus,
    getFavoriteCount,
    clearFavorites,
    addMultipleFavorites,
    removeMultipleFavorites,
  }
})
