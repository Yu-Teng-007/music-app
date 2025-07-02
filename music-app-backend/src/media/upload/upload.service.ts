/* eslint-disable no-console */
import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import * as FormData from 'form-data'

@Injectable()
export class UploadService {
  private readonly fileServiceUrl: string

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.fileServiceUrl =
      this.configService.get<string>('fileService.url') || 'http://localhost:3001'
  }

  async uploadMusic(file: any): Promise<{ url: string; filename: string }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的音乐文件')
    }

    // 验证文件类型
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的音乐文件格式')
    }

    // 验证文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException('音乐文件大小不能超过50MB')
    }

    try {
      // 处理文件名编码问题
      const encodedFilename = this.encodeFilename(file.originalname)

      // 创建FormData
      const formData = new FormData()
      formData.append('file', file.buffer, {
        filename: encodedFilename,
        contentType: file.mimetype,
      })
      formData.append('category', 'music')
      formData.append('accessLevel', 'public')

      // 调用file-service API
      const response = await firstValueFrom(
        this.httpService.post(`${this.fileServiceUrl}/api/files/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'X-API-Key': this.configService.get<string>('fileService.apiKey'),
          },
        })
      )

      const fileInfo = response.data.data
      return {
        url: `${this.fileServiceUrl}/files/${fileInfo.id}/preview`,
        filename: fileInfo.filename,
      }
    } catch (error) {
      console.error('上传音乐文件失败:', error)
      throw new BadRequestException('上传音乐文件失败，请重试')
    }
  }

  async uploadCover(file: any): Promise<{ url: string; filename: string }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的封面图片')
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('文件内容为空，请重新选择文件')
    }

    // 验证文件类型
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/x-bmp',
      'image/tiff',
      'image/tif',
      'image/avif',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/heic',
      'image/heif',
    ]
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '不支持的图片格式，请使用 JPG、JPEG、PNG、WebP、BMP、TIFF、AVIF、ICO、HEIC 或 HEIF 格式'
      )
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException('图片文件大小不能超过5MB')
    }

    try {
      // 处理文件名编码问题
      const encodedFilename = this.encodeFilename(file.originalname)

      // 创建FormData
      const formData = new FormData()
      formData.append('file', file.buffer, {
        filename: encodedFilename,
        contentType: file.mimetype,
      })
      formData.append('category', 'images')
      formData.append('accessLevel', 'public')

      // 调用file-service API
      const response = await firstValueFrom(
        this.httpService.post(`${this.fileServiceUrl}/api/files/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'X-API-Key': this.configService.get<string>('fileService.apiKey'),
          },
        })
      )

      const fileInfo = response.data.data

      return {
        url: `${this.fileServiceUrl}/files/${fileInfo.id}/preview`,
        filename: fileInfo.filename,
      }
    } catch (error) {
      console.error('上传封面图片失败:', error.message)
      throw new BadRequestException('上传封面图片失败，请重试')
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // 从URL中提取文件ID
      const fileId = this.extractFileIdFromUrl(fileUrl)
      if (!fileId) {
        console.warn('无法从URL中提取文件ID:', fileUrl)
        return
      }

      // 调用file-service API删除文件
      await firstValueFrom(
        this.httpService.delete(`${this.fileServiceUrl}/files/${fileId}`, {
          headers: {
            'X-API-Key': this.configService.get<string>('fileService.apiKey'),
          },
        })
      )
    } catch (error) {
      console.error('删除文件失败:', error)
    }
  }

  async getFileInfo(fileUrl: string) {
    try {
      // 从URL中提取文件ID
      const fileId = this.extractFileIdFromUrl(fileUrl)
      if (!fileId) {
        console.warn('无法从URL中提取文件ID:', fileUrl)
        return null
      }

      // 调用file-service API获取文件信息
      const response = await firstValueFrom(
        this.httpService.get(`${this.fileServiceUrl}/files/${fileId}`, {
          headers: {
            'X-API-Key': this.configService.get<string>('fileService.apiKey'),
          },
        })
      )

      const fileInfo = response.data.data
      return {
        size: fileInfo.size,
        createdAt: fileInfo.createdAt,
        modifiedAt: fileInfo.updatedAt,
      }
    } catch (error) {
      console.error('获取文件信息失败:', error)
      return null
    }
  }

  /**
   * 从文件URL中提取文件ID
   */
  private extractFileIdFromUrl(url: string): string | null {
    try {
      // 匹配 /files/{id}/preview 或 /files/{id}/download 格式
      const match = url.match(/\/files\/([a-f0-9-]{36})\/(preview|download)/)
      return match ? match[1] : null
    } catch (error) {
      console.error('提取文件ID失败:', error)
      return null
    }
  }

  /**
   * 编码文件名以确保正确传输中文字符
   */
  private encodeFilename(filename: string): string {
    try {
      // 确保文件名使用UTF-8编码
      // 如果文件名已经是正确的UTF-8，直接返回
      if (this.isValidUTF8(filename)) {
        return filename
      }

      // 尝试修复编码问题
      // 先转换为Buffer再转换为UTF-8字符串
      const buffer = Buffer.from(filename, 'latin1')
      const decoded = buffer.toString('utf8')

      // 验证解码结果
      if (this.isValidUTF8(decoded)) {
        return decoded
      }

      // 如果解码失败，返回原始文件名
      return filename
    } catch (error) {
      console.error('文件名编码处理失败:', error)
      return filename
    }
  }

  /**
   * 检查字符串是否为有效的UTF-8编码
   */
  private isValidUTF8(str: string): boolean {
    try {
      // 检查是否包含乱码字符
      const hasGarbledChars = /[\uFFFD\u00C2-\u00C3][\u0080-\u00BF]/.test(str)
      if (hasGarbledChars) {
        return false
      }

      // 检查是否包含中文字符且显示正常
      const hasChinese = /[\u4e00-\u9fff]/.test(str)
      if (hasChinese) {
        // 如果包含中文，检查是否显示正常
        return !str.includes('�') && !str.includes('?')
      }

      return true
    } catch {
      return false
    }
  }
}
