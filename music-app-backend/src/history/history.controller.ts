import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { HistoryService } from './history.service'
import { CreateHistoryDto, UpdateHistoryDto, HistoryQueryDto } from '../dto/history.dto'

@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: '添加播放记录', description: '记录用户播放歌曲的历史' })
  @ApiBody({ type: CreateHistoryDto, description: '播放记录信息' })
  @ApiResponse({
    status: 201,
    description: '播放记录已添加',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '记录ID' },
            userId: { type: 'string', description: '用户ID' },
            songId: { type: 'string', description: '歌曲ID' },
            song: { type: 'object', description: '歌曲信息' },
            playedAt: { type: 'string', format: 'date-time', description: '播放时间' },
            duration: { type: 'number', description: '播放时长（秒）' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          },
        },
        message: { type: 'string', example: '播放记录已添加' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async create(@CurrentUser('id') userId: string, @Body() createHistoryDto: CreateHistoryDto) {
    const history = await this.historyService.create(userId, createHistoryDto)
    return {
      success: true,
      data: history,
      message: '播放记录已添加',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取播放历史列表', description: '获取用户的播放历史记录，支持分页' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({
    status: 200,
    description: '获取播放历史成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '记录ID' },
              song: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: '歌曲ID' },
                  title: { type: 'string', description: '歌曲标题' },
                  artist: { type: 'string', description: '艺术家' },
                  album: { type: 'string', description: '专辑名称' },
                  coverUrl: { type: 'string', description: '封面图片URL' },
                },
              },
              playedAt: { type: 'string', format: 'date-time', description: '播放时间' },
              duration: { type: 'number', description: '播放时长（秒）' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', description: '当前页码' },
            limit: { type: 'number', description: '每页数量' },
            total: { type: 'number', description: '总数量' },
            totalPages: { type: 'number', description: '总页数' },
          },
        },
        message: { type: 'string', example: '获取播放历史成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async findAll(@CurrentUser('id') userId: string, @Query() query: HistoryQueryDto) {
    const result = await this.historyService.findAll(userId, query)
    return {
      success: true,
      data: result.items,
      meta: result.meta,
      message: '获取播放历史成功',
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取播放历史详情' })
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    const history = await this.historyService.findOne(userId, id)
    return {
      success: true,
      data: history,
      message: '获取播放历史详情成功',
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新播放历史' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateHistoryDto: UpdateHistoryDto
  ) {
    const history = await this.historyService.update(userId, id, updateHistoryDto)
    return {
      success: true,
      data: history,
      message: '播放历史已更新',
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除播放历史' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.historyService.remove(userId, id)
    return {
      success: true,
      message: '播放历史已删除',
    }
  }

  @Delete()
  @ApiOperation({ summary: '清空播放历史' })
  async clearAll(@CurrentUser('id') userId: string) {
    await this.historyService.clearAll(userId)
    return {
      success: true,
      message: '播放历史已清空',
    }
  }
}
