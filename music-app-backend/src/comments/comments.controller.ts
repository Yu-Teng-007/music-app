import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto, UpdateCommentDto, QueryCommentsDto } from '../dto/comment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建评论', description: '为歌曲创建评论' })
  @ApiBody({ type: CreateCommentDto, description: '评论信息' })
  @ApiResponse({
    status: 201,
    description: '评论创建成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '评论ID' },
            content: { type: 'string', description: '评论内容' },
            songId: { type: 'string', description: '歌曲ID' },
            userId: { type: 'string', description: '用户ID' },
            user: { type: 'object', description: '用户信息' },
            song: { type: 'object', description: '歌曲信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '评论创建成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  @ApiResponse({ status: 404, description: '歌曲不存在' })
  create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, createCommentDto)
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表', description: '获取评论列表，支持分页和筛选' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'songId', required: false, description: '歌曲ID' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '获取评论列表成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '评论ID' },
              content: { type: 'string', description: '评论内容' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: '用户ID' },
                  username: { type: 'string', description: '用户名' },
                  avatar: { type: 'string', description: '头像URL' },
                },
              },
              song: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: '歌曲ID' },
                  title: { type: 'string', description: '歌曲标题' },
                  artist: { type: 'string', description: '艺术家' },
                },
              },
              createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            },
          },
        },
        message: { type: 'string', example: '获取评论列表成功' },
      },
    },
  })
  findAll(@Query() queryDto: QueryCommentsDto) {
    return this.commentsService.findAll(queryDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个评论', description: '根据ID获取评论详情' })
  @ApiParam({ name: 'id', description: '评论ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: '获取评论详情成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '评论ID' },
            content: { type: 'string', description: '评论内容' },
            user: { type: 'object', description: '用户信息' },
            song: { type: 'object', description: '歌曲信息' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取评论详情成功' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '评论不存在' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新评论' })
  update(@Request() req, @Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, req.user.id, updateCommentDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  remove(@Request() req, @Param('id') id: string) {
    return this.commentsService.remove(id, req.user.id)
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞评论' })
  likeComment(@Param('id') id: string) {
    return this.commentsService.likeComment(id)
  }
}
