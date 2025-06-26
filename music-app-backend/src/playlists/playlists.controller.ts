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
  Request,
  ParseUUIDPipe,
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
import { PlaylistsService } from './playlists.service'
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddSongToPlaylistDto,
  QueryPlaylistsDto,
} from '../dto/playlist.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    username: string
  }
}

interface OptionalAuthRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
  }
}

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建歌单', description: '创建新的歌单' })
  @ApiBody({ type: CreatePlaylistDto, description: '歌单信息' })
  @ApiResponse({
    status: 201,
    description: '播放列表创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '歌单ID' },
            name: { type: 'string', description: '歌单名称' },
            description: { type: 'string', description: '歌单描述' },
            coverUrl: { type: 'string', description: '封面图片URL' },
            isPublic: { type: 'boolean', description: '是否公开' },
            userId: { type: 'string', description: '创建者ID' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '播放列表创建成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async create(@Request() req: AuthenticatedRequest, @Body() createPlaylistDto: CreatePlaylistDto) {
    const result = await this.playlistsService.create(req.user.id, createPlaylistDto)
    return {
      success: true,
      data: result,
      message: '播放列表创建成功',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取歌单列表', description: '获取歌单列表，支持分页和筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'isPublic', required: false, description: '是否公开', example: true })
  @ApiResponse({
    status: 200,
    description: '获取播放列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌单ID' },
              name: { type: 'string', description: '歌单名称' },
              description: { type: 'string', description: '歌单描述' },
              coverUrl: { type: 'string', description: '封面图片URL' },
              isPublic: { type: 'boolean', description: '是否公开' },
              songCount: { type: 'number', description: '歌曲数量' },
              user: { type: 'object', description: '创建者信息' },
            },
          },
        },
        message: { type: 'string', example: '获取播放列表成功' },
      },
    },
  })
  async findAll(@Query() queryDto: QueryPlaylistsDto, @Request() req: OptionalAuthRequest) {
    // 如果用户已登录，传递用户ID，否则只显示公开播放列表
    const userId = req.user?.id
    const result = await this.playlistsService.findAll(userId, queryDto)
    return {
      success: true,
      data: result,
      message: '获取播放列表成功',
    }
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取我的歌单', description: '获取当前用户创建的所有歌单' })
  @ApiResponse({
    status: 200,
    description: '获取我的播放列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌单ID' },
              name: { type: 'string', description: '歌单名称' },
              description: { type: 'string', description: '歌单描述' },
              coverUrl: { type: 'string', description: '封面图片URL' },
              isPublic: { type: 'boolean', description: '是否公开' },
              songCount: { type: 'number', description: '歌曲数量' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            },
          },
        },
        message: { type: 'string', example: '获取我的播放列表成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async findUserPlaylists(@Request() req: AuthenticatedRequest) {
    const result = await this.playlistsService.findUserPlaylists(req.user.id)
    return {
      success: true,
      data: result,
      message: '获取我的播放列表成功',
    }
  }

  @Get('public')
  @ApiOperation({ summary: '获取公开歌单', description: '获取所有公开的歌单' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '获取公开播放列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌单ID' },
              name: { type: 'string', description: '歌单名称' },
              description: { type: 'string', description: '歌单描述' },
              coverUrl: { type: 'string', description: '封面图片URL' },
              songCount: { type: 'number', description: '歌曲数量' },
              user: { type: 'object', description: '创建者信息' },
            },
          },
        },
        message: { type: 'string', example: '获取公开播放列表成功' },
      },
    },
  })
  async getPublicPlaylists(@Query('limit') limit?: number) {
    const result = await this.playlistsService.getPublicPlaylists(limit)
    return {
      success: true,
      data: result,
      message: '获取公开播放列表成功',
    }
  }

  @Get('recommended')
  async getRecommendedPlaylists(@Query('limit') limit?: number) {
    const result = await this.playlistsService.getRecommendedPlaylists(limit)
    return {
      success: true,
      data: result,
      message: '获取推荐播放列表成功',
    }
  }

  @Get('search')
  async searchPlaylists(@Query('keyword') keyword: string, @Query('limit') limit?: number) {
    const result = await this.playlistsService.searchPlaylists(keyword, limit)
    return {
      success: true,
      data: result,
      message: '搜索播放列表成功',
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: OptionalAuthRequest) {
    const userId = req.user?.id
    const result = await this.playlistsService.findOne(id, userId)
    return {
      success: true,
      data: result,
      message: '获取播放列表详情成功',
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Body() updatePlaylistDto: UpdatePlaylistDto
  ) {
    const result = await this.playlistsService.update(id, req.user.id, updatePlaylistDto)
    return {
      success: true,
      data: result,
      message: '播放列表更新成功',
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: AuthenticatedRequest) {
    await this.playlistsService.remove(id, req.user.id)
    return {
      success: true,
      message: '播放列表删除成功',
    }
  }

  @Post(':id/songs')
  @UseGuards(JwtAuthGuard)
  async addSong(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
    @Body() addSongDto: AddSongToPlaylistDto
  ) {
    const result = await this.playlistsService.addSong(id, req.user.id, addSongDto)
    return {
      success: true,
      data: result,
      message: '歌曲添加成功',
    }
  }

  @Delete(':id/songs/:songId')
  @UseGuards(JwtAuthGuard)
  async removeSong(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('songId', ParseUUIDPipe) songId: string,
    @Request() req: AuthenticatedRequest
  ) {
    const result = await this.playlistsService.removeSong(id, songId, req.user.id)
    return {
      success: true,
      data: result,
      message: '歌曲移除成功',
    }
  }
}
