import { Controller, Get, Post, Body, Delete, UseGuards, Query, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { SearchHistoryService } from './search-history.service'
import { CreateSearchHistoryDto, SearchHistoryQueryDto } from '../dto/search-history.dto'

@ApiTags('搜索历史')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @ApiOperation({ summary: '添加搜索历史' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createSearchHistoryDto: CreateSearchHistoryDto
  ) {
    const searchHistory = await this.searchHistoryService.create(userId, createSearchHistoryDto)
    return {
      success: true,
      data: searchHistory,
      message: '搜索历史已保存',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取搜索历史列表' })
  async findAll(@CurrentUser('id') userId: string, @Query() query: SearchHistoryQueryDto) {
    const result = await this.searchHistoryService.findAll(userId, query)
    return {
      success: true,
      data: result.items,
      meta: result.meta,
      message: '获取搜索历史成功',
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除搜索历史' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.searchHistoryService.remove(userId, id)
    return {
      success: true,
      message: '搜索历史已删除',
    }
  }

  @Delete()
  @ApiOperation({ summary: '清空搜索历史' })
  async clearAll(@CurrentUser('id') userId: string) {
    await this.searchHistoryService.clearAll(userId)
    return {
      success: true,
      message: '搜索历史已清空',
    }
  }
}
