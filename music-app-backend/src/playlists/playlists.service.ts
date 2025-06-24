import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Playlist } from '../entities/playlist.entity'
import { Song } from '../entities/song.entity'
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddSongToPlaylistDto,
  QueryPlaylistsDto,
} from '../dto/playlist.dto'

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>
  ) {}

  async create(userId: string, createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = this.playlistRepository.create({
      ...createPlaylistDto,
      userId,
    })
    return await this.playlistRepository.save(playlist)
  }

  async findAll(userId: string | undefined, queryDto: QueryPlaylistsDto) {
    const { search, isPrivate } = queryDto

    const queryBuilder = this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.songs', 'songs')

    // 如果用户已登录，显示用户自己的播放列表或公开的播放列表
    // 如果用户未登录，只显示公开的播放列表
    if (userId) {
      queryBuilder.where('(playlist.userId = :userId OR playlist.isPrivate = false)', { userId })
    } else {
      queryBuilder.where('playlist.isPrivate = false')
    }

    if (search) {
      queryBuilder.andWhere('playlist.name LIKE :search', {
        search: `%${search}%`,
      })
    }

    if (isPrivate !== undefined) {
      queryBuilder.andWhere('playlist.isPrivate = :isPrivate', { isPrivate })
    }

    queryBuilder.orderBy('playlist.createdAt', 'DESC')

    return await queryBuilder.getMany()
  }

  async findUserPlaylists(userId: string): Promise<Playlist[]> {
    const playlists = await this.playlistRepository.find({
      where: { userId },
      relations: ['songs'],
      order: { createdAt: 'DESC' },
    })

    // 如果用户没有歌单，创建默认歌单
    if (playlists.length === 0) {
      await this.createDefaultPlaylists(userId)
      // 重新获取歌单列表
      return await this.playlistRepository.find({
        where: { userId },
        relations: ['songs'],
        order: { createdAt: 'DESC' },
      })
    }

    return playlists
  }

  async findOne(id: string, userId?: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['user', 'songs'],
    })

    if (!playlist) {
      throw new NotFoundException('播放列表不存在')
    }

    // 检查权限：如果是私有播放列表，只有创建者可以访问
    if (playlist.isPrivate && playlist.userId !== userId) {
      throw new ForbiddenException('无权访问此播放列表')
    }

    return playlist
  }

  async update(
    id: string,
    userId: string,
    updatePlaylistDto: UpdatePlaylistDto
  ): Promise<Playlist> {
    const playlist = await this.findOne(id, userId)

    // 检查权限：只有创建者可以修改
    if (playlist.userId !== userId) {
      throw new ForbiddenException('无权修改此播放列表')
    }

    Object.assign(playlist, updatePlaylistDto)
    return await this.playlistRepository.save(playlist)
  }

  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findOne(id, userId)

    // 检查权限：只有创建者可以删除
    if (playlist.userId !== userId) {
      throw new ForbiddenException('无权删除此播放列表')
    }

    await this.playlistRepository.remove(playlist)
  }

  async addSong(id: string, userId: string, addSongDto: AddSongToPlaylistDto): Promise<Playlist> {
    const playlist = await this.findOne(id, userId)

    // 检查权限：只有创建者可以添加歌曲
    if (playlist.userId !== userId) {
      throw new ForbiddenException('无权修改此播放列表')
    }

    const song = await this.songRepository.findOne({
      where: { id: addSongDto.songId },
    })
    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    // 检查歌曲是否已在播放列表中
    const existingSong = playlist.songs.find(s => s.id === song.id)
    if (existingSong) {
      throw new ForbiddenException('歌曲已在播放列表中')
    }

    playlist.songs.push(song)
    return await this.playlistRepository.save(playlist)
  }

  async removeSong(id: string, songId: string, userId: string): Promise<Playlist> {
    const playlist = await this.findOne(id, userId)

    // 检查权限：只有创建者可以移除歌曲
    if (playlist.userId !== userId) {
      throw new ForbiddenException('无权修改此播放列表')
    }

    playlist.songs = playlist.songs.filter(song => song.id !== songId)
    return await this.playlistRepository.save(playlist)
  }

  async getPublicPlaylists(limit: number = 20): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      where: { isPrivate: false },
      relations: ['user', 'songs'],
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async getRecommendedPlaylists(limit: number = 10): Promise<Playlist[]> {
    // 获取包含歌曲最多的公开播放列表
    // 首先获取按歌曲数量排序的播放列表ID
    const playlistIds = await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoin('playlist.songs', 'songs')
      .where('playlist.isPrivate = false')
      .groupBy('playlist.id')
      .orderBy('COUNT(songs.id)', 'DESC')
      .addOrderBy('playlist.createdAt', 'DESC') // 添加第二排序条件
      .limit(limit)
      .select('playlist.id')
      .getRawMany()

    if (playlistIds.length === 0) {
      return []
    }

    // 然后根据ID获取完整的播放列表信息，保持原有的排序
    const ids = playlistIds.map(item => item.playlist_id)
    const playlists = await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.songs', 'songs')
      .where('playlist.id IN (:...ids)', { ids })
      .getMany()

    // 手动按照原始排序重新排列结果
    const playlistMap = new Map(playlists.map(p => [p.id, p]))
    return ids
      .map(id => playlistMap.get(id))
      .filter((playlist): playlist is Playlist => playlist !== undefined)
  }

  async searchPlaylists(keyword: string, limit: number = 20): Promise<Playlist[]> {
    return await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.songs', 'songs')
      .where('playlist.isPrivate = false')
      .andWhere('(playlist.name LIKE :keyword OR playlist.description LIKE :keyword)', {
        keyword: `%${keyword}%`,
      })
      .orderBy('playlist.createdAt', 'DESC')
      .limit(limit)
      .getMany()
  }

  // 为用户创建默认歌单
  async createDefaultPlaylists(userId: string): Promise<void> {
    const defaultPlaylists = [
      {
        name: '我喜欢的',
        description: '收藏您最喜欢的歌曲',
        isPrivate: true,
        isDefault: true,
        coverUrl: 'https://picsum.photos/400/400?random=999',
      },
      {
        name: '默认歌单',
        description: '您的第一个歌单',
        isPrivate: false,
        isDefault: true,
        coverUrl: 'https://picsum.photos/400/400?random=998',
      },
    ]

    for (const playlistData of defaultPlaylists) {
      const playlist = this.playlistRepository.create({
        ...playlistData,
        userId,
        songs: [],
      })
      await this.playlistRepository.save(playlist)
    }
  }
}
