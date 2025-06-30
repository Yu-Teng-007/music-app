// 下载相关类型定义
import type { User } from './user'
import type { Song } from './song'

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum AudioQuality {
  LOW = 'low', // 64kbps
  MEDIUM = 'medium', // 128kbps
  HIGH = 'high', // 320kbps
  LOSSLESS = 'lossless', // FLAC
}

export interface Download {
  id: string
  userId: string
  songId: string
  quality: AudioQuality
  status: DownloadStatus
  localPath?: string
  fileSize: number
  downloadedSize?: number
  progress: number
  errorMessage?: string
  startedAt?: string
  completedAt?: string
  lastAccessedAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: User
  song?: Song
}

export interface DownloadRequest {
  songId: string
  quality?: AudioQuality
}

export interface UserStorage {
  id: string
  userId: string
  usedSpace: number
  totalSpace: number
  downloadCount: number
  maxDownloads: number
  lastCleanupAt?: string
}
