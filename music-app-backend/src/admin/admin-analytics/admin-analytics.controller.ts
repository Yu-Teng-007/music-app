import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { AdminAnalyticsService } from './admin-analytics.service'
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt-auth.guard'
import { AdminPermissionGuard } from '../admin-auth/admin-permission.guard'
import { AdminPermissions } from '../admin-auth/admin-permissions.decorator'

@ApiTags('admin-analytics')
@Controller('admin/analytics')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
@ApiBearerAuth('JWT-auth')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get('overview')
  @AdminPermissions('admin:analytics:overview')
  @ApiOperation({ summary: '获取总体统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getOverviewStats() {
    const result = await this.adminAnalyticsService.getOverviewStats()
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('user-growth')
  @AdminPermissions('admin:analytics:user')
  @ApiOperation({ summary: '获取用户增长趋势' })
  @ApiQuery({ name: 'days', required: false, description: '天数', example: 30 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getUserGrowthTrend(@Query('days') days?: number) {
    const result = await this.adminAnalyticsService.getUserGrowthTrend(days)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('play-trend')
  @AdminPermissions('admin:analytics:play')
  @ApiOperation({ summary: '获取播放趋势' })
  @ApiQuery({ name: 'days', required: false, description: '天数', example: 30 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getPlayTrend(@Query('days') days?: number) {
    const result = await this.adminAnalyticsService.getPlayTrend(days)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('popular-genres')
  @AdminPermissions('admin:analytics:content')
  @ApiOperation({ summary: '获取热门音乐类型' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量', example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getPopularGenres(@Query('limit') limit?: number) {
    const result = await this.adminAnalyticsService.getPopularGenres(limit)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('popular-artists')
  @AdminPermissions('admin:analytics:content')
  @ApiOperation({ summary: '获取热门艺术家' })
  @ApiQuery({ name: 'limit', required: false, description: '限制数量', example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getPopularArtists(@Query('limit') limit?: number) {
    const result = await this.adminAnalyticsService.getPopularArtists(limit)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('user-activity')
  @AdminPermissions('admin:analytics:user')
  @ApiOperation({ summary: '获取用户活跃度分析' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getUserActivityAnalysis() {
    const result = await this.adminAnalyticsService.getUserActivityAnalysis()
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('content-stats')
  @AdminPermissions('admin:analytics:content')
  @ApiOperation({ summary: '获取内容统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getContentStats() {
    const result = await this.adminAnalyticsService.getContentStats()
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }
}
