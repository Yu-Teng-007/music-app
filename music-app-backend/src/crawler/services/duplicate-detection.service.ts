import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Song } from '../../entities/song.entity'
import { CrawlSongDto } from '../../dto/song.dto'

/**
 * 重复检测结果
 */
export interface DuplicateDetectionResult {
  isDuplicate: boolean
  confidence: number
  matchedSong?: Song
  matchType: 'exact' | 'fuzzy' | 'fingerprint' | 'metadata'
  details: {
    titleSimilarity: number
    artistSimilarity: number
    albumSimilarity: number
    durationSimilarity: number
    fingerprintSimilarity?: number
  }
}

/**
 * 相似度配置
 */
export interface SimilarityConfig {
  titleWeight: number
  artistWeight: number
  albumWeight: number
  durationWeight: number
  fingerprintWeight: number
  exactMatchThreshold: number
  fuzzyMatchThreshold: number
  fingerprintMatchThreshold: number
}

/**
 * 智能去重检测服务
 */
@Injectable()
export class DuplicateDetectionService {
  private readonly logger = new Logger(DuplicateDetectionService.name)

  // 默认相似度配置
  private readonly defaultConfig: SimilarityConfig = {
    titleWeight: 0.4,
    artistWeight: 0.3,
    albumWeight: 0.1,
    durationWeight: 0.1,
    fingerprintWeight: 0.1,
    exactMatchThreshold: 0.95,
    fuzzyMatchThreshold: 0.8,
    fingerprintMatchThreshold: 0.9,
  }

  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {}

  /**
   * 检测歌曲是否重复
   */
  async detectDuplicate(
    newSong: CrawlSongDto,
    config: Partial<SimilarityConfig> = {}
  ): Promise<DuplicateDetectionResult> {
    const finalConfig = { ...this.defaultConfig, ...config }

    try {
      // 1. 精确匹配检查
      const exactMatch = await this.findExactMatch(newSong)
      if (exactMatch) {
        return {
          isDuplicate: true,
          confidence: 1.0,
          matchedSong: exactMatch,
          matchType: 'exact',
          details: {
            titleSimilarity: 1.0,
            artistSimilarity: 1.0,
            albumSimilarity: 1.0,
            durationSimilarity: 1.0,
          },
        }
      }

      // 2. 模糊匹配检查
      const fuzzyMatch = await this.findFuzzyMatch(newSong, finalConfig)
      if (fuzzyMatch) {
        return fuzzyMatch
      }

      // 3. 音频指纹匹配（如果有音频URL）
      if (newSong.audioUrl) {
        const fingerprintMatch = await this.findFingerprintMatch(newSong, finalConfig)
        if (fingerprintMatch) {
          return fingerprintMatch
        }
      }

      // 4. 元数据相似度匹配
      const metadataMatch = await this.findMetadataMatch(newSong, finalConfig)
      if (metadataMatch) {
        return metadataMatch
      }

      return {
        isDuplicate: false,
        confidence: 0,
        matchType: 'exact',
        details: {
          titleSimilarity: 0,
          artistSimilarity: 0,
          albumSimilarity: 0,
          durationSimilarity: 0,
        },
      }
    } catch (error) {
      this.logger.error('重复检测失败', error)
      return {
        isDuplicate: false,
        confidence: 0,
        matchType: 'exact',
        details: {
          titleSimilarity: 0,
          artistSimilarity: 0,
          albumSimilarity: 0,
          durationSimilarity: 0,
        },
      }
    }
  }

  /**
   * 查找精确匹配
   */
  private async findExactMatch(newSong: CrawlSongDto): Promise<Song | null> {
    const conditions: any[] = []

    // 标题和艺术家精确匹配
    if (newSong.title && newSong.artist) {
      conditions.push({
        title: newSong.title.trim(),
        artist: newSong.artist.trim(),
      })
    }

    // 来源ID匹配
    if (newSong.sourceId) {
      conditions.push({
        sourceId: newSong.sourceId,
      })
    }

    // 来源URL匹配
    if (newSong.sourceUrl) {
      conditions.push({
        sourceUrl: newSong.sourceUrl,
      })
    }

    if (conditions.length === 0) return null

    return await this.songRepository.findOne({
      where: conditions,
    })
  }

  /**
   * 查找模糊匹配
   */
  private async findFuzzyMatch(
    newSong: CrawlSongDto,
    config: SimilarityConfig
  ): Promise<DuplicateDetectionResult | null> {
    // 获取可能的候选歌曲
    const candidates = await this.getCandidateSongs(newSong)

    let bestMatch: DuplicateDetectionResult | null = null
    let highestScore = 0

    for (const candidate of candidates) {
      const similarity = this.calculateSimilarity(newSong, candidate, config)

      if (
        similarity.totalScore > highestScore &&
        similarity.totalScore >= config.fuzzyMatchThreshold
      ) {
        highestScore = similarity.totalScore
        bestMatch = {
          isDuplicate: true,
          confidence: similarity.totalScore,
          matchedSong: candidate,
          matchType: 'fuzzy',
          details: {
            titleSimilarity: similarity.titleSimilarity,
            artistSimilarity: similarity.artistSimilarity,
            albumSimilarity: similarity.albumSimilarity,
            durationSimilarity: similarity.durationSimilarity,
          },
        }
      }
    }

    return bestMatch
  }

  /**
   * 查找音频指纹匹配
   */
  private async findFingerprintMatch(
    _newSong: CrawlSongDto,
    _config: SimilarityConfig
  ): Promise<DuplicateDetectionResult | null> {
    // 这里应该集成音频指纹库，如 AcoustID 或自定义实现
    // 目前返回 null，表示未实现
    this.logger.debug('音频指纹匹配功能待实现')
    return null
  }

  /**
   * 查找元数据匹配
   */
  private async findMetadataMatch(
    newSong: CrawlSongDto,
    config: SimilarityConfig
  ): Promise<DuplicateDetectionResult | null> {
    // 基于元数据的高级匹配算法
    const candidates = await this.getCandidateSongs(newSong, 50)

    for (const candidate of candidates) {
      const similarity = this.calculateAdvancedSimilarity(newSong, candidate, config)

      if (similarity.totalScore >= config.fuzzyMatchThreshold) {
        return {
          isDuplicate: true,
          confidence: similarity.totalScore,
          matchedSong: candidate,
          matchType: 'metadata',
          details: {
            titleSimilarity: similarity.titleSimilarity,
            artistSimilarity: similarity.artistSimilarity,
            albumSimilarity: similarity.albumSimilarity,
            durationSimilarity: similarity.durationSimilarity,
          },
        }
      }
    }

    return null
  }

  /**
   * 获取候选歌曲
   */
  private async getCandidateSongs(newSong: CrawlSongDto, limit: number = 20): Promise<Song[]> {
    const queryBuilder = this.songRepository.createQueryBuilder('song')

    // 基于标题的模糊搜索
    if (newSong.title) {
      const titleWords = newSong.title.split(/\s+/).filter(word => word.length > 2)
      if (titleWords.length > 0) {
        const titleConditions = titleWords.map(word => `song.title LIKE :word${word}`)
        queryBuilder.andWhere(`(${titleConditions.join(' OR ')})`)

        titleWords.forEach(word => {
          queryBuilder.setParameter(`word${word}`, `%${word}%`)
        })
      }
    }

    // 基于艺术家的模糊搜索
    if (newSong.artist && newSong.artist !== '未知艺术家') {
      queryBuilder.orWhere('song.artist LIKE :artist', { artist: `%${newSong.artist}%` })
    }

    // 基于时长的范围搜索
    if (newSong.duration && newSong.duration > 0) {
      const tolerance = Math.max(10, newSong.duration * 0.1) // 10秒或10%的容差
      queryBuilder.orWhere('song.duration BETWEEN :minDuration AND :maxDuration', {
        minDuration: newSong.duration - tolerance,
        maxDuration: newSong.duration + tolerance,
      })
    }

    return await queryBuilder.limit(limit).getMany()
  }

  /**
   * 计算相似度
   */
  private calculateSimilarity(
    newSong: CrawlSongDto,
    existingSong: Song,
    config: SimilarityConfig
  ): {
    totalScore: number
    titleSimilarity: number
    artistSimilarity: number
    albumSimilarity: number
    durationSimilarity: number
  } {
    const titleSimilarity = this.calculateStringSimilarity(
      newSong.title || '',
      existingSong.title || ''
    )
    const artistSimilarity = this.calculateStringSimilarity(
      newSong.artist || '',
      existingSong.artist || ''
    )
    const albumSimilarity = this.calculateStringSimilarity(
      newSong.album || '',
      existingSong.album || ''
    )
    const durationSimilarity = this.calculateDurationSimilarity(
      newSong.duration || 0,
      existingSong.duration || 0
    )

    const totalScore =
      titleSimilarity * config.titleWeight +
      artistSimilarity * config.artistWeight +
      albumSimilarity * config.albumWeight +
      durationSimilarity * config.durationWeight

    return {
      totalScore,
      titleSimilarity,
      artistSimilarity,
      albumSimilarity,
      durationSimilarity,
    }
  }

  /**
   * 计算高级相似度（包含更多启发式规则）
   */
  private calculateAdvancedSimilarity(
    newSong: CrawlSongDto,
    existingSong: Song,
    config: SimilarityConfig
  ): {
    totalScore: number
    titleSimilarity: number
    artistSimilarity: number
    albumSimilarity: number
    durationSimilarity: number
  } {
    // 基础相似度
    const basic = this.calculateSimilarity(newSong, existingSong, config)

    // 应用启发式规则
    let bonus = 0

    // 如果标题包含艺术家名称，增加匹配度
    if (
      newSong.title &&
      existingSong.artist &&
      newSong.title.toLowerCase().includes(existingSong.artist.toLowerCase())
    ) {
      bonus += 0.1
    }

    // 如果艺术家名称相似度很高，增加整体匹配度
    if (basic.artistSimilarity > 0.9) {
      bonus += 0.1
    }

    // 如果时长非常接近，增加匹配度
    if (basic.durationSimilarity > 0.95) {
      bonus += 0.05
    }

    return {
      ...basic,
      totalScore: Math.min(1.0, basic.totalScore + bonus),
    }
  }

  /**
   * 计算字符串相似度（使用 Levenshtein 距离）
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0
    if (str1 === str2) return 1

    // 标准化字符串
    const s1 = this.normalizeString(str1)
    const s2 = this.normalizeString(str2)

    if (s1 === s2) return 1

    // 计算 Levenshtein 距离
    const distance = this.levenshteinDistance(s1, s2)
    const maxLength = Math.max(s1.length, s2.length)

    if (maxLength === 0) return 1

    return 1 - distance / maxLength
  }

  /**
   * 计算时长相似度
   */
  private calculateDurationSimilarity(duration1: number, duration2: number): number {
    if (duration1 === 0 || duration2 === 0) return 0.5 // 未知时长给予中等分数
    if (duration1 === duration2) return 1

    const diff = Math.abs(duration1 - duration2)
    const avg = (duration1 + duration2) / 2

    // 如果差异小于平均值的10%，认为很相似
    if (diff <= avg * 0.1) return 0.9

    // 如果差异小于平均值的20%，认为较相似
    if (diff <= avg * 0.2) return 0.7

    // 如果差异小于平均值的50%，认为有些相似
    if (diff <= avg * 0.5) return 0.3

    return 0
  }

  /**
   * 标准化字符串
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '') // 只保留中文、英文、数字和空格
      .replace(/\s+/g, ' ') // 多个空格合并为一个
      .trim()
  }

  /**
   * 计算 Levenshtein 距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    // 初始化矩阵
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    // 填充矩阵
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替换
            matrix[i][j - 1] + 1, // 插入
            matrix[i - 1][j] + 1 // 删除
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * 批量检测重复歌曲
   */
  async batchDetectDuplicates(
    songs: CrawlSongDto[],
    config: Partial<SimilarityConfig> = {}
  ): Promise<Map<number, DuplicateDetectionResult>> {
    const results = new Map<number, DuplicateDetectionResult>()

    for (let i = 0; i < songs.length; i++) {
      const result = await this.detectDuplicate(songs[i], config)
      if (result.isDuplicate) {
        results.set(i, result)
      }
    }

    return results
  }

  /**
   * 获取重复歌曲统计
   */
  async getDuplicateStats(): Promise<{
    totalSongs: number
    potentialDuplicates: number
    duplicateGroups: Array<{
      representative: Song
      duplicates: Song[]
      similarity: number
    }>
  }> {
    const totalSongs = await this.songRepository.count()

    // 这里可以实现更复杂的重复分析逻辑
    // 目前返回基础统计
    return {
      totalSongs,
      potentialDuplicates: 0,
      duplicateGroups: [],
    }
  }

  /**
   * 清理重复歌曲
   */
  async cleanupDuplicates(
    dryRun: boolean = true,
    config: Partial<SimilarityConfig> = {}
  ): Promise<{
    duplicatesFound: number
    duplicatesRemoved: number
    errors: string[]
  }> {
    const finalConfig = { ...this.defaultConfig, ...config }
    const errors: string[] = []
    let duplicatesFound = 0
    let duplicatesRemoved = 0

    try {
      // 获取所有歌曲
      const allSongs = await this.songRepository.find()

      // 分组检测重复
      const duplicateGroups = new Map<string, Song[]>()

      for (const song of allSongs) {
        const key = this.generateSongKey(song)
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, [])
        }
        duplicateGroups.get(key)!.push(song)
      }

      // 处理重复组
      for (const [key, songs] of duplicateGroups) {
        if (songs.length > 1) {
          duplicatesFound += songs.length - 1

          if (!dryRun) {
            // 保留第一个，删除其余的
            const toKeep = songs[0]
            const toRemove = songs.slice(1)

            for (const song of toRemove) {
              try {
                await this.songRepository.remove(song)
                duplicatesRemoved++
              } catch (error) {
                errors.push(`删除歌曲失败 ${song.id}: ${error.message}`)
              }
            }
          }
        }
      }

      this.logger.log(
        `重复清理完成: 发现 ${duplicatesFound} 个重复，${dryRun ? '模拟' : '实际'}删除 ${duplicatesRemoved} 个`
      )

      return {
        duplicatesFound,
        duplicatesRemoved: dryRun ? 0 : duplicatesRemoved,
        errors,
      }
    } catch (error) {
      this.logger.error('重复清理失败', error)
      errors.push(`清理过程失败: ${error.message}`)

      return {
        duplicatesFound,
        duplicatesRemoved,
        errors,
      }
    }
  }

  /**
   * 生成歌曲唯一键
   */
  private generateSongKey(song: Song): string {
    const title = this.normalizeString(song.title || '')
    const artist = this.normalizeString(song.artist || '')
    return `${title}|${artist}`
  }
}
