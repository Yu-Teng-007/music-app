import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Song } from '../entities/song.entity'
import { CreateSongDto, UpdateSongDto, QuerySongsDto } from '../dto/song.dto'

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {}

  async create(createSongDto: CreateSongDto): Promise<Song> {
    const song = this.songRepository.create(createSongDto)
    return await this.songRepository.save(song)
  }

  async findAll(queryDto: QuerySongsDto) {
    const {
      search,
      genre,
      artist,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto

    const queryBuilder = this.songRepository.createQueryBuilder('song')

    // 搜索条件
    if (search) {
      queryBuilder.where(
        '(song.title LIKE :search OR song.artist LIKE :search OR song.album LIKE :search)',
        { search: `%${search}%` }
      )
    }

    // 筛选条件
    if (genre) {
      queryBuilder.andWhere('song.genre = :genre', { genre })
    }

    if (artist) {
      queryBuilder.andWhere('song.artist LIKE :artist', {
        artist: `%${artist}%`,
      })
    }

    // 排序
    queryBuilder.orderBy(`song.${sortBy}`, sortOrder)

    // 分页
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [songs, total] = await queryBuilder.getManyAndCount()

    return {
      data: songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Song> {
    const song = await this.songRepository.findOne({ where: { id } })

    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    return song
  }

  async findOneAndPlay(id: string): Promise<Song> {
    const song = await this.songRepository.findOne({ where: { id } })

    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    // 增加播放次数
    song.playCount = Number(song.playCount) + 1
    await this.songRepository.save(song)

    return song
  }

  async update(id: string, updateSongDto: UpdateSongDto): Promise<Song> {
    const song = await this.findOne(id)

    Object.assign(song, updateSongDto)
    return await this.songRepository.save(song)
  }

  async remove(id: string): Promise<void> {
    const song = await this.findOne(id)
    await this.songRepository.remove(song)
  }

  async getRecommended(limit: number = 10): Promise<Song[]> {
    return await this.songRepository.find({
      order: { playCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    })
  }

  async getPopular(limit: number = 10): Promise<Song[]> {
    return await this.songRepository.find({
      order: { playCount: 'DESC' },
      take: limit,
    })
  }

  async getByGenre(genre: string, limit: number = 20): Promise<Song[]> {
    return await this.songRepository.find({
      where: { genre },
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async getByArtist(artist: string, limit: number = 20): Promise<Song[]> {
    return await this.songRepository.find({
      where: { artist: Like(`%${artist}%`) },
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async searchSongs(keyword: string, limit: number = 20): Promise<Song[]> {
    return await this.songRepository.find({
      where: [
        { title: Like(`%${keyword}%`) },
        { artist: Like(`%${keyword}%`) },
        { album: Like(`%${keyword}%`) },
      ],
      order: { playCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    })
  }

  async incrementPlayCount(id: string): Promise<void> {
    await this.songRepository.increment({ id }, 'playCount', 1)
  }

  async getStats() {
    const totalSongs = await this.songRepository.count()
    const totalPlaysResult = await this.songRepository
      .createQueryBuilder('song')
      .select('SUM(song.playCount)', 'total')
      .getRawOne()

    const topGenres = await this.songRepository
      .createQueryBuilder('song')
      .select('song.genre', 'genre')
      .addSelect('COUNT(*)', 'count')
      .where('song.genre IS NOT NULL')
      .groupBy('song.genre')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()

    const topArtists = await this.songRepository
      .createQueryBuilder('song')
      .select('song.artist', 'artist')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(song.playCount)', 'totalPlays')
      .groupBy('song.artist')
      .orderBy('totalPlays', 'DESC')
      .limit(10)
      .getRawMany()

    return {
      totalSongs,
      totalPlays: totalPlaysResult?.total || 0,
      topGenres,
      topArtists,
    }
  }
}
