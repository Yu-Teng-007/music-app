import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as crypto from 'crypto'
import { Download, DownloadStatus, AudioQuality, Song, User, UserStorage } from '../entities'
import {
  CreateDownloadDto,
  UpdateDownloadDto,
  DownloadQueryDto,
  BatchDownloadDto,
  StorageStatsDto,
  CleanupOptionsDto,
} from '../dto'

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
    private readonly configService: ConfigService,
  ) {
    this.downloadDir = this.configService.get<string>('DOWNLOAD_DIR', './downloads')
    this.ensureDownloadDir()
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
    this.startDownload(savedDownload.id)

    return savedDownload
  }

  // 批量创建下载任务
  async createBatchDownload(batchDownloadDto: BatchDownloadDto, userId: string): Promise<Download[]> {
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
    const { page = 1, limit = 20, status, quality, sortBy = 'createdAt', sortOrder = 'DESC' } = query
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
  async updateDownload(downloadId: string, updateDownloadDto: UpdateDownloadDto, userId: string): Promise<Download> {
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
    const download = await this.updateDownload(downloadId, { status: DownloadStatus.DOWNLOADING }, userId)
    this.startDownload(downloadId)
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
      userId,
    )
    this.startDownload(downloadId)
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
  async cleanupDownloads(userId: string, options: CleanupOptionsDto = {}): Promise<{ cleaned: number; freedSpace: number }> {
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
  private async updateUserStorage(userId: string, sizeChange: number, countChange: number): Promise<void> {
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

  // 开始下载（模拟）
  private async startDownload(downloadId: string): Promise<void> {
    // 这里应该实现实际的下载逻辑
    // 为了演示，我们模拟一个下载过程
    console.log(`开始下载任务: ${downloadId}`)
    
    // 实际实现中，这里应该：
    // 1. 从音乐源获取音频文件
    // 2. 根据质量设置进行转码
    // 3. 保存到本地文件系统
    // 4. 更新下载进度
    // 5. 处理下载错误
  }
}
