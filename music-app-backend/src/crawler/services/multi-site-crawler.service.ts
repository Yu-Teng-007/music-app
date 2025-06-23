import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Song } from '../../entities/song.entity'
import { CrawlSongDto, CrawlConfigDto } from '../../dto/song.dto'
import { ISiteAdapter, CrawlType, CrawlOptions } from '../interfaces/site-adapter.interface'
import { Ve33Adapter } from '../adapters/ve33-adapter'
import { DuplicateDetectionService } from './duplicate-detection.service'

/**
 * 多网站爬虫结果
 */
export interface MultiSiteCrawlResult {
  success: boolean
  message: string
  totalSites: number
  successfulSites: number
  failedSites: number
  data: {
    totalCrawled: number
    totalAdded: number
    totalSkipped: number
    totalErrors: number
    duplicatesDetected: number
    siteResults: Array<{
      siteName: string
      success: boolean
      crawled: number
      added: number
      skipped: number
      errors: number
      message: string
    }>
    songs: Song[]
  }
  errors: string[]
}

/**
 * 多网站爬虫进度
 */
export interface MultiSiteCrawlProgress {
  status: 'idle' | 'running' | 'completed' | 'error'
  currentSite: string
  completedSites: number
  totalSites: number
  progress: number
  message: string
  startTime?: Date
  endTime?: Date
  siteProgress: Map<
    string,
    {
      status: 'pending' | 'running' | 'completed' | 'error'
      progress: number
      message: string
    }
  >
}

/**
 * 多网站爬虫服务
 */
@Injectable()
export class MultiSiteCrawlerService {
  private readonly logger = new Logger(MultiSiteCrawlerService.name)
  private readonly adapters: Map<string, ISiteAdapter> = new Map()
  private crawlProgress: MultiSiteCrawlProgress = {
    status: 'idle',
    currentSite: '',
    completedSites: 0,
    totalSites: 0,
    progress: 0,
    message: '等待开始',
    siteProgress: new Map(),
  }

  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    private duplicateDetectionService: DuplicateDetectionService
  ) {
    this.initializeAdapters()
  }

  /**
   * 初始化网站适配器
   */
  private initializeAdapters(): void {
    // 注册33ve适配器
    const ve33Adapter = new Ve33Adapter()
    this.adapters.set(ve33Adapter.siteName, ve33Adapter)

    // 这里可以添加更多适配器
    // const otherAdapter = new OtherSiteAdapter()
    // this.adapters.set(otherAdapter.siteName, otherAdapter)

    this.logger.log(`已注册 ${this.adapters.size} 个网站适配器`)
  }

  /**
   * 获取所有可用的网站适配器
   */
  getAvailableAdapters(): Array<{
    siteName: string
    baseUrl: string
    isEnabled: boolean
    supportedTypes: CrawlType[]
  }> {
    return Array.from(this.adapters.values()).map(adapter => ({
      siteName: adapter.siteName,
      baseUrl: adapter.baseUrl,
      isEnabled: adapter.isEnabled,
      supportedTypes: adapter.supportedTypes,
    }))
  }

  /**
   * 获取爬取进度
   */
  getProgress(): MultiSiteCrawlProgress {
    return { ...this.crawlProgress }
  }

  /**
   * 多网站爬取音乐
   */
  async crawlFromMultipleSites(
    config: CrawlConfigDto & {
      sites?: string[] // 指定要爬取的网站，如果为空则爬取所有可用网站
      enableDuplicateDetection?: boolean
      duplicateThreshold?: number
    },
    options?: CrawlOptions
  ): Promise<MultiSiteCrawlResult> {
    if (this.crawlProgress.status === 'running') {
      return {
        success: false,
        message: '多网站爬虫正在运行中，请等待完成后再试',
        totalSites: 0,
        successfulSites: 0,
        failedSites: 0,
        data: {
          totalCrawled: 0,
          totalAdded: 0,
          totalSkipped: 0,
          totalErrors: 0,
          duplicatesDetected: 0,
          siteResults: [],
          songs: [],
        },
        errors: [],
      }
    }

    // 确定要爬取的网站
    const targetSites = config.sites || Array.from(this.adapters.keys())
    const enabledAdapters = targetSites
      .map(siteName => this.adapters.get(siteName))
      .filter((adapter): adapter is ISiteAdapter => adapter !== undefined && adapter.isEnabled)

    if (enabledAdapters.length === 0) {
      return {
        success: false,
        message: '没有可用的网站适配器',
        totalSites: 0,
        successfulSites: 0,
        failedSites: 0,
        data: {
          totalCrawled: 0,
          totalAdded: 0,
          totalSkipped: 0,
          totalErrors: 0,
          duplicatesDetected: 0,
          siteResults: [],
          songs: [],
        },
        errors: ['没有可用的网站适配器'],
      }
    }

    // 初始化进度
    this.initializeProgress(enabledAdapters)

    const result: MultiSiteCrawlResult = {
      success: true,
      message: '',
      totalSites: enabledAdapters.length,
      successfulSites: 0,
      failedSites: 0,
      data: {
        totalCrawled: 0,
        totalAdded: 0,
        totalSkipped: 0,
        totalErrors: 0,
        duplicatesDetected: 0,
        siteResults: [],
        songs: [],
      },
      errors: [],
    }

    try {
      this.crawlProgress.status = 'running'
      this.crawlProgress.startTime = new Date()

      // 并发爬取所有网站
      const crawlPromises = enabledAdapters.map(adapter =>
        this.crawlFromSingleSite(adapter, config, options)
      )

      const siteResults = await Promise.allSettled(crawlPromises)

      // 处理结果
      for (let i = 0; i < siteResults.length; i++) {
        const siteResult = siteResults[i]
        const adapter = enabledAdapters[i]

        if (siteResult.status === 'fulfilled') {
          const crawlResult = siteResult.value
          result.data.siteResults.push({
            siteName: adapter.siteName,
            success: crawlResult.success,
            crawled: crawlResult.songs.length,
            added: 0, // 将在后续处理中更新
            skipped: 0,
            errors: 0,
            message: crawlResult.success ? '爬取成功' : crawlResult.message,
          })

          if (crawlResult.success) {
            result.successfulSites++
            result.data.totalCrawled += crawlResult.songs.length
          } else {
            result.failedSites++
            result.errors.push(`${adapter.siteName}: ${crawlResult.message}`)
          }
        } else {
          result.failedSites++
          result.data.siteResults.push({
            siteName: adapter.siteName,
            success: false,
            crawled: 0,
            added: 0,
            skipped: 0,
            errors: 1,
            message: siteResult.reason?.message || '未知错误',
          })
          result.errors.push(`${adapter.siteName}: ${siteResult.reason?.message || '未知错误'}`)
        }

        this.updateSiteProgress(adapter.siteName, 'completed', 100, '爬取完成')
        this.crawlProgress.completedSites++
        this.updateOverallProgress()
      }

      // 合并所有爬取的歌曲
      const allCrawledSongs: CrawlSongDto[] = []
      for (const siteResult of siteResults) {
        if (siteResult.status === 'fulfilled' && siteResult.value.success) {
          allCrawledSongs.push(...siteResult.value.songs)
        }
      }

      // 智能去重处理
      if (config.enableDuplicateDetection && allCrawledSongs.length > 0) {
        this.updateOverallProgress('正在进行智能去重...')
        const duplicateResults = await this.duplicateDetectionService.batchDetectDuplicates(
          allCrawledSongs,
          { fuzzyMatchThreshold: config.duplicateThreshold || 0.8 }
        )
        result.data.duplicatesDetected = duplicateResults.size
      }

      // 保存到数据库
      this.updateOverallProgress('正在保存到数据库...')
      const savedSongs = await this.saveSongsToDatabase(allCrawledSongs)
      result.data.songs = savedSongs
      result.data.totalAdded = savedSongs.length

      // 更新网站结果统计（已在上面处理）

      this.crawlProgress.status = 'completed'
      this.crawlProgress.endTime = new Date()
      this.crawlProgress.progress = 100
      this.crawlProgress.message = `多网站爬取完成，共处理 ${result.data.totalCrawled} 首歌曲，添加 ${result.data.totalAdded} 首`

      result.message = this.crawlProgress.message
      return result
    } catch (error) {
      this.logger.error('多网站爬取失败', error)
      this.crawlProgress.status = 'error'
      this.crawlProgress.endTime = new Date()
      this.crawlProgress.message = `多网站爬取失败: ${error.message}`

      result.success = false
      result.message = this.crawlProgress.message
      result.errors.push(error.message)
      return result
    }
  }

  /**
   * 从单个网站爬取音乐
   */
  private async crawlFromSingleSite(
    adapter: ISiteAdapter,
    config: CrawlConfigDto,
    options?: CrawlOptions
  ): Promise<{ success: boolean; message: string; songs: CrawlSongDto[] }> {
    try {
      this.updateSiteProgress(adapter.siteName, 'running', 0, '开始爬取...')
      this.crawlProgress.currentSite = adapter.siteName

      let songs: CrawlSongDto[] = []

      // 根据配置的类型进行爬取
      switch (config.type) {
        case 'recommended':
          if (adapter.supportedTypes.includes(CrawlType.RECOMMENDED)) {
            songs = await adapter.crawlRecommended(config.limit || 20, options)
          }
          break
        case 'popular':
          if (adapter.supportedTypes.includes(CrawlType.POPULAR)) {
            songs = await adapter.crawlPopular(config.limit || 20, options)
          }
          break
        case 'latest':
          if (adapter.supportedTypes.includes(CrawlType.LATEST)) {
            songs = await adapter.crawlLatest(config.limit || 20, options)
          }
          break
        default:
          // 默认爬取推荐音乐
          if (adapter.supportedTypes.includes(CrawlType.RECOMMENDED)) {
            songs = await adapter.crawlRecommended(config.limit || 20, options)
          }
      }

      this.updateSiteProgress(adapter.siteName, 'completed', 100, `成功爬取 ${songs.length} 首歌曲`)

      return {
        success: true,
        message: `成功爬取 ${songs.length} 首歌曲`,
        songs,
      }
    } catch (error) {
      this.logger.error(`从 ${adapter.siteName} 爬取失败`, error)
      this.updateSiteProgress(adapter.siteName, 'error', 0, `爬取失败: ${error.message}`)

      return {
        success: false,
        message: error.message,
        songs: [],
      }
    }
  }

  /**
   * 保存歌曲到数据库
   */
  private async saveSongsToDatabase(songs: CrawlSongDto[]): Promise<Song[]> {
    const savedSongs: Song[] = []

    for (const crawledSong of songs) {
      try {
        // 检查歌曲是否已存在
        const existingSong = await this.songRepository.findOne({
          where: [
            { title: crawledSong.title, artist: crawledSong.artist },
            { sourceId: crawledSong.sourceId },
          ].filter(condition => Object.values(condition).every(value => value)),
        })

        if (!existingSong) {
          // 创建新歌曲
          const newSong = this.songRepository.create({
            title: crawledSong.title,
            artist: crawledSong.artist,
            album: crawledSong.album || '未知专辑',
            duration: crawledSong.duration || 0,
            coverUrl: crawledSong.coverUrl || '/default-cover.jpg',
            audioUrl: crawledSong.audioUrl || '',
            genre: crawledSong.genre,
            year: crawledSong.year,
            lyrics: crawledSong.lyrics,
            fileSize: crawledSong.fileSize,
            originalFileName: `${crawledSong.title}-${crawledSong.artist}.mp3`,
            sourceId: crawledSong.sourceId,
            sourceUrl: crawledSong.sourceUrl,
          })

          const savedSong = await this.songRepository.save(newSong)
          savedSongs.push(savedSong)
        }
      } catch (error) {
        this.logger.error(`保存歌曲失败: ${crawledSong.title} - ${crawledSong.artist}`, error)
      }
    }

    return savedSongs
  }

  /**
   * 初始化进度
   */
  private initializeProgress(adapters: ISiteAdapter[]): void {
    this.crawlProgress = {
      status: 'running',
      currentSite: '',
      completedSites: 0,
      totalSites: adapters.length,
      progress: 0,
      message: '开始多网站爬取...',
      startTime: new Date(),
      siteProgress: new Map(),
    }

    // 初始化每个网站的进度
    for (const adapter of adapters) {
      this.crawlProgress.siteProgress.set(adapter.siteName, {
        status: 'pending',
        progress: 0,
        message: '等待开始',
      })
    }
  }

  /**
   * 更新网站进度
   */
  private updateSiteProgress(
    siteName: string,
    status: 'pending' | 'running' | 'completed' | 'error',
    progress: number,
    message: string
  ): void {
    this.crawlProgress.siteProgress.set(siteName, {
      status,
      progress,
      message,
    })
  }

  /**
   * 更新总体进度
   */
  private updateOverallProgress(message?: string): void {
    const totalSites = this.crawlProgress.totalSites
    const completedSites = this.crawlProgress.completedSites

    this.crawlProgress.progress =
      totalSites > 0 ? Math.round((completedSites / totalSites) * 100) : 0

    if (message) {
      this.crawlProgress.message = message
    } else {
      this.crawlProgress.message = `正在处理 ${completedSites}/${totalSites} 个网站...`
    }
  }

  /**
   * 重置进度
   */
  resetProgress(): void {
    this.crawlProgress = {
      status: 'idle',
      currentSite: '',
      completedSites: 0,
      totalSites: 0,
      progress: 0,
      message: '等待开始',
      siteProgress: new Map(),
    }
  }

  /**
   * 停止爬取
   */
  stopCrawling(): boolean {
    if (this.crawlProgress.status === 'running') {
      this.crawlProgress.status = 'error'
      this.crawlProgress.message = '用户手动停止'
      this.crawlProgress.endTime = new Date()
      return true
    }
    return false
  }

  /**
   * 测试所有网站连接
   */
  async testAllConnections(): Promise<
    Array<{
      siteName: string
      success: boolean
      responseTime: number
      error?: string
    }>
  > {
    const results: Array<{
      siteName: string
      success: boolean
      responseTime: number
      error?: string
    }> = []

    for (const adapter of this.adapters.values()) {
      try {
        const testResult = await adapter.testConnection()
        results.push({
          siteName: adapter.siteName,
          success: testResult.success,
          responseTime: testResult.responseTime,
          error: testResult.error,
        })
      } catch (error) {
        results.push({
          siteName: adapter.siteName,
          success: false,
          responseTime: 0,
          error: error.message,
        })
      }
    }

    return results
  }
}
