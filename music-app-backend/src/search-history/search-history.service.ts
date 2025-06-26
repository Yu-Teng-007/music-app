import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SearchHistory } from '../entities/search-history.entity'
import { CreateSearchHistoryDto, SearchHistoryQueryDto } from '../dto/search-history.dto'

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>
  ) {}

  async create(
    userId: string,
    createSearchHistoryDto: CreateSearchHistoryDto
  ): Promise<SearchHistory> {
    // 检查是否已有相同关键词的搜索记录
    const existingRecord = await this.searchHistoryRepository.findOne({
      where: {
        userId,
        keyword: createSearchHistoryDto.keyword,
      },
    })

    // 如果已存在，删除旧记录
    if (existingRecord) {
      await this.searchHistoryRepository.remove(existingRecord)
    }

    // 创建新记录（保持最新的搜索记录在最前面）
    const searchHistory = this.searchHistoryRepository.create({
      userId,
      keyword: createSearchHistoryDto.keyword,
    })

    return this.searchHistoryRepository.save(searchHistory)
  }

  async findAll(userId: string, query: SearchHistoryQueryDto) {
    const { page = 1, limit = 10 } = query
    const skip = (page - 1) * limit

    const [items, total] = await this.searchHistoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    })

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

  async remove(userId: string, id: string): Promise<void> {
    await this.searchHistoryRepository.delete({ id, userId })
  }

  async clearAll(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ userId })
  }
}
