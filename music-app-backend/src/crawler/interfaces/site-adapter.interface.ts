import { CrawlSongDto } from '../../dto/song.dto'

/**
 * 网站适配器接口
 * 定义了每个音乐网站爬虫必须实现的方法
 */
export interface ISiteAdapter {
  /**
   * 网站名称
   */
  readonly siteName: string

  /**
   * 网站基础URL
   */
  readonly baseUrl: string

  /**
   * 网站是否可用
   */
  readonly isEnabled: boolean

  /**
   * 支持的爬取类型
   */
  readonly supportedTypes: CrawlType[]

  /**
   * 测试网站连接
   */
  testConnection(): Promise<ConnectionTestResult>

  /**
   * 爬取推荐音乐
   */
  crawlRecommended(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 爬取热门音乐
   */
  crawlPopular(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 爬取最新音乐
   */
  crawlLatest(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 搜索音乐
   */
  searchMusic(query: string, limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 根据艺术家爬取音乐
   */
  crawlByArtist(artist: string, limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 根据类型爬取音乐
   */
  crawlByGenre(genre: string, limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]>

  /**
   * 获取歌曲详细信息
   */
  getSongDetails(songId: string): Promise<CrawlSongDto | null>

  /**
   * 验证歌曲数据
   */
  validateSongData(song: CrawlSongDto): boolean

  /**
   * 清理和标准化数据
   */
  cleanSongData(song: CrawlSongDto): CrawlSongDto
}

/**
 * 爬取类型枚举
 */
export enum CrawlType {
  RECOMMENDED = 'recommended',
  POPULAR = 'popular',
  LATEST = 'latest',
  SEARCH = 'search',
  BY_ARTIST = 'by_artist',
  BY_GENRE = 'by_genre'
}

/**
 * 爬取选项
 */
export interface CrawlOptions {
  /**
   * 请求延迟（毫秒）
   */
  delay?: number

  /**
   * 最大重试次数
   */
  maxRetries?: number

  /**
   * 超时时间（毫秒）
   */
  timeout?: number

  /**
   * 自定义请求头
   */
  headers?: Record<string, string>

  /**
   * 代理设置
   */
  proxy?: {
    host: string
    port: number
    username?: string
    password?: string
  }

  /**
   * 是否启用缓存
   */
  enableCache?: boolean

  /**
   * 缓存过期时间（秒）
   */
  cacheExpiry?: number

  /**
   * 额外的过滤条件
   */
  filters?: {
    minDuration?: number
    maxDuration?: number
    excludeKeywords?: string[]
    includeKeywords?: string[]
  }
}

/**
 * 连接测试结果
 */
export interface ConnectionTestResult {
  /**
   * 是否连接成功
   */
  success: boolean

  /**
   * 响应时间（毫秒）
   */
  responseTime: number

  /**
   * HTTP状态码
   */
  statusCode: number

  /**
   * 错误信息（如果有）
   */
  error?: string

  /**
   * 网站是否可访问
   */
  accessible: boolean

  /**
   * 额外信息
   */
  metadata?: {
    serverInfo?: string
    lastModified?: string
    contentType?: string
  }
}

/**
 * 网站配置接口
 */
export interface SiteConfig {
  /**
   * 网站名称
   */
  name: string

  /**
   * 基础URL
   */
  baseUrl: string

  /**
   * 是否启用
   */
  enabled: boolean

  /**
   * 请求配置
   */
  requestConfig: {
    timeout: number
    retryAttempts: number
    retryDelay: number
    userAgent: string
    headers: Record<string, string>
  }

  /**
   * 选择器配置
   */
  selectors: {
    songLinks: string[]
    title: string[]
    artist: string[]
    album: string[]
    cover: string[]
    duration: string[]
    genre: string[]
  }

  /**
   * URL模式
   */
  urlPatterns: {
    recommended: string
    popular: string
    latest: string
    search: string
    artist: string
    genre: string
  }

  /**
   * 数据清洗规则
   */
  cleaningRules: {
    titlePatterns: string[]
    artistPatterns: string[]
    excludePatterns: string[]
  }
}

/**
 * 爬取统计信息
 */
export interface CrawlStats {
  /**
   * 网站名称
   */
  siteName: string

  /**
   * 爬取开始时间
   */
  startTime: Date

  /**
   * 爬取结束时间
   */
  endTime?: Date

  /**
   * 总请求数
   */
  totalRequests: number

  /**
   * 成功请求数
   */
  successfulRequests: number

  /**
   * 失败请求数
   */
  failedRequests: number

  /**
   * 爬取的歌曲数量
   */
  songsFound: number

  /**
   * 有效歌曲数量
   */
  validSongs: number

  /**
   * 重复歌曲数量
   */
  duplicateSongs: number

  /**
   * 平均响应时间
   */
  averageResponseTime: number

  /**
   * 错误列表
   */
  errors: Array<{
    timestamp: Date
    error: string
    url?: string
  }>
}
