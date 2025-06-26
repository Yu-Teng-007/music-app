import { apiClient } from './http'
import type { UploadResponse } from '@/types/api'

// 文件类型验证配置
const fileValidations = {
  music: {
    allowedTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg'],
    maxSize: 50 * 1024 * 1024, // 50MB
    errorMessages: {
      type: '不支持的音乐文件格式，请使用MP3、WAV、FLAC或OGG格式',
      size: '音乐文件大小不能超过50MB',
    },
  },
  cover: {
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    errorMessages: {
      type: '不支持的图片格式，请使用JPG、PNG或WebP格式',
      size: '图片文件大小不能超过5MB',
    },
  },
}

// 文件上传相关API
export const uploadApi = {
  // 验证文件
  validateFile(file: File, type: 'music' | 'cover'): { valid: boolean; error?: string } {
    const validation = fileValidations[type]

    // 验证文件类型
    if (!validation.allowedTypes.includes(file.type)) {
      return { valid: false, error: validation.errorMessages.type }
    }

    // 验证文件大小
    if (file.size > validation.maxSize) {
      return { valid: false, error: validation.errorMessages.size }
    }

    return { valid: true }
  },

  // 上传音乐文件（带进度）
  async uploadMusic(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    try {
      // 先验证文件
      const validation = this.validateFile(file, 'music')
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传音乐文件失败')
    }
  },

  // 上传封面图片（带进度）
  async uploadCover(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    try {
      // 先验证文件
      const validation = this.validateFile(file, 'cover')
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传封面图片失败')
    }
  },

  // 批量上传音乐文件
  async uploadMultipleMusic(
    files: File[],
    onTotalProgress?: (progress: number) => void,
    onFileProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadResponse[]> {
    try {
      const results: UploadResponse[] = []
      let totalProgress = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 上传单个文件并跟踪进度
        await this.uploadMusic(file, progress => {
          if (onFileProgress) {
            onFileProgress(i, progress)
          }

          // 计算总体进度
          if (onTotalProgress) {
            const fileWeight = 1 / files.length
            const fileContribution = progress * fileWeight
            totalProgress = (i / files.length) * 100 + fileContribution
            onTotalProgress(Math.round(totalProgress))
          }
        }).then(result => {
          results.push(result)
        })
      }

      return results
    } catch (error: any) {
      throw new Error(error.message || '批量上传音乐文件失败')
    }
  },

  // 批量上传封面图片
  async uploadMultipleCovers(
    files: File[],
    onTotalProgress?: (progress: number) => void,
    onFileProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadResponse[]> {
    try {
      const results: UploadResponse[] = []
      let totalProgress = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 上传单个文件并跟踪进度
        await this.uploadCover(file, progress => {
          if (onFileProgress) {
            onFileProgress(i, progress)
          }

          // 计算总体进度
          if (onTotalProgress) {
            const fileWeight = 1 / files.length
            const fileContribution = progress * fileWeight
            totalProgress = (i / files.length) * 100 + fileContribution
            onTotalProgress(Math.round(totalProgress))
          }
        }).then(result => {
          results.push(result)
        })
      }

      return results
    } catch (error: any) {
      throw new Error(error.message || '批量上传封面图片失败')
    }
  },
}
