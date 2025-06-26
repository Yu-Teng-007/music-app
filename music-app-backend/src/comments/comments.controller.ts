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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger'

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建评论' })
  create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, createCommentDto)
  }

  @Get()
  @ApiOperation({ summary: '获取评论列表' })
  findAll(@Query() queryDto: QueryCommentsDto) {
    return this.commentsService.findAll(queryDto)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个评论' })
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
