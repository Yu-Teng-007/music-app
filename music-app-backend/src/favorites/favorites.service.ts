import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Favorite } from '../entities/favorite.entity'
import { Song } from '../entities/song.entity'
import { User } from '../entities/user.entity'
import { AddFavoriteDto, QueryFavoritesDto } from '../dto/favorite.dto'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async addFavorite(userId: string, addFavoriteDto: AddFavoriteDto): Promise<Favorite> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 检查歌曲是否存在
    const song = await this.songRepository.findOne({
      where: { id: addFavoriteDto.songId },
    })
    if (!song) {
      throw new NotFoundException('歌曲不存在')
    }

    // 检查是否已经收藏
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        songId: addFavoriteDto.songId,
      },
    })
    if (existingFavorite) {
      throw new ConflictException('歌曲已收藏')
    }

    // 创建收藏记录
    const favorite = this.favoriteRepository.create({
      userId,
      songId: addFavoriteDto.songId,
    })

    return await this.favoriteRepository.save(favorite)
  }

  async removeFavorite(userId: string, songId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        songId,
      },
    })

    if (!favorite) {
      throw new NotFoundException('收藏记录不存在')
    }

    await this.favoriteRepository.remove(favorite)
  }

  async getFavorites(userId: string, queryDto: QueryFavoritesDto) {
    const { page = 1, limit = 20, search } = queryDto
    const skip = (page - 1) * limit

    const queryBuilder = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.song', 'song')
      .where('favorite.userId = :userId', { userId })
      .orderBy('favorite.createdAt', 'DESC')

    if (search) {
      queryBuilder.andWhere(
        '(song.title LIKE :search OR song.artist LIKE :search OR song.album LIKE :search)',
        { search: `%${search}%` }
      )
    }

    const [favorites, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount()

    return {
      data: favorites.map(favorite => favorite.song),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async isFavorite(userId: string, songId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        userId,
        songId,
      },
    })

    return !!favorite
  }

  async getFavoriteCount(userId: string): Promise<number> {
    return await this.favoriteRepository.count({
      where: { userId },
    })
  }
}
