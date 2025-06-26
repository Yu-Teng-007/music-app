import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { History } from '../entities/history.entity'
import { CreateHistoryDto, UpdateHistoryDto, HistoryQueryDto } from '../dto/history.dto'

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>
  ) {}

  async create(userId: string, createHistoryDto: CreateHistoryDto): Promise<History> {
    // 检查是否已存在该用户对该歌曲的播放记录
    const existingHistory = await this.historyRepository.findOne({
      where: {
        userId,
        songId: createHistoryDto.songId,
      },
    })

    if (existingHistory) {
      // 如果已存在，更新播放次数和最后播放时间
      existingHistory.playCount += 1
      existingHistory.lastPlayedAt = new Date()
      return this.historyRepository.save(existingHistory)
    }

    // 如果不存在，创建新记录
    const history = this.historyRepository.create({
      userId,
      songId: createHistoryDto.songId,
      playCount: 1,
      lastPlayedAt: new Date(),
    })

    return this.historyRepository.save(history)
  }

  async findAll(userId: string, query: HistoryQueryDto) {
    const { page = 1, limit = 10, search } = query
    const skip = (page - 1) * limit

    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.song', 'song')
      .where('history.userId = :userId', { userId })
      .orderBy('history.lastPlayedAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (search) {
      queryBuilder.andWhere('song.title LIKE :search', { search: `%${search}%` })
    }

    const [items, total] = await queryBuilder.getManyAndCount()

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(userId: string, id: string): Promise<History> {
    const history = await this.historyRepository.findOne({
      where: { id, userId },
      relations: ['song'],
    })

    if (!history) {
      throw new NotFoundException('播放记录不存在')
    }

    return history
  }

  async update(userId: string, id: string, updateHistoryDto: UpdateHistoryDto): Promise<History> {
    const history = await this.findOne(userId, id)

    if (updateHistoryDto.playCount !== undefined) {
      history.playCount = updateHistoryDto.playCount
    }

    if (updateHistoryDto.lastPlayedAt) {
      history.lastPlayedAt = updateHistoryDto.lastPlayedAt
    }

    return this.historyRepository.save(history)
  }

  async remove(userId: string, id: string): Promise<void> {
    const history = await this.findOne(userId, id)
    await this.historyRepository.remove(history)
  }

  async clearAll(userId: string): Promise<void> {
    await this.historyRepository.delete({ userId })
  }
}
