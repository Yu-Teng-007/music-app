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
import { GenresService } from './genres.service'
import { CreateGenreDto, UpdateGenreDto, QueryGenresDto } from '../dto/genre.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createGenreDto: CreateGenreDto) {
    const result = await this.genresService.create(createGenreDto)
    return {
      success: true,
      data: result,
      message: '分类创建成功',
    }
  }

  @Get()
  async findAll(@Query() queryDto: QueryGenresDto) {
    const result = await this.genresService.findAll(queryDto)
    return {
      success: true,
      data: result,
      message: '获取分类列表成功',
    }
  }

  @Get('active')
  async getActive() {
    const result = await this.genresService.getActive()
    return {
      success: true,
      data: result,
      message: '获取活跃分类成功',
    }
  }

  @Get('stats')
  async getStats() {
    const result = await this.genresService.getStats()
    return {
      success: true,
      data: result,
      message: '获取分类统计成功',
    }
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string) {
    const result = await this.genresService.findByName(name)
    return {
      success: true,
      data: result,
      message: '获取分类详情成功',
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.genresService.findOne(id)
    return {
      success: true,
      data: result,
      message: '获取分类详情成功',
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateGenreDto: UpdateGenreDto) {
    const result = await this.genresService.update(id, updateGenreDto)
    return {
      success: true,
      data: result,
      message: '分类更新成功',
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.genresService.remove(id)
    return {
      success: true,
      message: '分类删除成功',
    }
  }
}
