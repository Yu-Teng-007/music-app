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

  async findAll(userId: string, queryDto: QueryPlaylistsDto) {
    const { search, isPrivate } = queryDto

    const queryBuilder = this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.songs', 'songs')

    // 只显示用户自己的播放列表或公开的播放列表
    queryBuilder.where('(playlist.userId = :userId OR playlist.isPrivate = false)', { userId })

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
    return await this.playlistRepository.find({
      where: { userId },
      relations: ['songs'],
      order: { createdAt: 'DESC' },
    })
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
    return await this.playlistRepository
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.songs', 'songs')
      .where('playlist.isPrivate = false')
      .orderBy('COUNT(songs.id)', 'DESC')
      .groupBy('playlist.id')
      .limit(limit)
      .getMany()
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
}
