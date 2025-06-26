import { apiClient } from './http'
import type { PaginationParams } from '@/types/api'

// 下载相关类型定义
export interface Download {
  id: string
  userId: string
  songId: string
  quality: AudioQuality
  status: DownloadStatus
  localPath?: string
  fileSize: number
  downloadedSize: number
  progress: number
  errorMessage?: string
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  song?: Song
}

export interface DownloadCache {
  id: string
  cacheKey: string
  type: CacheType
  filePath: string
  originalUrl?: string
  fileSize: number
  mimeType?: string
  checksum?: string
  accessCount: number
  lastAccessedAt?: string
  expiresAt?: string
  isValid: boolean
  createdAt: string
  updatedAt: string
}

export interface UserStorage {
  id: string
  userId: string
  usedSpace: number
  totalSpace: number
  downloadCount: number
  maxDownloads: number
  lastCleanupAt?: string
  autoCleanup: boolean
  cleanupDays: number
  createdAt: string
  updatedAt: string
}

export interface StorageStats {
  usedSpace: number
  totalSpace: number
  availableSpace: number
  usagePercentage: number
  downloadCount: number
  maxDownloads: number
}

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum AudioQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LOSSLESS = 'lossless',
}

export enum CacheType {
  AUDIO = 'audio',
  COVER = 'cover',
  METADATA = 'metadata',
}

export interface CreateDownloadDto {
  songId: string
  quality: AudioQuality
}

export interface BatchDownloadDto {
  songIds: string[]
  quality: AudioQuality
}

export interface DownloadQueryParams extends PaginationParams {
  status?: DownloadStatus
  quality?: AudioQuality
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CleanupOptions {
  days?: number
  cleanupFailed?: boolean
  cleanupUnused?: boolean
  force?: boolean
}

export interface CleanupResult {
  cleaned: number
  freedSpace: number
}

// 下载管理API
export const downloadApi = {
  // 创建下载任务
  async createDownload(downloadData: CreateDownloadDto) {
    try {
      const response = await apiClient.post('/download', downloadData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建下载任务失败')
    }
  },

  // 批量创建下载任务
  async createBatchDownload(batchData: BatchDownloadDto) {
    try {
      const response = await apiClient.post('/download/batch', batchData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '批量创建下载任务失败')
    }
  },

  // 获取下载列表
  async getDownloads(params?: DownloadQueryParams) {
    try {
      const response = await apiClient.get('/download', { params })
      return {
        items: response.data.data,
        meta: response.data.meta,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取下载列表失败')
    }
  },

  // 获取下载详情
  async getDownload(downloadId: string) {
    try {
      const response = await apiClient.get(`/download/${downloadId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取下载详情失败')
    }
  },

  // 删除下载任务
  async deleteDownload(downloadId: string) {
    try {
      await apiClient.delete(`/download/${downloadId}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除下载任务失败')
    }
  },

  // 暂停下载
  async pauseDownload(downloadId: string) {
    try {
      const response = await apiClient.put(`/download/${downloadId}/pause`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '暂停下载失败')
    }
  },

  // 恢复下载
  async resumeDownload(downloadId: string) {
    try {
      const response = await apiClient.put(`/download/${downloadId}/resume`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '恢复下载失败')
    }
  },

  // 重试下载
  async retryDownload(downloadId: string) {
    try {
      const response = await apiClient.put(`/download/${downloadId}/retry`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '重试下载失败')
    }
  },

  // 获取存储统计
  async getStorageStats(): Promise<StorageStats> {
    try {
      const response = await apiClient.get('/download/stats')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取存储统计失败')
    }
  },

  // 清理下载文件
  async cleanupDownloads(options?: CleanupOptions): Promise<CleanupResult> {
    try {
      const response = await apiClient.post('/download/cleanup', options || {})
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '清理下载文件失败')
    }
  },

  // 便捷方法：下载歌曲
  async downloadSong(songId: string, quality: AudioQuality = AudioQuality.MEDIUM) {
    return this.createDownload({ songId, quality })
  },

  // 便捷方法：批量下载歌曲
  async downloadSongs(songIds: string[], quality: AudioQuality = AudioQuality.MEDIUM) {
    return this.createBatchDownload({ songIds, quality })
  },

  // 便捷方法：下载歌单中的所有歌曲
  async downloadPlaylist(playlistId: string, quality: AudioQuality = AudioQuality.MEDIUM) {
    // 这里需要先获取歌单中的歌曲列表，然后批量下载
    // 实际实现中可能需要调用歌单API获取歌曲列表
    throw new Error('下载歌单功能待实现')
  },

  // 格式化文件大小
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 获取音质显示名称
  getQualityDisplayName(quality: AudioQuality): string {
    const qualityNames = {
      [AudioQuality.LOW]: '省流量 (64kbps)',
      [AudioQuality.MEDIUM]: '标准音质 (128kbps)',
      [AudioQuality.HIGH]: '高音质 (320kbps)',
      [AudioQuality.LOSSLESS]: '无损音质 (FLAC)',
    }
    return qualityNames[quality] || '未知音质'
  },

  // 获取下载状态显示名称
  getStatusDisplayName(status: DownloadStatus): string {
    const statusNames = {
      [DownloadStatus.PENDING]: '等待中',
      [DownloadStatus.DOWNLOADING]: '下载中',
      [DownloadStatus.COMPLETED]: '已完成',
      [DownloadStatus.FAILED]: '下载失败',
      [DownloadStatus.PAUSED]: '已暂停',
    }
    return statusNames[status] || '未知状态'
  },
}
