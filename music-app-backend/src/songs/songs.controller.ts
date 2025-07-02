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
  ParseUUIDPipe,
  Request,
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
import { SongsService } from './songs.service'
import { CreateSongDto, UpdateSongDto, QuerySongsDto } from '../dto/song.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    phone: string
    username: string
  }
}

@ApiTags('songs')
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建歌曲', description: '创建新的歌曲记录' })
  @ApiBody({ type: CreateSongDto, description: '歌曲信息' })
  @ApiResponse({
    status: 201,
    description: '歌曲创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '歌曲ID' },
            title: { type: 'string', description: '歌曲标题' },
            artist: { type: 'string', description: '艺术家' },
            album: { type: 'string', description: '专辑名称' },
            duration: { type: 'number', description: '时长（秒）' },
            fileUrl: { type: 'string', description: '音频文件URL' },
            coverUrl: { type: 'string', description: '封面图片URL' },
            genre: { type: 'object', description: '音乐流派' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '歌曲创建成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async create(@Request() req: AuthenticatedRequest, @Body() createSongDto: CreateSongDto) {
    // 自动设置上传者ID为当前用户
    const songData = {
      ...createSongDto,
      uploaderId: req.user.id,
    }
    const result = await this.songsService.create(songData)
    return {
      success: true,
      data: result,
      message: '歌曲创建成功',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取歌曲列表', description: '分页获取歌曲列表，支持搜索和筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键词，可搜索歌曲标题、艺术家、专辑等',
    example: '周杰伦',
  })
  @ApiQuery({ name: 'genre', required: false, description: '音乐流派筛选', example: 'pop' })
  @ApiQuery({ name: 'artist', required: false, description: '艺术家筛选', example: '周杰伦' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'artist', 'playCount', 'duration'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: '获取歌曲列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              album: { type: 'string', description: '专辑名称' },
              duration: { type: 'number', description: '时长（秒）' },
              fileUrl: { type: 'string', description: '音频文件URL' },
              coverUrl: { type: 'string', description: '封面图片URL' },
              genre: { type: 'object', description: '音乐流派' },
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
        message: { type: 'string', example: '获取歌曲列表成功' },
      },
    },
  })
  async findAll(@Query() queryDto: QuerySongsDto) {
    const result = await this.songsService.findAll(queryDto)
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: '获取歌曲列表成功',
    }
  }

  @Get('recommended')
  @ApiOperation({ summary: '获取推荐歌曲', description: '获取系统推荐的歌曲列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '获取推荐歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              album: { type: 'string', description: '专辑名称' },
              duration: { type: 'number', description: '时长（秒）' },
              fileUrl: { type: 'string', description: '音频文件URL' },
              coverUrl: { type: 'string', description: '封面图片URL' },
            },
          },
        },
        message: { type: 'string', example: '获取推荐歌曲成功' },
      },
    },
  })
  async getRecommended(@Query('limit') limit?: number) {
    const result = await this.songsService.getRecommended(limit)
    return {
      success: true,
      data: result,
      message: '获取推荐歌曲成功',
    }
  }

  @Get('popular')
  @ApiOperation({ summary: '获取热门歌曲', description: '获取热门歌曲列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '获取热门歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              playCount: { type: 'number', description: '播放次数' },
            },
          },
        },
        message: { type: 'string', example: '获取热门歌曲成功' },
      },
    },
  })
  async getPopular(@Query('limit') limit?: number) {
    const result = await this.songsService.getPopular(limit)
    return {
      success: true,
      data: result,
      message: '获取热门歌曲成功',
    }
  }

  @Get('search')
  @ApiOperation({ summary: '搜索歌曲', description: '根据关键词搜索歌曲' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', example: '周杰伦' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '搜索歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              album: { type: 'string', description: '专辑名称' },
            },
          },
        },
        message: { type: 'string', example: '搜索歌曲成功' },
      },
    },
  })
  async search(@Query('keyword') keyword: string, @Query('limit') limit?: number) {
    const result = await this.songsService.searchSongs(keyword, limit)
    return {
      success: true,
      data: result,
      message: '搜索歌曲成功',
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取歌曲统计信息', description: '获取歌曲相关的统计数据' })
  @ApiResponse({
    status: 200,
    description: '获取统计信息成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalSongs: { type: 'number', description: '总歌曲数' },
            totalArtists: { type: 'number', description: '总艺术家数' },
            totalGenres: { type: 'number', description: '总流派数' },
            totalPlayTime: { type: 'number', description: '总播放时长' },
          },
        },
        message: { type: 'string', example: '获取统计信息成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async getStats() {
    const result = await this.songsService.getStats()
    return {
      success: true,
      data: result,
      message: '获取统计信息成功',
    }
  }

  @Get('genre/:genre')
  @ApiOperation({ summary: '按流派获取歌曲', description: '根据音乐流派获取歌曲列表' })
  @ApiParam({ name: 'genre', description: '音乐流派', example: 'pop' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '获取分类歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              genre: { type: 'object', description: '音乐流派' },
            },
          },
        },
        message: { type: 'string', example: '获取分类歌曲成功' },
      },
    },
  })
  async getByGenre(@Param('genre') genre: string, @Query('limit') limit?: number) {
    const result = await this.songsService.getByGenre(genre, limit)
    return {
      success: true,
      data: result,
      message: '获取分类歌曲成功',
    }
  }

  @Get('artist/:artist')
  @ApiOperation({ summary: '按艺术家获取歌曲', description: '根据艺术家获取歌曲列表' })
  @ApiParam({ name: 'artist', description: '艺术家名称', example: '周杰伦' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  @ApiResponse({
    status: 200,
    description: '获取艺术家歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              album: { type: 'string', description: '专辑名称' },
            },
          },
        },
        message: { type: 'string', example: '获取艺术家歌曲成功' },
      },
    },
  })
  async getByArtist(@Param('artist') artist: string, @Query('limit') limit?: number) {
    const result = await this.songsService.getByArtist(artist, limit)
    return {
      success: true,
      data: result,
      message: '获取艺术家歌曲成功',
    }
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取我的歌曲', description: '获取当前用户上传的歌曲列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键词',
    example: '歌曲名',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'artist', 'playCount', 'duration'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: '获取我的歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '歌曲ID' },
              title: { type: 'string', description: '歌曲标题' },
              artist: { type: 'string', description: '艺术家' },
              album: { type: 'string', description: '专辑名称' },
              duration: { type: 'number', description: '时长（秒）' },
              coverUrl: { type: 'string', description: '封面图片URL' },
              audioUrl: { type: 'string', description: '音频文件URL' },
              playCount: { type: 'number', description: '播放次数' },
              createdAt: { type: 'string', description: '创建时间' },
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
        message: { type: 'string', example: '获取我的歌曲成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async getMySongs(@Request() req: AuthenticatedRequest, @Query() queryDto: QuerySongsDto) {
    const result = await this.songsService.getUserSongs(req.user.id, queryDto)
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: '获取我的歌曲成功',
    }
  }

  @Get('my/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取我的歌曲统计', description: '获取当前用户上传歌曲的统计信息' })
  @ApiResponse({
    status: 200,
    description: '获取统计信息成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalSongs: { type: 'number', description: '总歌曲数' },
            totalPlays: { type: 'number', description: '总播放量' },
            totalLikes: { type: 'number', description: '总收藏数' },
          },
        },
        message: { type: 'string', example: '获取统计信息成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  async getMyStats(@Request() req: AuthenticatedRequest) {
    const result = await this.songsService.getUserSongStats(req.user.id)
    return {
      success: true,
      data: result,
      message: '获取统计信息成功',
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '获取歌曲详情', description: '根据ID获取歌曲的详细信息' })
  @ApiParam({ name: 'id', description: '歌曲ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: '获取歌曲详情成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '歌曲ID' },
            title: { type: 'string', description: '歌曲标题' },
            artist: { type: 'string', description: '艺术家' },
            album: { type: 'string', description: '专辑名称' },
            duration: { type: 'number', description: '时长（秒）' },
            fileUrl: { type: 'string', description: '音频文件URL' },
            coverUrl: { type: 'string', description: '封面图片URL' },
            genre: { type: 'object', description: '音乐流派' },
            playCount: { type: 'number', description: '播放次数' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取歌曲详情成功' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.songsService.findOne(id)
    return {
      success: true,
      data: result,
      message: '获取歌曲详情成功',
    }
  }

  @Post(':id/play')
  @ApiOperation({ summary: '播放歌曲', description: '播放指定歌曲并增加播放次数' })
  @ApiParam({ name: 'id', description: '歌曲ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: '播放歌曲成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '歌曲ID' },
            title: { type: 'string', description: '歌曲标题' },
            artist: { type: 'string', description: '艺术家' },
            fileUrl: { type: 'string', description: '音频文件URL' },
            playCount: { type: 'number', description: '播放次数' },
          },
        },
        message: { type: 'string', example: '播放歌曲成功' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async play(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.songsService.findOneAndPlay(id)
    return {
      success: true,
      data: result,
      message: '播放歌曲成功',
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新歌曲信息', description: '更新指定歌曲的信息' })
  @ApiParam({ name: 'id', description: '歌曲ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateSongDto, description: '更新的歌曲信息' })
  @ApiResponse({
    status: 200,
    description: '歌曲更新成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '歌曲ID' },
            title: { type: 'string', description: '歌曲标题' },
            artist: { type: 'string', description: '艺术家' },
            album: { type: 'string', description: '专辑名称' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '歌曲更新成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSongDto: UpdateSongDto) {
    const result = await this.songsService.update(id, updateSongDto)
    return {
      success: true,
      data: result,
      message: '歌曲更新成功',
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除歌曲', description: '删除指定的歌曲' })
  @ApiParam({ name: 'id', description: '歌曲ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: '歌曲删除成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '歌曲删除成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.songsService.remove(id)
    return {
      success: true,
      message: '歌曲删除成功',
    }
  }
}
