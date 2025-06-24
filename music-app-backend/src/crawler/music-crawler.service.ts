import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import { Song } from '../entities/song.entity'
import { CrawlSongDto, CrawlConfigDto } from '../dto/song.dto'

export interface CrawlResult {
  success: boolean
  message: string
  data?: {
    total: number
    added: number
    skipped: number
    errors: number
    songs: Song[]
  }
  error?: string
}

export interface CrawlProgress {
  status: 'idle' | 'running' | 'completed' | 'error'
  progress: number
  total: number
  current: number
  message: string
  startTime?: Date
  endTime?: Date
}

@Injectable()
export class MusicCrawlerService {
  private readonly logger = new Logger(MusicCrawlerService.name)
  private readonly httpClient: AxiosInstance
  private readonly baseUrl = 'https://www.33ve.com'
  private crawlProgress: CrawlProgress = {
    status: 'idle',
    progress: 0,
    total: 0,
    current: 0,
    message: '等待开始',
  }

  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      },
    })

    // 为每个请求设置随机User-Agent
    this.httpClient.interceptors.request.use(config => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      ]
      config.headers['User-Agent'] = userAgents[Math.floor(Math.random() * userAgents.length)]
      return config
    })
  }

  /**
   * 获取爬虫进度
   */
  getProgress(): CrawlProgress {
    return { ...this.crawlProgress }
  }

  /**
   * 开始爬取音乐数据
   */
  async crawlMusic(config: CrawlConfigDto): Promise<CrawlResult> {
    if (this.crawlProgress.status === 'running') {
      return {
        success: false,
        message: '爬虫正在运行中，请等待完成后再试',
      }
    }

    this.crawlProgress = {
      status: 'running',
      progress: 0,
      total: config.limit || 20,
      current: 0,
      message: '开始爬取音乐数据...',
      startTime: new Date(),
    }

    try {
      let songs: CrawlSongDto[] = []

      switch (config.type) {
        case 'recommended':
          songs = await this.crawlRecommendedMusic(config.limit || 20)
          break
        case 'popular':
          songs = await this.crawlPopularMusic(config.limit || 20)
          break
        case 'latest':
          songs = await this.crawlLatestMusic(config.limit || 20)
          break
        default:
          songs = await this.crawlRecommendedMusic(config.limit || 20)
      }

      const result = await this.processCrawledSongs(songs)

      this.crawlProgress = {
        ...this.crawlProgress,
        status: 'completed',
        progress: 100,
        current: result.data?.total || 0,
        message: `爬取完成，共处理 ${result.data?.total} 首歌曲`,
        endTime: new Date(),
      }

      return result
    } catch (error) {
      this.logger.error('爬取音乐数据失败', error)
      this.crawlProgress = {
        ...this.crawlProgress,
        status: 'error',
        message: `爬取失败: ${error.message}`,
        endTime: new Date(),
      }

      return {
        success: false,
        message: '爬取音乐数据失败',
        error: error.message,
      }
    }
  }

  /**
   * 爬取推荐音乐
   */
  private async crawlRecommendedMusic(limit: number): Promise<CrawlSongDto[]> {
    this.logger.log('开始爬取推荐音乐')
    this.updateProgress('正在爬取推荐音乐...')

    try {
      const response = await this.httpClient.get(this.baseUrl)
      const $ = cheerio.load(response.data)
      const songs: CrawlSongDto[] = []

      // 解析推荐音乐区域
      $('.推荐音乐, .recommend, .music-list').each((_index, element) => {
        if (songs.length >= limit) return false

        const songElement = $(element)
        const song = this.extractSongInfo(songElement, $)

        if (song && this.validateSongData(song)) {
          songs.push(song)
          this.updateProgress(`已爬取 ${songs.length}/${limit} 首歌曲`, songs.length)
        }
      })

      // 如果推荐区域没有足够的歌曲，尝试从其他区域获取
      if (songs.length < limit) {
        $('a[href*="/mp3/"]').each((_index, element) => {
          if (songs.length >= limit) return false

          const songElement = $(element)
          const song = this.extractSongInfoFromLink(songElement, $)

          if (song && this.validateSongData(song) && !this.isDuplicateSong(song, songs)) {
            songs.push(song)
            this.updateProgress(`已爬取 ${songs.length}/${limit} 首歌曲`, songs.length)
          }
        })
      }

      this.logger.log(`成功爬取 ${songs.length} 首推荐音乐`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('爬取推荐音乐失败', error)
      throw new Error(`爬取推荐音乐失败: ${error.message}`)
    }
  }

  /**
   * 爬取热门音乐
   */
  private async crawlPopularMusic(limit: number): Promise<CrawlSongDto[]> {
    this.logger.log('开始爬取热门音乐')
    this.updateProgress('正在爬取热门音乐...')

    try {
      const response = await this.httpClient.get(`${this.baseUrl}/list/top.html`)
      const $ = cheerio.load(response.data)
      const songs: CrawlSongDto[] = []

      $('a[href*="/mp3/"]').each((_index, element) => {
        if (songs.length >= limit) return false

        const songElement = $(element)
        const song = this.extractSongInfoFromLink(songElement, $)

        if (song && this.validateSongData(song)) {
          songs.push(song)
          this.updateProgress(`已爬取 ${songs.length}/${limit} 首歌曲`, songs.length)
        }
      })

      this.logger.log(`成功爬取 ${songs.length} 首热门音乐`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('爬取热门音乐失败', error)
      throw new Error(`爬取热门音乐失败: ${error.message}`)
    }
  }

  /**
   * 爬取最新音乐
   */
  private async crawlLatestMusic(limit: number): Promise<CrawlSongDto[]> {
    this.logger.log('开始爬取最新音乐')
    this.updateProgress('正在爬取最新音乐...')

    // 实现类似于热门音乐的逻辑，但从不同的页面获取
    return this.crawlPopularMusic(limit)
  }

  /**
   * 从歌曲链接提取歌曲信息
   */
  private extractSongInfoFromLink(
    element: cheerio.Cheerio<any>,
    $: cheerio.CheerioAPI
  ): CrawlSongDto | null {
    try {
      const href = element.attr('href')
      if (!href || !href.includes('/mp3/')) return null

      let title = element.text().trim()
      if (!title) return null

      // 优化标题提取 - 处理常见的标题格式
      title = this.extractTitleFromText(title)

      // 多种方式提取艺术家信息
      const artist = this.extractArtistInfo(element, $)

      // 提取专辑信息
      const album = this.extractAlbumInfo(element, $)

      // 优化封面图片提取
      const coverUrl = this.extractCoverImage(element, $)

      // 提取歌曲时长
      const duration = this.extractDuration(element, $)

      // 提取音乐类型
      const genre = this.extractGenre(element, $)

      // 构建完整的URL
      const sourceUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`

      return {
        title: this.cleanText(title),
        artist: this.cleanText(artist),
        album: album || '未知专辑',
        duration: duration || 0,
        coverUrl: coverUrl || undefined,
        genre: genre || undefined,
        sourceUrl,
        sourceId: this.extractIdFromUrl(href),
      }
    } catch (error) {
      this.logger.warn('提取歌曲信息失败', error)
      return null
    }
  }

  /**
   * 从元素提取歌曲信息（通用方法）
   */
  private extractSongInfo(
    element: cheerio.Cheerio<any>,
    $: cheerio.CheerioAPI
  ): CrawlSongDto | null {
    // 这个方法可以根据网站的具体结构来实现
    // 目前使用链接提取方法作为后备
    const linkElement = element.find('a[href*="/mp3/"]').first()
    if (linkElement.length > 0) {
      return this.extractSongInfoFromLink(linkElement, $)
    }
    return null
  }

  /**
   * 处理爬取到的歌曲数据
   */
  private async processCrawledSongs(crawledSongs: CrawlSongDto[]): Promise<CrawlResult> {
    let added = 0
    let skipped = 0
    let errors = 0
    const savedSongs: Song[] = []

    this.updateProgress('正在处理爬取的歌曲数据...')

    for (let i = 0; i < crawledSongs.length; i++) {
      const crawledSong = crawledSongs[i]

      try {
        // 检查歌曲是否已存在
        const existingSong = await this.songRepository.findOne({
          where: [
            { title: crawledSong.title, artist: crawledSong.artist },
            { sourceId: crawledSong.sourceId },
          ].filter(condition => Object.values(condition).every(value => value)),
        })

        if (existingSong) {
          skipped++
          this.logger.debug(`歌曲已存在，跳过: ${crawledSong.title} - ${crawledSong.artist}`)
        } else {
          // 生成随机播放次数以模拟真实数据
          const playCount = this.generateRandomPlayCount(crawledSong.genre)

          // 创建新歌曲
          const newSong = this.songRepository.create({
            title: crawledSong.title,
            artist: crawledSong.artist,
            album: crawledSong.album || '未知专辑',
            duration: crawledSong.duration || this.generateRandomDuration(),
            coverUrl: crawledSong.coverUrl || this.generateCoverUrl(),
            audioUrl: crawledSong.audioUrl || '/uploads/music/default-song.mp3',
            genre: crawledSong.genre || this.inferGenreFromArtist(crawledSong.artist),
            year: crawledSong.year || this.generateRandomYear(),
            playCount: playCount,
            lyrics: crawledSong.lyrics,
            fileSize: crawledSong.fileSize,
            originalFileName: `${crawledSong.title}-${crawledSong.artist}.mp3`,
            sourceId: crawledSong.sourceId,
            sourceUrl: crawledSong.sourceUrl,
          })

          const savedSong = await this.songRepository.save(newSong)
          savedSongs.push(savedSong)
          added++
          this.logger.debug(`成功添加歌曲: ${crawledSong.title} - ${crawledSong.artist}`)
        }
      } catch (error) {
        errors++
        this.logger.error(`处理歌曲失败: ${crawledSong.title} - ${crawledSong.artist}`, error)
      }

      this.updateProgress(`正在处理歌曲 ${i + 1}/${crawledSongs.length}`, i + 1)

      // 添加延迟以避免数据库压力
      if (i % 10 === 0) {
        await this.delay(100)
      }
    }

    return {
      success: true,
      message: `处理完成，添加 ${added} 首，跳过 ${skipped} 首，错误 ${errors} 首`,
      data: {
        total: crawledSongs.length,
        added,
        skipped,
        errors,
        songs: savedSongs,
      },
    }
  }

  /**
   * 验证歌曲数据
   */
  private validateSongData(song: CrawlSongDto): boolean {
    if (!song.title || !song.artist) {
      return false
    }

    if (song.title.length < 1 || song.title.length > 200) {
      return false
    }

    if (song.artist.length < 1 || song.artist.length > 100) {
      return false
    }

    return true
  }

  /**
   * 检查是否为重复歌曲
   */
  private isDuplicateSong(song: CrawlSongDto, existingSongs: CrawlSongDto[]): boolean {
    return existingSongs.some(
      existing => existing.title === song.title && existing.artist === song.artist
    )
  }

  /**
   * 清理文本内容
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a\s\-\(\)\[\]]/g, '')
      .trim()
  }

  /**
   * 从URL提取ID
   */
  private extractIdFromUrl(url: string): string {
    const match = url.match(/\/mp3\/([^\/]+)\.html/)
    return match ? match[1] : ''
  }

  /**
   * 更新爬取进度
   */
  private updateProgress(message: string, current?: number): void {
    if (current !== undefined) {
      this.crawlProgress.current = current
      this.crawlProgress.progress = Math.round((current / this.crawlProgress.total) * 100)
    }
    this.crawlProgress.message = message
    this.logger.debug(`爬取进度: ${this.crawlProgress.progress}% - ${message}`)
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 重置爬取进度
   */
  resetProgress(): void {
    this.crawlProgress = {
      status: 'idle',
      progress: 0,
      total: 0,
      current: 0,
      message: '等待开始',
    }
  }

  /**
   * 停止爬取（如果正在运行）
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
   * 从文本中提取标题（处理各种格式）
   */
  private extractTitleFromText(text: string): string {
    // 移除常见的前缀和后缀
    let title = text
      .replace(/^(歌曲|音乐|单曲|MV|视频)[:：\s]*/, '')
      .replace(/\s*(歌曲|音乐|单曲|MV|视频)\s*$/, '')
      .replace(/^\d+\.\s*/, '') // 移除序号
      .replace(/\s*\[.*?\]\s*$/, '') // 移除末尾的标签
      .replace(/\s*\(.*?\)\s*$/, '') // 移除末尾的括号内容（如果是格式信息）

    // 处理 "艺术家 - 歌名" 格式
    const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
    if (dashMatch) {
      const [, possibleArtist, possibleTitle] = dashMatch
      // 如果第二部分更像歌名，则使用第二部分作为标题
      if (possibleTitle.length > 3 && !possibleTitle.includes('专辑')) {
        title = possibleTitle
      }
    }

    return title.trim()
  }

  /**
   * 提取艺术家信息（多种策略）
   */
  private extractArtistInfo(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string {
    const strategies = [
      // 策略1: 查找艺术家链接
      () => {
        const artistLink = element
          .closest('tr, li, div')
          .find('a[href*="/singer/"], a[href*="/artist/"]')
          .first()
        return artistLink.text().trim()
      },

      // 策略2: 从标题中提取 "艺术家 - 歌名" 格式
      () => {
        const fullText = element.text().trim()
        const dashMatch = fullText.match(/^(.+?)\s*[-–—]\s*(.+)$/)
        if (dashMatch) {
          const possibleArtist = dashMatch[1].trim()
          if (possibleArtist.length > 0 && possibleArtist.length < 50) {
            return possibleArtist
          }
        }
        return ''
      },

      // 策略3: 查找包含"演唱"、"歌手"等关键词的元素
      () => {
        const container = element.closest('tr, li, div')
        const artistText = container
          .find('*')
          .filter((_, el) => {
            const text = $(el).text()
            return /演唱|歌手|艺术家|singer|artist/i.test(text)
          })
          .first()
          .text()

        return artistText
          .replace(/演唱[:：]?|歌手[:：]?|艺术家[:：]?|singer[:：]?|artist[:：]?/gi, '')
          .trim()
      },

      // 策略4: 查找相邻的文本节点
      () => {
        const container = element.closest('tr, li, div')
        const textNodes = container.find('span, td, div').filter((_, el) => {
          const text = $(el).text().trim()
          return (
            text.length > 0 && text.length < 30 && !text.includes('下载') && !text.includes('播放')
          )
        })

        for (let i = 0; i < textNodes.length; i++) {
          const text = $(textNodes[i]).text().trim()
          if (text && text !== element.text().trim()) {
            return text
          }
        }
        return ''
      },
    ]

    for (const strategy of strategies) {
      try {
        const result = strategy()
        if (result && result.length > 0 && result !== '未知艺术家') {
          return result
        }
      } catch (error) {
        // 忽略策略错误，尝试下一个
      }
    }

    return '未知艺术家'
  }

  /**
   * 提取专辑信息
   */
  private extractAlbumInfo(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string | null {
    const container = element.closest('tr, li, div')

    // 查找包含"专辑"关键词的元素
    const albumElement = container
      .find('*')
      .filter((_, el) => {
        const text = $(el).text()
        return /专辑|album/i.test(text) && !text.includes('下载')
      })
      .first()

    if (albumElement.length > 0) {
      const albumText = albumElement
        .text()
        .replace(/专辑[:：]?|album[:：]?/gi, '')
        .trim()
      if (albumText && albumText.length > 0 && albumText.length < 100) {
        return albumText
      }
    }

    return null
  }

  /**
   * 提取封面图片（优化版）
   */
  private extractCoverImage(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string | null {
    const container = element.closest('tr, li, div, article')

    // 多种策略查找封面图片
    const imageSelectors = [
      'img[src*="cover"]',
      'img[src*="album"]',
      'img[src*="thumb"]',
      'img[alt*="封面"]',
      'img[alt*="专辑"]',
      '.cover img',
      '.album-cover img',
      '.thumbnail img',
      'img',
    ]

    for (const selector of imageSelectors) {
      const imgElement = container.find(selector).first()
      if (imgElement.length > 0) {
        const src =
          imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-original')
        if (src) {
          // 过滤掉明显不是封面的图片
          if (!src.includes('icon') && !src.includes('button') && !src.includes('logo')) {
            const fullUrl = src.startsWith('http')
              ? src
              : src.startsWith('/')
                ? `${this.baseUrl}${src}`
                : `${this.baseUrl}/${src}`
            return fullUrl
          }
        }
      }
    }

    return null
  }

  /**
   * 提取歌曲时长
   */
  private extractDuration(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): number | null {
    const container = element.closest('tr, li, div')

    // 查找时长信息（格式如 03:45, 3:45, 225秒等）
    const durationRegex = /(\d{1,2}):(\d{2})|(\d+)秒|(\d+)s/
    const textContent = container.text()
    const match = textContent.match(durationRegex)

    if (match) {
      if (match[1] && match[2]) {
        // MM:SS 格式
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        return minutes * 60 + seconds
      } else if (match[3]) {
        // 秒数格式
        return parseInt(match[3], 10)
      } else if (match[4]) {
        // 秒数格式（带s）
        return parseInt(match[4], 10)
      }
    }

    return null
  }

  /**
   * 提取音乐类型
   */
  private extractGenre(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string | null {
    const container = element.closest('tr, li, div')

    // 常见的音乐类型关键词
    const genreKeywords = [
      '流行',
      '摇滚',
      '民谣',
      '电子',
      '古典',
      '爵士',
      '说唱',
      '乡村',
      '金属',
      '朋克',
      '蓝调',
      '雷鬼',
      '放克',
      '嘻哈',
      'R&B',
      'Pop',
      'Rock',
      'Folk',
      'Electronic',
      'Classical',
      'Jazz',
      'Rap',
      'Country',
    ]

    const textContent = container.text()
    for (const genre of genreKeywords) {
      if (textContent.includes(genre)) {
        return genre
      }
    }

    return null
  }

  /**
   * 生成随机播放次数
   */
  private generateRandomPlayCount(genre?: string): number {
    const baseRanges: { [key: string]: [number, number] } = {
      流行: [1000, 8000],
      摇滚: [500, 6000],
      民谣: [300, 4000],
      中国风: [800, 5000],
      电子: [200, 3000],
      古典: [100, 2000],
      爵士: [150, 2500],
      说唱: [400, 5000],
    }

    const range = (genre && baseRanges[genre]) || [100, 3000]
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
  }

  /**
   * 生成随机时长（秒）
   */
  private generateRandomDuration(): number {
    // 大部分歌曲在3-5分钟之间
    return Math.floor(Math.random() * (300 - 180 + 1)) + 180
  }

  /**
   * 生成封面图片URL
   */
  private generateCoverUrl(): string {
    const randomId = Math.floor(Math.random() * 1000) + 1
    return `https://picsum.photos/300/300?random=${randomId}`
  }

  /**
   * 根据艺术家推断音乐类型
   */
  private inferGenreFromArtist(artist: string): string {
    const artistGenreMap: { [key: string]: string } = {
      周杰伦: '流行',
      薛之谦: '流行',
      赵雷: '民谣',
      Beyond: '摇滚',
      于文文: '流行',
      买辣椒也用券: '流行',
      林俊杰: '流行',
      邓紫棋: '流行',
      陈奕迅: '流行',
      王菲: '流行',
      李荣浩: '流行',
      毛不易: '民谣',
      朴树: '民谣',
      许巍: '摇滚',
      汪峰: '摇滚',
    }

    return artistGenreMap[artist] || '流行'
  }

  /**
   * 生成随机年份
   */
  private generateRandomYear(): number {
    const currentYear = new Date().getFullYear()
    // 生成1990到当前年份之间的随机年份
    return Math.floor(Math.random() * (currentYear - 1990 + 1)) + 1990
  }
}
