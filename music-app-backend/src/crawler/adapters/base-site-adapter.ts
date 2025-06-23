import { Logger } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'
import * as UserAgent from 'user-agents'
import {
  ISiteAdapter,
  CrawlType,
  CrawlOptions,
  ConnectionTestResult,
  SiteConfig,
  CrawlStats,
} from '../interfaces/site-adapter.interface'
import { CrawlSongDto } from '../../dto/song.dto'

/**
 * 基础网站适配器抽象类
 * 提供通用的爬虫功能和工具方法
 */
export abstract class BaseSiteAdapter implements ISiteAdapter {
  protected readonly logger = new Logger(this.constructor.name)
  protected readonly httpClient: AxiosInstance
  protected stats: CrawlStats

  constructor(protected readonly config: SiteConfig) {
    // 初始化HTTP客户端
    this.httpClient = axios.create({
      timeout: config.requestConfig.timeout,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        ...config.requestConfig.headers,
      },
    })

    // 设置请求拦截器
    this.setupInterceptors()

    // 初始化统计信息
    this.resetStats()
  }

  // 抽象属性和方法，子类必须实现
  abstract readonly siteName: string
  abstract readonly supportedTypes: CrawlType[]

  // 通用属性
  get baseUrl(): string {
    return this.config.baseUrl
  }

  get isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * 设置HTTP拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器 - 添加随机User-Agent
    this.httpClient.interceptors.request.use(config => {
      const userAgent = new (UserAgent as any)()
      config.headers['User-Agent'] = userAgent.toString()

      // 记录请求
      this.stats.totalRequests++

      return config
    })

    // 响应拦截器 - 记录统计信息
    this.httpClient.interceptors.response.use(
      response => {
        this.stats.successfulRequests++
        return response
      },
      error => {
        this.stats.failedRequests++
        this.stats.errors.push({
          timestamp: new Date(),
          error: error.message,
          url: error.config?.url,
        })
        return Promise.reject(error)
      }
    )
  }

  /**
   * 测试网站连接
   */
  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()

    try {
      const response = await this.httpClient.get(this.baseUrl, {
        timeout: 10000,
      })

      const responseTime = Date.now() - startTime

      return {
        success: true,
        responseTime,
        statusCode: response.status,
        accessible: true,
        metadata: {
          serverInfo: response.headers['server'],
          lastModified: response.headers['last-modified'],
          contentType: response.headers['content-type'],
        },
      }
    } catch (error) {
      const responseTime = Date.now() - startTime

      return {
        success: false,
        responseTime,
        statusCode: error.response?.status || 0,
        accessible: false,
        error: error.message,
      }
    }
  }

  /**
   * 发起HTTP请求
   */
  protected async makeRequest(url: string, options?: CrawlOptions): Promise<cheerio.CheerioAPI> {
    const requestConfig: AxiosRequestConfig = {
      timeout: options?.timeout || this.config.requestConfig.timeout,
      headers: {
        ...this.config.requestConfig.headers,
        ...options?.headers,
      },
    }

    // 添加代理配置
    if (options?.proxy) {
      requestConfig.proxy = {
        host: options.proxy.host,
        port: options.proxy.port,
        auth: options.proxy.username
          ? {
              username: options.proxy.username,
              password: options.proxy.password || '',
            }
          : undefined,
      }
    }

    let retries = 0
    const maxRetries = options?.maxRetries || this.config.requestConfig.retryAttempts

    while (retries <= maxRetries) {
      try {
        // 添加延迟
        if (options?.delay || retries > 0) {
          await this.delay(options?.delay || this.config.requestConfig.retryDelay)
        }

        const response = await this.httpClient.get(url, requestConfig)
        return cheerio.load(response.data)
      } catch (error) {
        retries++
        this.logger.warn(`请求失败，重试 ${retries}/${maxRetries}: ${error.message}`)

        if (retries > maxRetries) {
          throw error
        }
      }
    }

    throw new Error('请求失败，已达到最大重试次数')
  }

  /**
   * 验证歌曲数据
   */
  validateSongData(song: CrawlSongDto): boolean {
    // 基础验证
    if (!song.title || !song.artist) {
      return false
    }

    if (song.title.length < 1 || song.title.length > 200) {
      return false
    }

    if (song.artist.length < 1 || song.artist.length > 100) {
      return false
    }

    // 检查是否包含排除关键词
    const excludePatterns = this.config.cleaningRules.excludePatterns
    const fullText = `${song.title} ${song.artist} ${song.album || ''}`.toLowerCase()

    for (const pattern of excludePatterns) {
      if (fullText.includes(pattern.toLowerCase())) {
        return false
      }
    }

    return true
  }

  /**
   * 清理和标准化数据
   */
  cleanSongData(song: CrawlSongDto): CrawlSongDto {
    return {
      ...song,
      title: this.cleanText(song.title, this.config.cleaningRules.titlePatterns),
      artist: this.cleanText(song.artist, this.config.cleaningRules.artistPatterns),
      album: song.album ? this.cleanText(song.album) : song.album,
      genre: song.genre ? this.cleanText(song.genre) : song.genre,
    }
  }

  /**
   * 清理文本内容
   */
  protected cleanText(text: string, patterns: string[] = []): string {
    let cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/[^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a\s\-\(\)\[\]]/g, '')
      .trim()

    // 应用自定义清理模式
    for (const pattern of patterns) {
      cleaned = cleaned.replace(new RegExp(pattern, 'gi'), '')
    }

    return cleaned.trim()
  }

  /**
   * 构建完整URL
   */
  protected buildFullUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }

    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`
    }

    return `${this.baseUrl}/${url}`
  }

  /**
   * 延迟函数
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 重置统计信息
   */
  protected resetStats(): void {
    this.stats = {
      siteName: this.siteName,
      startTime: new Date(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      songsFound: 0,
      validSongs: 0,
      duplicateSongs: 0,
      averageResponseTime: 0,
      errors: [],
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): CrawlStats {
    return {
      ...this.stats,
      endTime: new Date(),
      averageResponseTime:
        this.stats.totalRequests > 0 ? this.stats.successfulRequests / this.stats.totalRequests : 0,
    }
  }

  /**
   * 抽象方法 - 子类必须实现
   */
  abstract crawlRecommended(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>
  abstract crawlPopular(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>
  abstract crawlLatest(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>
  abstract searchMusic(
    query: string,
    limit: number,
    options?: CrawlOptions
  ): Promise<CrawlSongDto[]>
  abstract crawlByArtist(
    artist: string,
    limit: number,
    options?: CrawlOptions
  ): Promise<CrawlSongDto[]>
  abstract crawlByGenre(
    genre: string,
    limit: number,
    options?: CrawlOptions
  ): Promise<CrawlSongDto[]>
  abstract getSongDetails(songId: string): Promise<CrawlSongDto | null>
}
