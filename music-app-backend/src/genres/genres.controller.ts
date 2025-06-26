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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { GenresService } from './genres.service'
import { CreateGenreDto, UpdateGenreDto, QueryGenresDto } from '../dto/genre.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建音乐流派', description: '创建新的音乐流派分类' })
  @ApiBody({ type: CreateGenreDto, description: '流派信息' })
  @ApiResponse({
    status: 201,
    description: '分类创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '流派ID' },
            name: { type: 'string', description: '流派名称' },
            description: { type: 'string', description: '流派描述' },
            isActive: { type: 'boolean', description: '是否激活' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '分类创建成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 409, description: '流派名称已存在' })
  async create(@Body() createGenreDto: CreateGenreDto) {
    const result = await this.genresService.create(createGenreDto)
    return {
      success: true,
      data: result,
      message: '分类创建成功',
    }
  }

  @Get()
  @ApiOperation({ summary: '获取音乐流派列表', description: '获取所有音乐流派，支持分页和筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'isActive', required: false, description: '是否激活', example: true })
  @ApiResponse({
    status: 200,
    description: '获取分类列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '流派ID' },
              name: { type: 'string', description: '流派名称' },
              description: { type: 'string', description: '流派描述' },
              isActive: { type: 'boolean', description: '是否激活' },
              songCount: { type: 'number', description: '歌曲数量' },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            },
          },
        },
        message: { type: 'string', example: '获取分类列表成功' },
      },
    },
  })
  async findAll(@Query() queryDto: QueryGenresDto) {
    const result = await this.genresService.findAll(queryDto)
    return {
      success: true,
      data: result,
      message: '获取分类列表成功',
    }
  }

  @Get('active')
  @ApiOperation({ summary: '获取活跃音乐流派', description: '获取所有激活状态的音乐流派' })
  @ApiResponse({
    status: 200,
    description: '获取活跃分类成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '流派ID' },
              name: { type: 'string', description: '流派名称' },
              description: { type: 'string', description: '流派描述' },
              songCount: { type: 'number', description: '歌曲数量' },
            },
          },
        },
        message: { type: 'string', example: '获取活跃分类成功' },
      },
    },
  })
  async getActive() {
    const result = await this.genresService.getActive()
    return {
      success: true,
      data: result,
      message: '获取活跃分类成功',
    }
  }

  @Get('stats')
  @ApiOperation({ summary: '获取音乐流派统计', description: '获取音乐流派的统计信息' })
  @ApiResponse({
    status: 200,
    description: '获取分类统计成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            totalGenres: { type: 'number', description: '总流派数' },
            activeGenres: { type: 'number', description: '活跃流派数' },
            totalSongs: { type: 'number', description: '总歌曲数' },
            genreDistribution: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: '流派名称' },
                  count: { type: 'number', description: '歌曲数量' },
                },
              },
            },
          },
        },
        message: { type: 'string', example: '获取分类统计成功' },
      },
    },
  })
  async getStats() {
    const result = await this.genresService.getStats()
    return {
      success: true,
      data: result,
      message: '获取分类统计成功',
    }
  }

  @Get('name/:name')
  @ApiOperation({ summary: '根据名称获取音乐流派', description: '根据流派名称获取流派详情' })
  @ApiParam({ name: 'name', description: '流派名称', example: 'pop' })
  @ApiResponse({
    status: 200,
    description: '获取分类详情成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '流派ID' },
            name: { type: 'string', description: '流派名称' },
            description: { type: 'string', description: '流派描述' },
            isActive: { type: 'boolean', description: '是否激活' },
            songCount: { type: 'number', description: '歌曲数量' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
          },
        },
        message: { type: 'string', example: '获取分类详情成功' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '流派不存在' })
  async findByName(@Param('name') name: string) {
    const result = await this.genresService.findByName(name)
    return {
      success: true,
      data: result,
      message: '获取分类详情成功',
    }
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取音乐流派', description: '根据流派ID获取流派详情' })
  @ApiParam({ name: 'id', description: '流派ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: '获取分类详情成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '流派ID' },
            name: { type: 'string', description: '流派名称' },
            description: { type: 'string', description: '流派描述' },
            isActive: { type: 'boolean', description: '是否激活' },
            songCount: { type: 'number', description: '歌曲数量' },
            songs: {
              type: 'array',
              items: { type: 'object', description: '相关歌曲' },
            },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取分类详情成功' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '流派不存在' })
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
