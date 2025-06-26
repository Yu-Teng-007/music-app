import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { FavoritesService } from './favorites.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddFavoriteDto, QueryFavoritesDto } from '../dto/favorite.dto'

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    username: string
  }
}

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '添加收藏', description: '将歌曲添加到用户收藏列表' })
  @ApiBody({ type: AddFavoriteDto, description: '收藏信息' })
  @ApiResponse({
    status: 201,
    description: '收藏成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '收藏记录ID' },
            userId: { type: 'string', description: '用户ID' },
            songId: { type: 'string', description: '歌曲ID' },
            song: { type: 'object', description: '歌曲信息' },
            createdAt: { type: 'string', format: 'date-time', description: '收藏时间' },
          },
        },
        message: { type: 'string', example: '收藏成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误或歌曲已收藏' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async addFavorite(@Request() req: AuthenticatedRequest, @Body() addFavoriteDto: AddFavoriteDto) {
    const result = await this.favoritesService.addFavorite(req.user.id, addFavoriteDto)
    return {
      success: true,
      data: result,
      message: '收藏成功',
    }
  }

  @Delete(':songId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '取消收藏', description: '从用户收藏列表中移除歌曲' })
  @ApiParam({
    name: 'songId',
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '取消收藏成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '取消收藏成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '收藏记录不存在' })
  async removeFavorite(@Request() req: AuthenticatedRequest, @Param('songId') songId: string) {
    await this.favoritesService.removeFavorite(req.user.id, songId)
    return {
      success: true,
      message: '取消收藏成功',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取收藏列表', description: '获取用户的收藏歌曲列表，支持分页' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({
    status: 200,
    description: '获取收藏列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '收藏记录ID' },
              song: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: '歌曲ID' },
                  title: { type: 'string', description: '歌曲标题' },
                  artist: { type: 'string', description: '艺术家' },
                  album: { type: 'string', description: '专辑名称' },
                  duration: { type: 'number', description: '时长（秒）' },
                  coverUrl: { type: 'string', description: '封面图片URL' },
                },
              },
              createdAt: { type: 'string', format: 'date-time', description: '收藏时间' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', description: '当前页码' },
            limit: { type: 'number', description: '每页数量' },
            total: { type: 'number', description: '总数量' },
            totalPages: { type: 'number', description: '总页数' },
          },
        },
        message: { type: 'string', example: '获取收藏列表成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async getFavorites(@Request() req: AuthenticatedRequest, @Query() queryDto: QueryFavoritesDto) {
    const result = await this.favoritesService.getFavorites(req.user.id, queryDto)
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: '获取收藏列表成功',
    }
  }

  @Get('check/:songId')
  async checkFavorite(@Request() req: AuthenticatedRequest, @Param('songId') songId: string) {
    const isFavorite = await this.favoritesService.isFavorite(req.user.id, songId)
    return {
      success: true,
      data: { isFavorite },
      message: '检查收藏状态成功',
    }
  }

  @Get('count')
  async getFavoriteCount(@Request() req: AuthenticatedRequest) {
    const count = await this.favoritesService.getFavoriteCount(req.user.id)
    return {
      success: true,
      data: { count },
      message: '获取收藏数量成功',
    }
  }
}
