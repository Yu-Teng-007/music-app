import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Genre } from '../entities/genre.entity'
import { CreateGenreDto, UpdateGenreDto, QueryGenresDto } from '../dto/genre.dto'

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>
  ) {}

  async create(createGenreDto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create(createGenreDto)
    return await this.genreRepository.save(genre)
  }

  async findAll(queryDto: QueryGenresDto = {}): Promise<Genre[]> {
    const { isActive, sortBy = 'sortOrder', sortOrder = 'ASC' } = queryDto

    const queryBuilder = this.genreRepository.createQueryBuilder('genre')

    // 过滤条件
    if (isActive !== undefined) {
      queryBuilder.where('genre.isActive = :isActive', { isActive })
    }

    // 排序
    queryBuilder.orderBy(`genre.${sortBy}`, sortOrder)

    return await queryBuilder.getMany()
  }

  async findOne(id: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { id } })

    if (!genre) {
      throw new NotFoundException('分类不存在')
    }

    return genre
  }

  async findByName(name: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({ where: { name } })

    if (!genre) {
      throw new NotFoundException('分类不存在')
    }

    return genre
  }

  async getActive(): Promise<Genre[]> {
    return await this.genreRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    })
  }

  async update(id: string, updateGenreDto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id)

    Object.assign(genre, updateGenreDto)
    return await this.genreRepository.save(genre)
  }

  async remove(id: string): Promise<void> {
    const genre = await this.findOne(id)
    await this.genreRepository.remove(genre)
  }

  async getStats() {
    const total = await this.genreRepository.count()
    const active = await this.genreRepository.count({ where: { isActive: true } })
    const inactive = total - active

    return {
      total,
      active,
      inactive,
    }
  }
}
