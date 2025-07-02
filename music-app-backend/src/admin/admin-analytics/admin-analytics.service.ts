import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, Song, Playlist, History, Comment, UserFeed } from '../../entities'

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(History)
    private historyRepository: Repository<History>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(UserFeed)
    private userFeedRepository: Repository<UserFeed>
  ) {}

  /**
   * 获取总体统计数据
   */
  async getOverviewStats() {
    const [
      totalUsers,
      totalSongs,
      totalPlaylists,
      totalPlays,
      totalComments,
      activeUsers,
    ] = await Promise.all([
      this.userRepository.count({ where: { isActive: true } }),
      this.songRepository.count(),
      this.playlistRepository.count(),
      this.historyRepository.count(),
      this.commentRepository.count(),
      this.getActiveUsersCount(),
    ])

    const totalPlayTime = await this.songRepository
      .createQueryBuilder('song')
      .select('SUM(song.duration * song.playCount)', 'total')
      .getRawOne()

    return {
      totalUsers,
      totalSongs,
      totalPlaylists,
      totalPlays,
      totalComments,
      activeUsers,
      totalPlayTime: parseInt(totalPlayTime?.total || '0'),
    }
  }

  /**
   * 获取用户增长趋势
   */
  async getUserGrowthTrend(days: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .andWhere('user.createdAt <= :endDate', { endDate })
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany()

    return result.map(item => ({
      date: item.date,
      count: parseInt(item.count),
    }))
  }

  /**
   * 获取歌曲播放趋势
   */
  async getPlayTrend(days: number = 30) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const result = await this.historyRepository
      .createQueryBuilder('history')
      .select('DATE(history.playedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('history.playedAt >= :startDate', { startDate })
      .andWhere('history.playedAt <= :endDate', { endDate })
      .groupBy('DATE(history.playedAt)')
      .orderBy('date', 'ASC')
      .getRawMany()

    return result.map(item => ({
      date: item.date,
      count: parseInt(item.count),
    }))
  }

  /**
   * 获取热门音乐类型
   */
  async getPopularGenres(limit: number = 10) {
    const result = await this.songRepository
      .createQueryBuilder('song')
      .select('song.genre', 'genre')
      .addSelect('COUNT(*)', 'songCount')
      .addSelect('SUM(song.playCount)', 'totalPlays')
      .where('song.genre IS NOT NULL')
      .groupBy('song.genre')
      .orderBy('totalPlays', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map(item => ({
      genre: item.genre,
      songCount: parseInt(item.songCount),
      totalPlays: parseInt(item.totalPlays || '0'),
    }))
  }

  /**
   * 获取热门艺术家
   */
  async getPopularArtists(limit: number = 10) {
    const result = await this.songRepository
      .createQueryBuilder('song')
      .select('song.artist', 'artist')
      .addSelect('COUNT(*)', 'songCount')
      .addSelect('SUM(song.playCount)', 'totalPlays')
      .groupBy('song.artist')
      .orderBy('totalPlays', 'DESC')
      .limit(limit)
      .getRawMany()

    return result.map(item => ({
      artist: item.artist,
      songCount: parseInt(item.songCount),
      totalPlays: parseInt(item.totalPlays || '0'),
    }))
  }

  /**
   * 获取用户活跃度分析
   */
  async getUserActivityAnalysis() {
    const totalUsers = await this.userRepository.count({ where: { isActive: true } })
    
    // 最近7天活跃用户
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const activeUsers7d = await this.historyRepository
      .createQueryBuilder('history')
      .select('COUNT(DISTINCT history.userId)', 'count')
      .where('history.playedAt >= :date', { date: sevenDaysAgo })
      .getRawOne()

    // 最近30天活跃用户
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeUsers30d = await this.historyRepository
      .createQueryBuilder('history')
      .select('COUNT(DISTINCT history.userId)', 'count')
      .where('history.playedAt >= :date', { date: thirtyDaysAgo })
      .getRawOne()

    // 用户播放时长分布
    const playDurationDistribution = await this.historyRepository
      .createQueryBuilder('history')
      .leftJoin('history.song', 'song')
      .select('history.userId', 'userId')
      .addSelect('SUM(song.duration)', 'totalDuration')
      .groupBy('history.userId')
      .having('totalDuration > 0')
      .getRawMany()

    const durationRanges = {
      '0-1h': 0,
      '1-5h': 0,
      '5-20h': 0,
      '20h+': 0,
    }

    playDurationDistribution.forEach(item => {
      const hours = parseInt(item.totalDuration) / 3600
      if (hours <= 1) durationRanges['0-1h']++
      else if (hours <= 5) durationRanges['1-5h']++
      else if (hours <= 20) durationRanges['5-20h']++
      else durationRanges['20h+']++
    })

    return {
      totalUsers,
      activeUsers7d: parseInt(activeUsers7d?.count || '0'),
      activeUsers30d: parseInt(activeUsers30d?.count || '0'),
      playDurationDistribution: durationRanges,
    }
  }

  /**
   * 获取内容统计
   */
  async getContentStats() {
    const [
      songsByGenre,
      songsByYear,
      playlistStats,
      commentStats,
    ] = await Promise.all([
      this.getSongsByGenre(),
      this.getSongsByYear(),
      this.getPlaylistStats(),
      this.getCommentStats(),
    ])

    return {
      songsByGenre,
      songsByYear,
      playlistStats,
      commentStats,
    }
  }

  /**
   * 获取活跃用户数量
   */
  private async getActiveUsersCount() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const result = await this.historyRepository
      .createQueryBuilder('history')
      .select('COUNT(DISTINCT history.userId)', 'count')
      .where('history.playedAt >= :date', { date: sevenDaysAgo })
      .getRawOne()

    return parseInt(result?.count || '0')
  }

  /**
   * 按类型统计歌曲
   */
  private async getSongsByGenre() {
    return await this.songRepository
      .createQueryBuilder('song')
      .select('song.genre', 'genre')
      .addSelect('COUNT(*)', 'count')
      .where('song.genre IS NOT NULL')
      .groupBy('song.genre')
      .orderBy('count', 'DESC')
      .getRawMany()
  }

  /**
   * 按年份统计歌曲
   */
  private async getSongsByYear() {
    return await this.songRepository
      .createQueryBuilder('song')
      .select('song.year', 'year')
      .addSelect('COUNT(*)', 'count')
      .where('song.year IS NOT NULL')
      .groupBy('song.year')
      .orderBy('year', 'DESC')
      .limit(10)
      .getRawMany()
  }

  /**
   * 歌单统计
   */
  private async getPlaylistStats() {
    const totalPlaylists = await this.playlistRepository.count()
    const publicPlaylists = await this.playlistRepository.count({ where: { isPrivate: false } })
    const privatePlaylists = totalPlaylists - publicPlaylists

    return {
      total: totalPlaylists,
      public: publicPlaylists,
      private: privatePlaylists,
    }
  }

  /**
   * 评论统计
   */
  private async getCommentStats() {
    const totalComments = await this.commentRepository.count()
    
    const recentComments = await this.commentRepository
      .createQueryBuilder('comment')
      .select('DATE(comment.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('comment.createdAt >= :date', { 
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
      })
      .groupBy('DATE(comment.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany()

    return {
      total: totalComments,
      recent: recentComments,
    }
  }
}
