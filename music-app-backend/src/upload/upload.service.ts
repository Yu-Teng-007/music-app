import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  uploadMusic(file: Express.Multer.File): { url: string; filename: string } {
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

    const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads'
    const musicDir = path.join(uploadDir, 'music')

    // 确保目录存在
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true })
    }

    // 生成唯一文件名
    const fileExtension = extname(file.originalname)
    const filename = `${uuidv4()}${fileExtension}`
    const filePath = path.join(musicDir, filename)

    // 保存文件
    fs.writeFileSync(filePath, file.buffer)

    return {
      url: `/uploads/music/${filename}`,
      filename,
    }
  }

  uploadCover(file: Express.Multer.File): { url: string; filename: string } {
    if (!file) {
      throw new BadRequestException('请选择要上传的封面图片')
    }

    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的图片格式，请使用 JPG、PNG 或 WebP 格式')
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException('图片文件大小不能超过5MB')
    }

    const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads'
    const coversDir = path.join(uploadDir, 'covers')

    // 确保目录存在
    if (!fs.existsSync(coversDir)) {
      fs.mkdirSync(coversDir, { recursive: true })
    }

    // 生成唯一文件名
    const fileExtension = extname(file.originalname)
    const filename = `${uuidv4()}${fileExtension}`
    const filePath = path.join(coversDir, filename)

    // 保存文件
    fs.writeFileSync(filePath, file.buffer)

    return {
      url: `/uploads/covers/${filename}`,
      filename,
    }
  }

  deleteFile(filePath: string): void {
    try {
      const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads'
      const fullPath = path.join(uploadDir, filePath.replace('/uploads/', ''))

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('删除文件失败:', error)
    }
  }

  getFileInfo(filePath: string) {
    try {
      const uploadDir = this.configService.get<string>('app.uploadDir') || './uploads'
      const fullPath = path.join(uploadDir, filePath.replace('/uploads/', ''))

      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        return {
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        }
      }
      return null
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('获取文件信息失败:', error)
      return null
    }
  }
}
