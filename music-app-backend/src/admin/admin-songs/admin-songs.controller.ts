import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AdminSongsService } from './admin-songs.service'
import { CreateSongDto, UpdateSongDto, SongQueryParams } from '../../dto'
import { AdminJwtAuthGuard } from '../admin-auth/admin-jwt-auth.guard'
import { AdminPermissionGuard } from '../admin-auth/admin-permission.guard'
import { AdminPermissions } from '../admin-auth/admin-permissions.decorator'

@ApiTags('admin-songs')
@Controller('admin/songs')
@UseGuards(AdminJwtAuthGuard, AdminPermissionGuard)
@ApiBearerAuth('JWT-auth')
export class AdminSongsController {
  constructor(private readonly adminSongsService: AdminSongsService) {}

  @Get()
  @AdminPermissions('admin:song:list')
  @ApiOperation({ summary: '获取歌曲列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async findAll(@Query() query: SongQueryParams) {
    const result = await this.adminSongsService.findAll(query)
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      message: '获取成功',
    }
  }

  @Get('statistics')
  @AdminPermissions('admin:song:statistics')
  @ApiOperation({ summary: '获取歌曲统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getStatistics() {
    const result = await this.adminSongsService.getStatistics()
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get('popular')
  @AdminPermissions('admin:song:list')
  @ApiOperation({ summary: '获取热门歌曲' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async getPopularSongs(@Query('limit') limit?: number) {
    const result = await this.adminSongsService.getPopularSongs(limit)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Get(':id')
  @AdminPermissions('admin:song:detail')
  @ApiOperation({ summary: '获取歌曲详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async findOne(@Param('id') id: string) {
    const result = await this.adminSongsService.findOne(id)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Post()
  @AdminPermissions('admin:song:create')
  @ApiOperation({ summary: '创建歌曲' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createDto: CreateSongDto) {
    const result = await this.adminSongsService.create(createDto)
    return {
      success: true,
      data: result,
      message: '创建成功',
    }
  }

  @Patch(':id')
  @AdminPermissions('admin:song:update')
  @ApiOperation({ summary: '更新歌曲信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateSongDto) {
    const result = await this.adminSongsService.update(id, updateDto)
    return {
      success: true,
      data: result,
      message: '更新成功',
    }
  }

  @Delete(':id')
  @AdminPermissions('admin:song:delete')
  @ApiOperation({ summary: '删除歌曲' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async remove(@Param('id') id: string) {
    const result = await this.adminSongsService.remove(id)
    return {
      success: true,
      message: result.message,
    }
  }

  @Post('batch-delete')
  @AdminPermissions('admin:song:delete')
  @ApiOperation({ summary: '批量删除歌曲' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '部分歌曲不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async batchRemove(@Body('ids') ids: string[]) {
    const result = await this.adminSongsService.batchRemove(ids)
    return {
      success: true,
      message: result.message,
    }
  }

  @Post(':id/play-count')
  @AdminPermissions('admin:song:update')
  @ApiOperation({ summary: '更新歌曲播放次数' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async updatePlayCount(@Param('id') id: string, @Body('increment') increment?: number) {
    const result = await this.adminSongsService.updatePlayCount(id, increment)
    return {
      success: true,
      data: result,
      message: '更新成功',
    }
  }
}
