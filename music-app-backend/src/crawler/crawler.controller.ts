import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common'
import { MusicCrawlerService, CrawlResult, CrawlProgress } from './music-crawler.service'
import { MultiSiteCrawlerService } from './services/multi-site-crawler.service'
import { DuplicateDetectionService } from './services/duplicate-detection.service'
import { CrawlConfigDto } from '../dto/song.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('crawler')
// @UseGuards(JwtAuthGuard) // 临时禁用认证以便测试
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name)

  constructor(
    private readonly crawlerService: MusicCrawlerService,
    private readonly multiSiteCrawlerService: MultiSiteCrawlerService,
    private readonly duplicateDetectionService: DuplicateDetectionService
  ) {}

  /**
   * 开始爬取音乐数据
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startCrawling(@Body() config: CrawlConfigDto): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    try {
      this.logger.log('收到爬取请求', config)

      // 验证配置
      if (config.limit && (config.limit < 1 || config.limit > 100)) {
        throw new BadRequestException('爬取数量必须在1-100之间')
      }

      const result: CrawlResult = await this.crawlerService.crawlMusic(config)

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      }
    } catch (error) {
      this.logger.error('爬取请求处理失败', error)
      return {
        success: false,
        message: (error as Error).message || '爬取请求处理失败',
      }
    }
  }

  /**
   * 获取爬取进度
   */
  @Get('progress')
  async getProgress(): Promise<{
    success: boolean
    data: CrawlProgress
  }> {
    try {
      const progress = this.crawlerService.getProgress()
      return {
        success: true,
        data: progress,
      }
    } catch (error) {
      this.logger.error('获取爬取进度失败', error)
      return {
        success: false,
        data: {
          status: 'error',
          progress: 0,
          total: 0,
          current: 0,
          message: '获取进度失败',
        },
      }
    }
  }

  /**
   * 停止爬取
   */
  @Post('stop')
  @HttpCode(HttpStatus.OK)
  async stopCrawling(): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const stopped = this.crawlerService.stopCrawling()
      return {
        success: true,
        message: stopped ? '爬取已停止' : '当前没有正在运行的爬取任务',
      }
    } catch (error) {
      this.logger.error('停止爬取失败', error)
      return {
        success: false,
        message: '停止爬取失败',
      }
    }
  }

  /**
   * 重置爬取进度
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetProgress(): Promise<{
    success: boolean
    message: string
  }> {
    try {
      this.crawlerService.resetProgress()
      return {
        success: true,
        message: '爬取进度已重置',
      }
    } catch (error) {
      this.logger.error('重置爬取进度失败', error)
      return {
        success: false,
        message: '重置爬取进度失败',
      }
    }
  }

  /**
   * 获取爬取配置选项
   */
  @Get('config')
  async getConfig(): Promise<{
    success: boolean
    data: {
      types: Array<{ value: string; label: string }>
      limits: Array<{ value: number; label: string }>
      genres: Array<{ value: string; label: string }>
    }
  }> {
    return {
      success: true,
      data: {
        types: [
          { value: 'recommended', label: '推荐音乐' },
          { value: 'popular', label: '热门音乐' },
          { value: 'latest', label: '最新音乐' },
        ],
        limits: [
          { value: 10, label: '10首' },
          { value: 20, label: '20首' },
          { value: 50, label: '50首' },
          { value: 100, label: '100首' },
        ],
        genres: [
          { value: '流行', label: '流行' },
          { value: '摇滚', label: '摇滚' },
          { value: '民谣', label: '民谣' },
          { value: '电子', label: '电子' },
          { value: '古典', label: '古典' },
          { value: '爵士', label: '爵士' },
          { value: '说唱', label: '说唱' },
          { value: '乡村', label: '乡村' },
        ],
      },
    }
  }

  /**
   * 获取爬取统计信息
   */
  @Get('stats')
  async getStats(): Promise<{
    success: boolean
    data: {
      totalCrawled: number
      lastCrawlTime?: Date
      averageSuccessRate: number
      recentCrawls: Array<{
        date: Date
        type: string
        total: number
        added: number
        skipped: number
        errors: number
      }>
    }
  }> {
    // 这里可以实现统计逻辑，暂时返回模拟数据
    return {
      success: true,
      data: {
        totalCrawled: 0,
        lastCrawlTime: undefined,
        averageSuccessRate: 0,
        recentCrawls: [],
      },
    }
  }

  /**
   * 测试爬虫连接
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(): Promise<{
    success: boolean
    message: string
    data?: {
      responseTime: number
      statusCode: number
      accessible: boolean
    }
  }> {
    try {
      const startTime = Date.now()

      // 这里可以实现连接测试逻辑
      // 暂时返回模拟结果
      const responseTime = Date.now() - startTime

      return {
        success: true,
        message: '连接测试成功',
        data: {
          responseTime,
          statusCode: 200,
          accessible: true,
        },
      }
    } catch (error) {
      this.logger.error('连接测试失败', error)
      return {
        success: false,
        message: '连接测试失败',
        data: {
          responseTime: 0,
          statusCode: 0,
          accessible: false,
        },
      }
    }
  }

  /**
   * 获取可用的网站适配器
   */
  @Get('adapters')
  async getAdapters(): Promise<{
    success: boolean
    data: Array<{
      siteName: string
      baseUrl: string
      isEnabled: boolean
      supportedTypes: string[]
    }>
  }> {
    try {
      const adapters = this.multiSiteCrawlerService.getAvailableAdapters()
      return {
        success: true,
        data: adapters,
      }
    } catch (error) {
      this.logger.error('获取网站适配器失败', error)
      return {
        success: false,
        data: [],
      }
    }
  }

  /**
   * 多网站爬取
   */
  @Post('multi-site')
  @HttpCode(HttpStatus.OK)
  async multiSiteCrawl(
    @Body()
    config: CrawlConfigDto & {
      sites?: string[]
      enableDuplicateDetection?: boolean
      duplicateThreshold?: number
    }
  ): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    try {
      this.logger.log('收到多网站爬取请求', config)

      const result = await this.multiSiteCrawlerService.crawlFromMultipleSites(config)

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      }
    } catch (error) {
      this.logger.error('多网站爬取失败', error)
      return {
        success: false,
        message: (error as Error).message || '多网站爬取失败',
      }
    }
  }

  /**
   * 获取多网站爬取进度
   */
  @Get('multi-site/progress')
  async getMultiSiteProgress(): Promise<{
    success: boolean
    data: any
  }> {
    try {
      const progress = this.multiSiteCrawlerService.getProgress()
      return {
        success: true,
        data: progress,
      }
    } catch (error) {
      this.logger.error('获取多网站爬取进度失败', error)
      return {
        success: false,
        data: {
          status: 'error',
          message: '获取进度失败',
        },
      }
    }
  }

  /**
   * 获取重复检测统计
   */
  @Get('duplicate-stats')
  async getDuplicateStats(): Promise<{
    success: boolean
    data: any
  }> {
    try {
      const stats = await this.duplicateDetectionService.getDuplicateStats()
      return {
        success: true,
        data: stats,
      }
    } catch (error) {
      this.logger.error('获取重复检测统计失败', error)
      return {
        success: false,
        data: {
          totalSongs: 0,
          potentialDuplicates: 0,
          duplicateGroups: [],
        },
      }
    }
  }

  /**
   * 清理重复歌曲
   */
  @Post('cleanup-duplicates')
  @HttpCode(HttpStatus.OK)
  async cleanupDuplicates(@Body() options: { dryRun?: boolean; threshold?: number }): Promise<{
    success: boolean
    message: string
    data?: any
  }> {
    try {
      const result = await this.duplicateDetectionService.cleanupDuplicates(
        options.dryRun !== false, // 默认为试运行
        { fuzzyMatchThreshold: options.threshold || 0.8 }
      )

      return {
        success: true,
        message: `清理完成，发现 ${result.duplicatesFound} 个重复，${options.dryRun !== false ? '模拟' : '实际'}删除 ${result.duplicatesRemoved} 个`,
        data: result,
      }
    } catch (error) {
      this.logger.error('清理重复歌曲失败', error)
      return {
        success: false,
        message: '清理重复歌曲失败',
      }
    }
  }

  /**
   * 测试所有网站连接
   */
  @Post('test-all-connections')
  @HttpCode(HttpStatus.OK)
  async testAllConnections(): Promise<{
    success: boolean
    data: Array<{
      siteName: string
      success: boolean
      responseTime: number
      error?: string
    }>
  }> {
    try {
      const results = await this.multiSiteCrawlerService.testAllConnections()
      return {
        success: true,
        data: results,
      }
    } catch (error) {
      this.logger.error('测试所有网站连接失败', error)
      return {
        success: false,
        data: [],
      }
    }
  }
}
