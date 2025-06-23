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
} from '@nestjs/common'
import { SongsService } from './songs.service'
import { CreateSongDto, UpdateSongDto, QuerySongsDto } from '../dto/song.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createSongDto: CreateSongDto) {
    const result = await this.songsService.create(createSongDto)
    return {
      success: true,
      data: result,
      message: '歌曲创建成功',
    }
  }

  @Get()
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
  async getRecommended(@Query('limit') limit?: number) {
    const result = await this.songsService.getRecommended(limit)
    return {
      success: true,
      data: result,
      message: '获取推荐歌曲成功',
    }
  }

  @Get('popular')
  async getPopular(@Query('limit') limit?: number) {
    const result = await this.songsService.getPopular(limit)
    return {
      success: true,
      data: result,
      message: '获取热门歌曲成功',
    }
  }

  @Get('search')
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
  async getStats() {
    const result = await this.songsService.getStats()
    return {
      success: true,
      data: result,
      message: '获取统计信息成功',
    }
  }

  @Get('genre/:genre')
  async getByGenre(@Param('genre') genre: string, @Query('limit') limit?: number) {
    const result = await this.songsService.getByGenre(genre, limit)
    return {
      success: true,
      data: result,
      message: '获取分类歌曲成功',
    }
  }

  @Get('artist/:artist')
  async getByArtist(@Param('artist') artist: string, @Query('limit') limit?: number) {
    const result = await this.songsService.getByArtist(artist, limit)
    return {
      success: true,
      data: result,
      message: '获取艺术家歌曲成功',
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.songsService.findOne(id)
    return {
      success: true,
      data: result,
      message: '获取歌曲详情成功',
    }
  }

  @Post(':id/play')
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
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.songsService.remove(id)
    return {
      success: true,
      message: '歌曲删除成功',
    }
  }
}
