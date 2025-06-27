import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserPreference } from '../../entities/user-preference.entity'
import { UpsertPreferenceDto } from '../../dto/user-preferences.dto'

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private userPreferenceRepository: Repository<UserPreference>
  ) {}

  async upsert(userId: string, dto: UpsertPreferenceDto): Promise<UserPreference> {
    // 查找是否已存在该键的偏好设置
    const existingPreference = await this.userPreferenceRepository.findOne({
      where: {
        userId,
        key: dto.key,
      },
    })

    if (existingPreference) {
      // 如果存在，更新值
      existingPreference.value = dto.value
      return this.userPreferenceRepository.save(existingPreference)
    }

    // 如果不存在，创建新记录
    const preference = this.userPreferenceRepository.create({
      userId,
      key: dto.key,
      value: dto.value,
    })

    return this.userPreferenceRepository.save(preference)
  }

  async bulkUpsert(userId: string, dtos: UpsertPreferenceDto[]): Promise<UserPreference[]> {
    const results: UserPreference[] = []

    for (const dto of dtos) {
      const preference = await this.upsert(userId, dto)
      results.push(preference)
    }

    return results
  }

  async findAll(userId: string): Promise<UserPreference[]> {
    return this.userPreferenceRepository.find({
      where: { userId },
      order: { key: 'ASC' },
    })
  }

  async findByKey(userId: string, key: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findOne({
      where: { userId, key },
    })
  }

  async remove(userId: string, key: string): Promise<void> {
    await this.userPreferenceRepository.delete({ userId, key })
  }

  async clearAll(userId: string): Promise<void> {
    await this.userPreferenceRepository.delete({ userId })
  }
}
