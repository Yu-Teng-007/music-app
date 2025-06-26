import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { downloadApi } from '@/services'
import type {
  Download,
  StorageStats,
  CreateDownloadDto,
  BatchDownloadDto,
  DownloadQueryParams,
  CleanupOptions,
  CleanupResult,
  DownloadStatus,
  AudioQuality,
} from '@/services/download-api'

export const useDownloadStore = defineStore('download', () => {
  // 状态
  const downloads = ref<Download[]>([])
  const storageStats = ref<StorageStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 分页信息
  const downloadsMeta = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })

  // 计算属性
  const hasMoreDownloads = computed(() => {
    return downloadsMeta.value.page < downloadsMeta.value.totalPages
  })

  const completedDownloads = computed(() => {
    return downloads.value.filter(download => download.status === DownloadStatus.COMPLETED)
  })

  const downloadingCount = computed(() => {
    return downloads.value.filter(download => 
      download.status === DownloadStatus.DOWNLOADING || 
      download.status === DownloadStatus.PENDING
    ).length
  })

  const failedDownloads = computed(() => {
    return downloads.value.filter(download => download.status === DownloadStatus.FAILED)
  })

  const totalDownloadSize = computed(() => {
    return completedDownloads.value.reduce((total, download) => total + download.fileSize, 0)
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

  // 创建下载任务
  const createDownload = async (downloadData: CreateDownloadDto) => {
    try {
      setLoading(true)
      clearError()
      
      const newDownload = await downloadApi.createDownload(downloadData)
      
      // 添加到下载列表开头
      downloads.value.unshift(newDownload)
      
      // 更新存储统计
      await getStorageStats()
      
      return newDownload
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 批量创建下载任务
  const createBatchDownload = async (batchData: BatchDownloadDto) => {
    try {
      setLoading(true)
      clearError()
      
      const newDownloads = await downloadApi.createBatchDownload(batchData)
      
      // 添加到下载列表开头
      downloads.value.unshift(...newDownloads)
      
      // 更新存储统计
      await getStorageStats()
      
      return newDownloads
    } catch (error: any) {
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 获取下载列表
  const getDownloads = async (params?: DownloadQueryParams, append = false) => {
    try {
      setLoading(true)
      clearError()
      
      const result = await downloadApi.getDownloads(params)
      
      if (append) {
        downloads.value.push(...result.items)
      } else {
        downloads.value = result.items
      }
      
      downloadsMeta.value = result.meta
      
      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 删除下载任务
  const deleteDownload = async (downloadId: string) => {
    try {
      setLoading(true)
      clearError()
      
      await downloadApi.deleteDownload(downloadId)
      
      // 从列表中移除
      const index = downloads.value.findIndex(download => download.id === downloadId)
      if (index > -1) {
        downloads.value.splice(index, 1)
      }
      
      // 更新存储统计
      await getStorageStats()
      
      return true
    } catch (error: any) {
      setError(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 暂停下载
  const pauseDownload = async (downloadId: string) => {
    try {
      const updatedDownload = await downloadApi.pauseDownload(downloadId)
      
      // 更新本地状态
      const index = downloads.value.findIndex(download => download.id === downloadId)
      if (index > -1) {
        downloads.value[index] = updatedDownload
      }
      
      return true
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 恢复下载
  const resumeDownload = async (downloadId: string) => {
    try {
      const updatedDownload = await downloadApi.resumeDownload(downloadId)
      
      // 更新本地状态
      const index = downloads.value.findIndex(download => download.id === downloadId)
      if (index > -1) {
        downloads.value[index] = updatedDownload
      }
      
      return true
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 重试下载
  const retryDownload = async (downloadId: string) => {
    try {
      const updatedDownload = await downloadApi.retryDownload(downloadId)
      
      // 更新本地状态
      const index = downloads.value.findIndex(download => download.id === downloadId)
      if (index > -1) {
        downloads.value[index] = updatedDownload
      }
      
      return true
    } catch (error: any) {
      setError(error.message)
      return false
    }
  }

  // 获取存储统计
  const getStorageStats = async () => {
    try {
      const stats = await downloadApi.getStorageStats()
      storageStats.value = stats
      return stats
    } catch (error: any) {
      setError(error.message)
      return null
    }
  }

  // 清理下载文件
  const cleanupDownloads = async (options?: CleanupOptions): Promise<CleanupResult | null> => {
    try {
      setLoading(true)
      clearError()
      
      const result = await downloadApi.cleanupDownloads(options)
      
      // 重新获取下载列表和存储统计
      await Promise.all([
        getDownloads({ page: 1, limit: downloadsMeta.value.limit }),
        getStorageStats(),
      ])
      
      return result
    } catch (error: any) {
      setError(error.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 便捷方法：下载歌曲
  const downloadSong = async (songId: string, quality: AudioQuality = AudioQuality.MEDIUM) => {
    return await createDownload({ songId, quality })
  }

  // 便捷方法：批量下载歌曲
  const downloadSongs = async (songIds: string[], quality: AudioQuality = AudioQuality.MEDIUM) => {
    return await createBatchDownload({ songIds, quality })
  }

  // 检查歌曲是否已下载
  const isSongDownloaded = (songId: string, quality?: AudioQuality): boolean => {
    return downloads.value.some(download => 
      download.songId === songId && 
      download.status === DownloadStatus.COMPLETED &&
      (!quality || download.quality === quality)
    )
  }

  // 获取歌曲的下载状态
  const getSongDownloadStatus = (songId: string, quality?: AudioQuality): DownloadStatus | null => {
    const download = downloads.value.find(download => 
      download.songId === songId &&
      (!quality || download.quality === quality)
    )
    return download?.status || null
  }

  // 获取歌曲的下载进度
  const getSongDownloadProgress = (songId: string, quality?: AudioQuality): number => {
    const download = downloads.value.find(download => 
      download.songId === songId &&
      (!quality || download.quality === quality)
    )
    return download?.progress || 0
  }

  // 清空状态
  const clearState = () => {
    downloads.value = []
    storageStats.value = null
    error.value = null
  }

  return {
    // 状态
    downloads,
    storageStats,
    isLoading,
    error,
    downloadsMeta,

    // 计算属性
    hasMoreDownloads,
    completedDownloads,
    downloadingCount,
    failedDownloads,
    totalDownloadSize,

    // 方法
    setLoading,
    setError,
    clearError,
    createDownload,
    createBatchDownload,
    getDownloads,
    deleteDownload,
    pauseDownload,
    resumeDownload,
    retryDownload,
    getStorageStats,
    cleanupDownloads,
    downloadSong,
    downloadSongs,
    isSongDownloaded,
    getSongDownloadStatus,
    getSongDownloadProgress,
    clearState,
  }
})
