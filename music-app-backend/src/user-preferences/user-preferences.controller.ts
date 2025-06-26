import { Controller, Get, Put, Body, Delete, UseGuards, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserPreferencesService } from './user-preferences.service'
import { UpsertPreferenceDto, BulkUpsertPreferencesDto } from '../dto/user-preferences.dto'

@ApiTags('用户偏好设置')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户偏好设置' })
  async findAll(@CurrentUser('id') userId: string) {
    const preferences = await this.userPreferencesService.findAll(userId)
    return {
      success: true,
      data: preferences,
      message: '获取用户偏好设置成功',
    }
  }

  @Get(':key')
  @ApiOperation({ summary: '获取指定键的用户偏好设置' })
  async findByKey(@CurrentUser('id') userId: string, @Param('key') key: string) {
    const preference = await this.userPreferencesService.findByKey(userId, key)
    return {
      success: true,
      data: preference,
      message: '获取用户偏好设置成功',
    }
  }

  @Put()
  @ApiOperation({ summary: '更新或创建用户偏好设置' })
  async upsert(@CurrentUser('id') userId: string, @Body() dto: UpsertPreferenceDto) {
    const preference = await this.userPreferencesService.upsert(userId, dto)
    return {
      success: true,
      data: preference,
      message: '用户偏好设置已保存',
    }
  }

  @Put('bulk')
  @ApiOperation({ summary: '批量更新或创建用户偏好设置' })
  async bulkUpsert(@CurrentUser('id') userId: string, @Body() dto: BulkUpsertPreferencesDto) {
    const preferences = await this.userPreferencesService.bulkUpsert(userId, dto.preferences)
    return {
      success: true,
      data: preferences,
      message: '用户偏好设置已批量保存',
    }
  }

  @Delete(':key')
  @ApiOperation({ summary: '删除指定键的用户偏好设置' })
  async remove(@CurrentUser('id') userId: string, @Param('key') key: string) {
    await this.userPreferencesService.remove(userId, key)
    return {
      success: true,
      message: '用户偏好设置已删除',
    }
  }

  @Delete()
  @ApiOperation({ summary: '清空所有用户偏好设置' })
  async clearAll(@CurrentUser('id') userId: string) {
    await this.userPreferencesService.clearAll(userId)
    return {
      success: true,
      message: '用户偏好设置已清空',
    }
  }
}
