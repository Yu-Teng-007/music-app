import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Song, User } from '../../entities'
import { CreateSongDto, UpdateSongDto, SongQueryParams } from '../../dto'

@Injectable()
export class AdminSongsService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * 获取歌曲列表（管理员视图）
   */
  async findAll(query: SongQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      artist,
      album,
      year,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query

    const queryBuilder = this.songRepository
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.uploader', 'uploader')
      .select([
        'song.id',
        'song.title',
        'song.artist',
        'song.album',
        'song.duration',
        'song.coverUrl',
        'song.audioUrl',
        'song.genre',
        'song.year',
        'song.playCount',
        'song.fileSize',
        'song.originalFileName',
        'song.sourceId',
        'song.sourceUrl',
        'song.createdAt',
        'song.updatedAt',
        'uploader.id',
        'uploader.username',
        'uploader.phone',
      ])

    // 搜索条件
    if (search) {
      queryBuilder.where(
        'song.title LIKE :search OR song.artist LIKE :search OR song.album LIKE :search',
        { search: `%${search}%` }
      )
    }

    if (genre) {
      queryBuilder.andWhere('song.genre = :genre', { genre })
    }

    if (artist) {
      queryBuilder.andWhere('song.artist LIKE :artist', { artist: `%${artist}%` })
    }

    if (album) {
      queryBuilder.andWhere('song.album LIKE :album', { album: `%${album}%` })
    }

    if (year) {
      queryBuilder.andWhere('song.year = :year', { year })
    }

    queryBuilder.orderBy(`song.${sortBy}`, sortOrder)

    const [songs, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: songs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * 获取歌曲详情
   */
  async findOne(id: string) {
    const song = await this.songRepository.findOne({
      where: { id },
      relations: ['uploader'],
    })

    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    return song
  }

  /**
   * 创建歌曲
   */
  async create(createDto: CreateSongDto, uploaderId?: string) {
    const song = this.songRepository.create({
      ...createDto,
      uploaderId,
    })

    return await this.songRepository.save(song)
  }

  /**
   * 更新歌曲信息
   */
  async update(id: string, updateDto: UpdateSongDto) {
    const song = await this.findOne(id)
    
    Object.assign(song, updateDto)
    return await this.songRepository.save(song)
  }

  /**
   * 删除歌曲
   */
  async remove(id: string) {
    const song = await this.findOne(id)
    await this.songRepository.remove(song)
    return { message: '删除成功' }
  }

  /**
   * 批量删除歌曲
   */
  async batchRemove(ids: string[]) {
    const songs = await this.songRepository.findByIds(ids)
    if (songs.length !== ids.length) {
      throw new NotFoundException('部分歌曲不存在')
    }

    await this.songRepository.remove(songs)
    return { message: `成功删除 ${songs.length} 首歌曲` }
  }

  /**
   * 获取歌曲统计信息
   */
  async getStatistics() {
    const totalSongs = await this.songRepository.count()
    const totalPlayCount = await this.songRepository
      .createQueryBuilder('song')
      .select('SUM(song.playCount)', 'total')
      .getRawOne()

    const genreStats = await this.songRepository
      .createQueryBuilder('song')
      .select('song.genre', 'genre')
      .addSelect('COUNT(*)', 'count')
      .where('song.genre IS NOT NULL')
      .groupBy('song.genre')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()

    const artistStats = await this.songRepository
      .createQueryBuilder('song')
      .select('song.artist', 'artist')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(song.playCount)', 'totalPlays')
      .groupBy('song.artist')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()

    const recentUploads = await this.songRepository
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.uploader', 'uploader')
      .select([
        'song.id',
        'song.title',
        'song.artist',
        'song.createdAt',
        'uploader.username',
      ])
      .orderBy('song.createdAt', 'DESC')
      .limit(10)
      .getMany()

    return {
      totalSongs,
      totalPlayCount: parseInt(totalPlayCount?.total || '0'),
      genreStats,
      artistStats,
      recentUploads,
    }
  }

  /**
   * 获取热门歌曲
   */
  async getPopularSongs(limit: number = 20) {
    return await this.songRepository
      .createQueryBuilder('song')
      .leftJoinAndSelect('song.uploader', 'uploader')
      .select([
        'song.id',
        'song.title',
        'song.artist',
        'song.album',
        'song.coverUrl',
        'song.playCount',
        'song.createdAt',
        'uploader.username',
      ])
      .orderBy('song.playCount', 'DESC')
      .limit(limit)
      .getMany()
  }

  /**
   * 更新歌曲播放次数
   */
  async updatePlayCount(id: string, increment: number = 1) {
    await this.songRepository
      .createQueryBuilder()
      .update(Song)
      .set({ playCount: () => `playCount + ${increment}` })
      .where('id = :id', { id })
      .execute()

    return this.findOne(id)
  }
}
