import { apiClient } from './http'
import type { UploadResponse } from './types'

// 文件上传相关API
export const uploadApi = {
  // 上传音乐文件
  async uploadMusic(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传音乐文件失败')
    }
  },

  // 上传封面图片
  async uploadCover(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传封面图片失败')
    }
  },
}
