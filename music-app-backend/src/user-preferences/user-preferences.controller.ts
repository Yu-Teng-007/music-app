import { Controller, Get, Put, Body, Delete, UseGuards, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserPreferencesService } from './user-preferences.service'
import { UpsertPreferenceDto, BulkUpsertPreferencesDto } from '../dto/user-preferences.dto'

@ApiTags('user-preferences')
@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有用户偏好设置', description: '获取当前用户的所有偏好设置' })
  @ApiResponse({
    status: 200,
    description: '获取用户偏好设置成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '偏好设置ID' },
              key: { type: 'string', description: '设置键名' },
              value: { type: 'string', description: '设置值' },
              description: { type: 'string', description: '设置描述' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
              updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
            },
          },
        },
        message: { type: 'string', example: '获取用户偏好设置成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async findAll(@CurrentUser('id') userId: string) {
    const preferences = await this.userPreferencesService.findAll(userId)
    return {
      success: true,
      data: preferences,
      message: '获取用户偏好设置成功',
    }
  }

  @Get(':key')
  @ApiOperation({ summary: '获取指定键的用户偏好设置', description: '根据键名获取特定的偏好设置' })
  @ApiParam({ name: 'key', description: '设置键名', example: 'theme' })
  @ApiResponse({
    status: 200,
    description: '获取用户偏好设置成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '偏好设置ID' },
            key: { type: 'string', description: '设置键名' },
            value: { type: 'string', description: '设置值' },
            description: { type: 'string', description: '设置描述' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取用户偏好设置成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '偏好设置不存在' })
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
