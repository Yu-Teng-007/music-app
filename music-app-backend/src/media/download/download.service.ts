/* eslint-disable no-console */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'
import axios from 'axios'
import { Download, DownloadStatus, AudioQuality, Song, User, UserStorage } from '../../entities'
import {
  CreateDownloadDto,
  UpdateDownloadDto,
  DownloadQueryDto,
  BatchDownloadDto,
  StorageStatsDto,
  CleanupOptionsDto,
} from '../../dto'

@Injectable()
export class DownloadService {
  private readonly downloadDir: string

  constructor(
    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserStorage)
    private readonly userStorageRepository: Repository<UserStorage>,
    private readonly configService: ConfigService
  ) {
    this.downloadDir = this.configService.get<string>('DOWNLOAD_DIR', './downloads')
    void this.ensureDownloadDir()
  }

  // 确保下载目录存在
  private async ensureDownloadDir() {
    try {
      await fs.access(this.downloadDir)
    } catch {
      await fs.mkdir(this.downloadDir, { recursive: true })
    }
  }

  // 创建下载任务
  async createDownload(createDownloadDto: CreateDownloadDto, userId: string): Promise<Download> {
    const { songId, quality } = createDownloadDto

    // 检查歌曲是否存在
    const song = await this.songRepository.findOne({ where: { id: songId } })
    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    // 检查是否已经下载过
    const existingDownload = await this.downloadRepository.findOne({
      where: { userId, songId, quality },
    })
    if (existingDownload && existingDownload.status === DownloadStatus.COMPLETED) {
      throw new BadRequestException('该歌曲已经下载过')
    }

    // 检查用户存储空间
    const userStorage = await this.getUserStorage(userId)
    const estimatedSize = this.getEstimatedFileSize(song.duration, quality)

    if (!userStorage.canDownload(estimatedSize)) {
      throw new BadRequestException('存储空间不足或下载数量超限')
    }

    // 如果存在未完成的下载，删除它
    if (existingDownload) {
      await this.downloadRepository.remove(existingDownload)
    }

    // 创建新的下载任务
    const download = this.downloadRepository.create({
      userId,
      songId,
      quality,
      status: DownloadStatus.PENDING,
      fileSize: estimatedSize,
    })

    const savedDownload = await this.downloadRepository.save(download)

    // 开始下载
    void this.startDownload(savedDownload.id)

    return savedDownload
  }

  // 批量创建下载任务
  async createBatchDownload(
    batchDownloadDto: BatchDownloadDto,
    userId: string
  ): Promise<Download[]> {
    const { songIds, quality } = batchDownloadDto
    const downloads: Download[] = []

    for (const songId of songIds) {
      try {
        const download = await this.createDownload({ songId, quality }, userId)
        downloads.push(download)
      } catch (error) {
        console.error(`创建下载任务失败 (songId: ${songId}):`, error.message)
      }
    }

    return downloads
  }

  // 获取下载列表
  async getDownloads(query: DownloadQueryDto, userId: string) {
    const {
      page = 1,
      limit = 20,
      status,
      quality,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query
    const skip = (page - 1) * limit

    let queryBuilder = this.downloadRepository
      .createQueryBuilder('download')
      .leftJoinAndSelect('download.song', 'song')
      .where('download.userId = :userId', { userId })
      .andWhere('download.isActive = :isActive', { isActive: true })

    if (status) {
      queryBuilder = queryBuilder.andWhere('download.status = :status', { status })
    }

    if (quality) {
      queryBuilder = queryBuilder.andWhere('download.quality = :quality', { quality })
    }

    const [downloads, total] = await queryBuilder
      .orderBy(`download.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data: downloads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 获取下载详情
  async getDownload(downloadId: string, userId: string): Promise<Download> {
    const download = await this.downloadRepository.findOne({
      where: { id: downloadId, userId },
      relations: ['song'],
    })

    if (!download) {
      throw new NotFoundException('下载任务不存在')
    }

    return download
  }

  // 更新下载任务
  async updateDownload(
    downloadId: string,
    updateDownloadDto: UpdateDownloadDto,
    userId: string
  ): Promise<Download> {
    const download = await this.getDownload(downloadId, userId)

    Object.assign(download, updateDownloadDto)

    if (updateDownloadDto.status === DownloadStatus.COMPLETED) {
      download.completedAt = new Date()
      // 更新用户存储统计
      await this.updateUserStorage(userId, download.fileSize, 1)
    }

    return await this.downloadRepository.save(download)
  }

  // 删除下载任务
  async deleteDownload(downloadId: string, userId: string): Promise<void> {
    const download = await this.getDownload(downloadId, userId)

    // 删除本地文件
    if (download.localPath) {
      try {
        await fs.unlink(download.localPath)
      } catch (error) {
        console.error('删除本地文件失败:', error)
      }
    }

    // 更新用户存储统计
    if (download.status === DownloadStatus.COMPLETED) {
      await this.updateUserStorage(userId, -download.fileSize, -1)
    }

    await this.downloadRepository.remove(download)
  }

  // 暂停下载
  async pauseDownload(downloadId: string, userId: string): Promise<Download> {
    return await this.updateDownload(downloadId, { status: DownloadStatus.PAUSED }, userId)
  }

  // 恢复下载
  async resumeDownload(downloadId: string, userId: string): Promise<Download> {
    const download = await this.updateDownload(
      downloadId,
      { status: DownloadStatus.DOWNLOADING },
      userId
    )
    void this.startDownload(downloadId)
    return download
  }

  // 重试下载
  async retryDownload(downloadId: string, userId: string): Promise<Download> {
    const download = await this.updateDownload(
      downloadId,
      {
        status: DownloadStatus.PENDING,
        progress: 0,
        downloadedSize: 0,
        errorMessage: null,
      },
      userId
    )
    void this.startDownload(downloadId)
    return download
  }

  // 获取用户存储统计
  async getStorageStats(userId: string): Promise<StorageStatsDto> {
    const userStorage = await this.getUserStorage(userId)

    return {
      usedSpace: userStorage.usedSpace,
      totalSpace: userStorage.totalSpace,
      availableSpace: userStorage.getAvailableSpace(),
      usagePercentage: userStorage.getUsagePercentage(),
      downloadCount: userStorage.downloadCount,
      maxDownloads: userStorage.maxDownloads,
    }
  }

  // 清理下载文件
  async cleanupDownloads(
    userId: string,
    options: CleanupOptionsDto = {}
  ): Promise<{ cleaned: number; freedSpace: number }> {
    const { days = 30, cleanupFailed = true, cleanupUnused = false, force = false } = options

    const userStorage = await this.getUserStorage(userId)
    if (!force && !userStorage.autoCleanup) {
      throw new BadRequestException('用户未启用自动清理')
    }

    let queryBuilder = this.downloadRepository
      .createQueryBuilder('download')
      .where('download.userId = :userId', { userId })
      .andWhere('download.isActive = :isActive', { isActive: true })

    const conditions = []

    if (cleanupFailed) {
      conditions.push('download.status = :failedStatus')
    }

    if (cleanupUnused) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      conditions.push('(download.lastAccessedAt IS NULL OR download.lastAccessedAt < :cutoffDate)')
      queryBuilder = queryBuilder.setParameter('cutoffDate', cutoffDate)
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.andWhere(`(${conditions.join(' OR ')})`)
      if (cleanupFailed) {
        queryBuilder = queryBuilder.setParameter('failedStatus', DownloadStatus.FAILED)
      }
    }

    const downloadsToClean = await queryBuilder.getMany()

    let cleaned = 0
    let freedSpace = 0

    for (const download of downloadsToClean) {
      try {
        if (download.localPath) {
          await fs.unlink(download.localPath)
          freedSpace += download.fileSize
        }
        await this.downloadRepository.remove(download)
        cleaned++
      } catch (error) {
        console.error(`清理下载文件失败 (${download.id}):`, error)
      }
    }

    // 更新用户存储统计
    if (freedSpace > 0) {
      await this.updateUserStorage(userId, -freedSpace, -cleaned)
    }

    // 更新最后清理时间
    userStorage.lastCleanupAt = new Date()
    await this.userStorageRepository.save(userStorage)

    return { cleaned, freedSpace }
  }

  // 私有方法

  // 获取用户存储信息
  private async getUserStorage(userId: string): Promise<UserStorage> {
    let userStorage = await this.userStorageRepository.findOne({ where: { userId } })

    if (!userStorage) {
      userStorage = this.userStorageRepository.create({ userId })
      userStorage = await this.userStorageRepository.save(userStorage)
    }

    return userStorage
  }

  // 更新用户存储统计
  private async updateUserStorage(
    userId: string,
    sizeChange: number,
    countChange: number
  ): Promise<void> {
    const userStorage = await this.getUserStorage(userId)
    userStorage.usedSpace = Math.max(0, userStorage.usedSpace + sizeChange)
    userStorage.downloadCount = Math.max(0, userStorage.downloadCount + countChange)
    await this.userStorageRepository.save(userStorage)
  }

  // 估算文件大小
  private getEstimatedFileSize(duration: number, quality: AudioQuality): number {
    const bitrates = {
      [AudioQuality.LOW]: 64,
      [AudioQuality.MEDIUM]: 128,
      [AudioQuality.HIGH]: 320,
      [AudioQuality.LOSSLESS]: 1411,
    }

    const bitrate = bitrates[quality] || 128
    return Math.ceil((duration * bitrate * 1000) / 8) // 字节
  }

  // 开始下载
  private async startDownload(downloadId: string): Promise<void> {
    let download: Download | null = null

    try {
      // 获取下载任务
      download = await this.downloadRepository.findOne({
        where: { id: downloadId },
        relations: ['song'],
      })

      if (!download) {
        throw new Error('下载任务不存在')
      }

      if (
        download.status !== DownloadStatus.PENDING &&
        download.status !== DownloadStatus.DOWNLOADING
      ) {
        return // 任务已完成或已暂停
      }

      // 更新状态为下载中
      await this.updateDownloadStatus(downloadId, {
        status: DownloadStatus.DOWNLOADING,
        startedAt: new Date(),
        errorMessage: null,
      })

      // 生成本地文件路径
      const localPath = await this.generateLocalPath(download)

      // 开始下载文件
      await this.downloadFile(download, localPath)

      // 下载完成，更新状态
      await this.updateDownloadStatus(downloadId, {
        status: DownloadStatus.COMPLETED,
        localPath,
        completedAt: new Date(),
        progress: 100,
        downloadedSize: download.fileSize,
      })

      // 更新用户存储统计
      await this.updateUserStorage(download.userId, download.fileSize, 1)
    } catch (error) {
      console.error(`下载任务失败 (${downloadId}):`, error.message)

      // 更新状态为失败
      if (download) {
        await this.updateDownloadStatus(downloadId, {
          status: DownloadStatus.FAILED,
          errorMessage: error.message || '下载失败',
        })
      }
    }
  }

  // 更新下载状态的辅助方法
  private async updateDownloadStatus(
    downloadId: string,
    updates: Partial<Download>
  ): Promise<void> {
    await this.downloadRepository.update(downloadId, updates)
  }

  // 生成本地文件路径
  private async generateLocalPath(download: Download): Promise<string> {
    const song = download.song
    const quality = download.quality

    // 创建用户专属目录
    const userDir = path.join(this.downloadDir, download.userId)
    await fs.mkdir(userDir, { recursive: true })

    // 生成安全的文件名
    const safeTitle = this.sanitizeFilename(song.title)
    const safeArtist = this.sanitizeFilename(song.artist)
    const extension = this.getFileExtension(quality)

    const filename = `${safeArtist} - ${safeTitle}_${quality}${extension}`
    return path.join(userDir, filename)
  }

  // 清理文件名中的非法字符
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_') // 替换非法字符
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim()
      .substring(0, 100) // 限制长度
  }

  // 根据音质获取文件扩展名
  private getFileExtension(quality: AudioQuality): string {
    switch (quality) {
      case AudioQuality.LOSSLESS:
        return '.flac'
      default:
        return '.mp3'
    }
  }

  // 下载文件的核心方法
  private async downloadFile(download: Download, localPath: string): Promise<void> {
    const song = download.song
    const sourceUrl = song.audioUrl || song.sourceUrl

    if (!sourceUrl) {
      throw new Error('歌曲源地址不存在')
    }

    // 检查是否需要转码
    if (download.quality !== AudioQuality.MEDIUM) {
      // 对于非标准音质，需要下载原文件后进行转码
      await this.downloadAndConvert(download, sourceUrl, localPath)
    } else {
      // 直接下载原文件
      await this.downloadDirectly(download, sourceUrl, localPath)
    }
  }

  // 直接下载文件
  private async downloadDirectly(
    download: Download,
    sourceUrl: string,
    localPath: string
  ): Promise<void> {
    try {
      const response = await axios({
        method: 'GET',
        url: sourceUrl,
        responseType: 'stream',
        timeout: 30000, // 30秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      const totalSize = parseInt(response.headers['content-length'] || '0', 10)
      let downloadedSize = 0

      // 创建写入流
      const writer = await fs.open(localPath, 'w')
      const writeStream = writer.createWriteStream()

      // 监听下载进度
      response.data.on('data', async (chunk: Buffer) => {
        downloadedSize += chunk.length
        const progress = totalSize > 0 ? Math.round((downloadedSize / totalSize) * 100) : 0

        // 更新下载进度
        await this.updateDownloadStatus(download.id, {
          downloadedSize,
          progress,
        })
      })

      // 处理下载完成
      return new Promise<void>((resolve, reject) => {
        response.data.pipe(writeStream)

        writeStream.on('finish', () => {
          writer
            .close()
            .then(async () => {
              try {
                // 验证文件大小
                const stats = await fs.stat(localPath)
                if (totalSize > 0 && Math.abs(stats.size - totalSize) > 1024) {
                  reject(new Error('下载文件大小不匹配'))
                  return
                }
                resolve()
              } catch (error) {
                reject(error instanceof Error ? error : new Error(String(error)))
              }
            })
            .catch(reject)
        })

        writeStream.on('error', (error: Error) => {
          writer
            .close()
            .then(async () => {
              // 删除不完整的文件
              try {
                await fs.unlink(localPath)
              } catch (cleanupError) {
                // 忽略清理错误
              }
              reject(error)
            })
            .catch(reject)
        })

        response.data.on('error', (error: Error) => {
          writer
            .close()
            .then(async () => {
              try {
                await fs.unlink(localPath)
              } catch (cleanupError) {
                // 忽略清理错误
              }
              reject(error)
            })
            .catch(reject)
        })
      })
    } catch (error) {
      // 清理可能创建的文件
      try {
        await fs.unlink(localPath)
      } catch (cleanupError) {
        // 忽略清理错误
      }
      throw new Error(`下载失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 下载并转码（模拟实现）
  private async downloadAndConvert(
    download: Download,
    sourceUrl: string,
    localPath: string
  ): Promise<void> {
    // 首先下载原文件到临时位置
    const tempPath = `${localPath}.tmp`

    try {
      // 下载原文件
      await this.downloadDirectly(download, sourceUrl, tempPath)

      // 模拟转码过程
      await this.convertAudio(tempPath, localPath, download.quality)

      // 删除临时文件
      await fs.unlink(tempPath)
    } catch (error) {
      // 清理临时文件
      try {
        await fs.unlink(tempPath)
        await fs.unlink(localPath)
      } catch (cleanupError) {
        // 忽略清理错误
      }
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  // 音频转码（模拟实现）
  private async convertAudio(
    inputPath: string,
    outputPath: string,
    quality: AudioQuality
  ): Promise<void> {
    // 这里应该使用 FFmpeg 或其他音频处理库进行实际转码
    // 为了演示，我们只是复制文件并模拟转码过程

    try {
      // 模拟转码延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 简单复制文件（实际应该进行音频转码）
      await fs.copyFile(inputPath, outputPath)

      // 根据音质调整文件大小（模拟）
      const stats = await fs.stat(outputPath)
      const qualityMultiplier = this.getQualityMultiplier(quality)
      const estimatedSize = Math.round(stats.size * qualityMultiplier)

      // 更新实际文件大小
      await this.downloadRepository.update({ localPath: outputPath }, { fileSize: estimatedSize })
    } catch (error) {
      throw new Error(`音频转码失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // 获取音质转换倍数
  private getQualityMultiplier(quality: AudioQuality): number {
    switch (quality) {
      case AudioQuality.LOW:
        return 0.5
      case AudioQuality.MEDIUM:
        return 1.0
      case AudioQuality.HIGH:
        return 2.5
      case AudioQuality.LOSSLESS:
        return 11.0
      default:
        return 1.0
    }
  }
}
