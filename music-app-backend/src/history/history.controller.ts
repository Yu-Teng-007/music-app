import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { HistoryService } from './history.service'
import { CreateHistoryDto, UpdateHistoryDto, HistoryQueryDto } from '../dto/history.dto'

@ApiTags('播放历史')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: '添加播放记录' })
  async create(@CurrentUser('id') userId: string, @Body() createHistoryDto: CreateHistoryDto) {
    const history = await this.historyService.create(userId, createHistoryDto)
    return {
      success: true,
      data: history,
      message: '播放记录已添加',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取播放历史列表' })
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
