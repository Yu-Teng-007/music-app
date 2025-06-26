import { Controller, Get, Post, Body, Delete, UseGuards, Query, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { SearchHistoryService } from './search-history.service'
import { CreateSearchHistoryDto, SearchHistoryQueryDto } from '../dto/search-history.dto'

@ApiTags('search-history')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @ApiOperation({ summary: '添加搜索历史', description: '保存用户的搜索关键词' })
  @ApiBody({ type: CreateSearchHistoryDto, description: '搜索历史信息' })
  @ApiResponse({
    status: 201,
    description: '搜索历史已保存',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '搜索历史ID' },
            userId: { type: 'string', description: '用户ID' },
            keyword: { type: 'string', description: '搜索关键词' },
            searchType: { type: 'string', description: '搜索类型' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          },
        },
        message: { type: 'string', example: '搜索历史已保存' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiOperation({ summary: '获取搜索历史列表', description: '获取用户的搜索历史记录' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'searchType', required: false, description: '搜索类型' })
  @ApiResponse({
    status: 200,
    description: '获取搜索历史成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '搜索历史ID' },
              keyword: { type: 'string', description: '搜索关键词' },
              searchType: { type: 'string', description: '搜索类型' },
              searchCount: { type: 'number', description: '搜索次数' },
              lastSearchAt: { type: 'string', format: 'date-time', description: '最后搜索时间' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
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
        message: { type: 'string', example: '获取搜索历史成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiOperation({ summary: '删除搜索历史', description: '删除指定的搜索历史记录' })
  @ApiParam({
    name: 'id',
    description: '搜索历史ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '搜索历史已删除',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '搜索历史已删除' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '搜索历史不存在' })
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
