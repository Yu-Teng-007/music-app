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
import { FavoritesService } from './favorites.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AddFavoriteDto, QueryFavoritesDto } from '../dto/favorite.dto'

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addFavorite(@Request() req, @Body() addFavoriteDto: AddFavoriteDto) {
    const result = await this.favoritesService.addFavorite(req.user.id, addFavoriteDto)
    return {
      success: true,
      data: result,
      message: '收藏成功',
    }
  }

  @Delete(':songId')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(@Request() req, @Param('songId') songId: string) {
    await this.favoritesService.removeFavorite(req.user.id, songId)
    return {
      success: true,
      message: '取消收藏成功',
    }
  }

  @Get()
  async getFavorites(@Request() req, @Query() queryDto: QueryFavoritesDto) {
    const result = await this.favoritesService.getFavorites(req.user.id, queryDto)
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: '获取收藏列表成功',
    }
  }

  @Get('check/:songId')
  async checkFavorite(@Request() req, @Param('songId') songId: string) {
    const isFavorite = await this.favoritesService.isFavorite(req.user.id, songId)
    return {
      success: true,
      data: { isFavorite },
      message: '检查收藏状态成功',
    }
  }

  @Get('count')
  async getFavoriteCount(@Request() req) {
    const count = await this.favoritesService.getFavoriteCount(req.user.id)
    return {
      success: true,
      data: { count },
      message: '获取收藏数量成功',
    }
  }
}
