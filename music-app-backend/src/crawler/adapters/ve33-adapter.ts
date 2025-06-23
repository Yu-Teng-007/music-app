import { Injectable } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { BaseSiteAdapter } from './base-site-adapter'
import { CrawlType, CrawlOptions, SiteConfig } from '../interfaces/site-adapter.interface'
import { CrawlSongDto } from '../../dto/song.dto'

/**
 * 33ve.com 网站适配器
 */
@Injectable()
export class Ve33Adapter extends BaseSiteAdapter {
  readonly siteName = '33ve音乐网'
  readonly supportedTypes = [
    CrawlType.RECOMMENDED,
    CrawlType.POPULAR,
    CrawlType.LATEST,
    CrawlType.SEARCH,
  ]

  constructor() {
    const config: SiteConfig = {
      name: '33ve音乐网',
      baseUrl: 'https://www.33ve.com',
      enabled: true,
      requestConfig: {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        headers: {
          Referer: 'https://www.33ve.com/',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      selectors: {
        songLinks: ['a[href*="/mp3/"]'],
        title: ['a[href*="/mp3/"]'],
        artist: ['a[href*="/singer/"]', 'a[href*="/artist/"]'],
        album: ['*[text*="专辑"]', '*[text*="album"]'],
        cover: ['img[src*="cover"]', 'img[src*="album"]', 'img[src*="thumb"]', 'img'],
        duration: ['*[text*=":"]'],
        genre: ['*[text*="流行"]', '*[text*="摇滚"]', '*[text*="民谣"]'],
      },
      urlPatterns: {
        recommended: '/',
        popular: '/list/top.html',
        latest: '/list/new.html',
        search: '/search.php?key={query}',
        artist: '/singer/{artist}.html',
        genre: '/list/{genre}.html',
      },
      cleaningRules: {
        titlePatterns: [
          '^(歌曲|音乐|单曲|MV|视频)[:：\\s]*',
          '\\s*(歌曲|音乐|单曲|MV|视频)\\s*$',
          '^\\d+\\.\\s*',
          '\\s*\\[.*?\\]\\s*$',
          '\\s*\\(.*?\\)\\s*$',
        ],
        artistPatterns: [
          '演唱[:：]?',
          '歌手[:：]?',
          '艺术家[:：]?',
          'singer[:：]?',
          'artist[:：]?',
        ],
        excludePatterns: [
          '广告',
          '推广',
          'ad',
          'advertisement',
          '下载',
          'download',
          '试听',
          'preview',
        ],
      },
    }

    super(config)
  }

  /**
   * 爬取推荐音乐
   */
  async crawlRecommended(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]> {
    this.logger.log(`开始爬取推荐音乐，限制: ${limit}`)

    try {
      const $ = await this.makeRequest(this.baseUrl, options)
      const songs: CrawlSongDto[] = []

      // 多种策略查找推荐音乐
      const selectors = [
        '.推荐音乐 a[href*="/mp3/"]',
        '.recommend a[href*="/mp3/"]',
        '.music-list a[href*="/mp3/"]',
        'a[href*="/mp3/"]',
      ]

      for (const selector of selectors) {
        if (songs.length >= limit) break

        $(selector).each((_, element) => {
          if (songs.length >= limit) return false

          const song = this.extractSongFromElement($(element), $)
          if (song && this.validateSongData(song)) {
            const cleanedSong = this.cleanSongData(song)
            if (!this.isDuplicateSong(cleanedSong, songs)) {
              songs.push(cleanedSong)
              this.stats.songsFound++
              this.stats.validSongs++
            } else {
              this.stats.duplicateSongs++
            }
          }
        })
      }

      this.logger.log(`推荐音乐爬取完成，获得 ${songs.length} 首歌曲`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('爬取推荐音乐失败', error)
      throw error
    }
  }

  /**
   * 爬取热门音乐
   */
  async crawlPopular(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]> {
    this.logger.log(`开始爬取热门音乐，限制: ${limit}`)

    try {
      const url = this.config.urlPatterns.popular
      const $ = await this.makeRequest(this.buildFullUrl(url), options)
      const songs: CrawlSongDto[] = []

      $('a[href*="/mp3/"]').each((_, element) => {
        if (songs.length >= limit) return false

        const song = this.extractSongFromElement($(element), $)
        if (song && this.validateSongData(song)) {
          const cleanedSong = this.cleanSongData(song)
          if (!this.isDuplicateSong(cleanedSong, songs)) {
            songs.push(cleanedSong)
            this.stats.songsFound++
            this.stats.validSongs++
          } else {
            this.stats.duplicateSongs++
          }
        }
      })

      this.logger.log(`热门音乐爬取完成，获得 ${songs.length} 首歌曲`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('爬取热门音乐失败', error)
      throw error
    }
  }

  /**
   * 爬取最新音乐
   */
  async crawlLatest(limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]> {
    this.logger.log(`开始爬取最新音乐，限制: ${limit}`)

    try {
      const url = this.config.urlPatterns.latest
      const $ = await this.makeRequest(this.buildFullUrl(url), options)
      const songs: CrawlSongDto[] = []

      $('a[href*="/mp3/"]').each((_, element) => {
        if (songs.length >= limit) return false

        const song = this.extractSongFromElement($(element), $)
        if (song && this.validateSongData(song)) {
          const cleanedSong = this.cleanSongData(song)
          if (!this.isDuplicateSong(cleanedSong, songs)) {
            songs.push(cleanedSong)
            this.stats.songsFound++
            this.stats.validSongs++
          } else {
            this.stats.duplicateSongs++
          }
        }
      })

      this.logger.log(`最新音乐爬取完成，获得 ${songs.length} 首歌曲`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('爬取最新音乐失败', error)
      throw error
    }
  }

  /**
   * 搜索音乐
   */
  async searchMusic(query: string, limit: number, options?: CrawlOptions): Promise<CrawlSongDto[]> {
    this.logger.log(`搜索音乐: ${query}，限制: ${limit}`)

    try {
      const url = this.config.urlPatterns.search.replace('{query}', encodeURIComponent(query))
      const $ = await this.makeRequest(this.buildFullUrl(url), options)
      const songs: CrawlSongDto[] = []

      $('a[href*="/mp3/"]').each((_, element) => {
        if (songs.length >= limit) return false

        const song = this.extractSongFromElement($(element), $)
        if (song && this.validateSongData(song)) {
          const cleanedSong = this.cleanSongData(song)
          if (!this.isDuplicateSong(cleanedSong, songs)) {
            songs.push(cleanedSong)
            this.stats.songsFound++
            this.stats.validSongs++
          } else {
            this.stats.duplicateSongs++
          }
        }
      })

      this.logger.log(`音乐搜索完成，获得 ${songs.length} 首歌曲`)
      return songs.slice(0, limit)
    } catch (error) {
      this.logger.error('搜索音乐失败', error)
      throw error
    }
  }

  /**
   * 根据艺术家爬取音乐
   */
  async crawlByArtist(
    artist: string,
    limit: number,
    options?: CrawlOptions
  ): Promise<CrawlSongDto[]> {
    return this.searchMusic(artist, limit, options)
  }

  /**
   * 根据类型爬取音乐
   */
  async crawlByGenre(
    genre: string,
    limit: number,
    options?: CrawlOptions
  ): Promise<CrawlSongDto[]> {
    return this.searchMusic(genre, limit, options)
  }

  /**
   * 获取歌曲详细信息
   */
  async getSongDetails(songId: string): Promise<CrawlSongDto | null> {
    try {
      const url = `/mp3/${songId}.html`
      const $ = await this.makeRequest(this.buildFullUrl(url))

      const titleElement = $('h1, .title, .song-title').first()
      const title = titleElement.text().trim()

      if (!title) return null

      return {
        title: this.cleanText(title),
        artist: '未知艺术家',
        album: '未知专辑',
        sourceUrl: this.buildFullUrl(url),
        sourceId: songId,
      }
    } catch (error) {
      this.logger.error(`获取歌曲详情失败: ${songId}`, error)
      return null
    }
  }

  /**
   * 从元素提取歌曲信息
   */
  private extractSongFromElement(
    element: cheerio.Cheerio<any>,
    $: cheerio.CheerioAPI
  ): CrawlSongDto | null {
    try {
      const href = element.attr('href')
      if (!href || !href.includes('/mp3/')) return null

      let title = element.text().trim()
      if (!title) return null

      // 提取标题
      title = this.extractTitleFromText(title)

      // 提取艺术家
      const artist = this.extractArtistInfo(element, $)

      // 提取专辑
      const album = this.extractAlbumInfo(element, $)

      // 提取封面
      const coverUrl = this.extractCoverImage(element, $)

      // 提取时长
      const duration = this.extractDuration(element, $)

      // 提取类型
      const genre = this.extractGenre(element, $)

      // 构建完整URL
      const sourceUrl = this.buildFullUrl(href)

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
   * 从文本中提取标题
   */
  private extractTitleFromText(text: string): string {
    let title = text

    // 应用清理规则
    for (const pattern of this.config.cleaningRules.titlePatterns) {
      title = title.replace(new RegExp(pattern, 'gi'), '')
    }

    // 处理 "艺术家 - 歌名" 格式
    const dashMatch = title.match(/^(.+?)\s*[-–—]\s*(.+)$/)
    if (dashMatch) {
      const [, , possibleTitle] = dashMatch
      if (possibleTitle.length > 3 && !possibleTitle.includes('专辑')) {
        title = possibleTitle
      }
    }

    return title.trim()
  }

  /**
   * 提取艺术家信息
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

      // 策略2: 从标题中提取
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
    ]

    for (const strategy of strategies) {
      try {
        const result = strategy()
        if (result && result.length > 0 && result !== '未知艺术家') {
          return result
        }
      } catch (error) {
        // 忽略错误，尝试下一个策略
      }
    }

    return '未知艺术家'
  }

  /**
   * 提取专辑信息
   */
  private extractAlbumInfo(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string | null {
    const container = element.closest('tr, li, div')

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
   * 提取封面图片
   */
  private extractCoverImage(element: cheerio.Cheerio<any>, $: cheerio.CheerioAPI): string | null {
    const container = element.closest('tr, li, div, article')

    for (const selector of this.config.selectors.cover) {
      const imgElement = container.find(selector).first()
      if (imgElement.length > 0) {
        const src =
          imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-original')
        if (src && !src.includes('icon') && !src.includes('button') && !src.includes('logo')) {
          return this.buildFullUrl(src)
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
    const durationRegex = /(\d{1,2}):(\d{2})|(\d+)秒|(\d+)s/
    const textContent = container.text()
    const match = textContent.match(durationRegex)

    if (match) {
      if (match[1] && match[2]) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        return minutes * 60 + seconds
      } else if (match[3]) {
        return parseInt(match[3], 10)
      } else if (match[4]) {
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
      'Pop',
      'Rock',
      'Folk',
      'Electronic',
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
   * 从URL提取ID
   */
  private extractIdFromUrl(url: string): string {
    const match = url.match(/\/mp3\/([^\/]+)\.html/)
    return match ? match[1] : ''
  }

  /**
   * 检查是否为重复歌曲
   */
  private isDuplicateSong(song: CrawlSongDto, existingSongs: CrawlSongDto[]): boolean {
    return existingSongs.some(
      existing => existing.title === song.title && existing.artist === song.artist
    )
  }
}
