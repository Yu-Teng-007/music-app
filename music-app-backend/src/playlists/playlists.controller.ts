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

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: AuthenticatedRequest, @Body() createPlaylistDto: CreatePlaylistDto) {
    const result = await this.playlistsService.create(req.user.id, createPlaylistDto)
    return {
      success: true,
      data: result,
      message: '播放列表创建成功',
    }
  }

  @Get()
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
  async findUserPlaylists(@Request() req: AuthenticatedRequest) {
    const result = await this.playlistsService.findUserPlaylists(req.user.id)
    return {
      success: true,
      data: result,
      message: '获取我的播放列表成功',
    }
  }

  @Get('public')
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
