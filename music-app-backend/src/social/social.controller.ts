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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SocialService } from './social.service'
import {
  CreateFeedDto,
  UpdateFeedDto,
  FeedQueryDto,
  FollowQueryDto,
  CreateFeedCommentDto,
  UpdateFeedCommentDto,
  CommentQueryDto,
  SocialStatsDto,
} from '../dto'

@ApiTags('social')
@Controller('social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // 关注相关接口
  @Post('follow/:userId')
  @ApiOperation({ summary: '关注用户' })
  @ApiResponse({ status: 201, description: '关注成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async followUser(@Param('userId') userId: string, @Request() req) {
    return await this.socialService.followUser(req.user.id, userId)
  }

  @Delete('follow/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '取消关注用户' })
  @ApiResponse({ status: 204, description: '取消关注成功' })
  @ApiResponse({ status: 404, description: '未关注该用户' })
  async unfollowUser(@Param('userId') userId: string, @Request() req) {
    await this.socialService.unfollowUser(req.user.id, userId)
  }

  @Get('follow/check/:userId')
  @ApiOperation({ summary: '检查是否关注用户' })
  @ApiResponse({ status: 200, description: '检查结果' })
  async checkFollowing(@Param('userId') userId: string, @Request() req) {
    const isFollowing = await this.socialService.isFollowing(req.user.id, userId)
    return { isFollowing }
  }

  @Get('following/:userId')
  @ApiOperation({ summary: '获取用户关注列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFollowing(@Param('userId') userId: string, @Query() query: FollowQueryDto) {
    return await this.socialService.getFollowing(userId, query)
  }

  @Get('followers/:userId')
  @ApiOperation({ summary: '获取用户粉丝列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFollowers(@Param('userId') userId: string, @Query() query: FollowQueryDto) {
    return await this.socialService.getFollowers(userId, query)
  }

  // 动态相关接口
  @Post('feeds')
  @ApiOperation({ summary: '发布动态' })
  @ApiResponse({ status: 201, description: '发布成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createFeed(@Body() createFeedDto: CreateFeedDto, @Request() req) {
    return await this.socialService.createFeed(createFeedDto, req.user.id)
  }

  @Get('feeds')
  @ApiOperation({ summary: '获取动态列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFeeds(@Query() query: FeedQueryDto, @Request() req) {
    return await this.socialService.getFeeds(query, req.user.id)
  }

  @Get('feeds/user/:userId')
  @ApiOperation({ summary: '获取用户动态列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserFeeds(@Param('userId') userId: string, @Query() query: FeedQueryDto) {
    return await this.socialService.getFeeds({ ...query, userId })
  }

  @Delete('feeds/:feedId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除动态' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权限删除' })
  @ApiResponse({ status: 404, description: '动态不存在' })
  async deleteFeed(@Param('feedId') feedId: string, @Request() req) {
    await this.socialService.deleteFeed(feedId, req.user.id)
  }

  // 点赞相关接口
  @Post('feeds/:feedId/like')
  @ApiOperation({ summary: '点赞动态' })
  @ApiResponse({ status: 201, description: '点赞成功' })
  @ApiResponse({ status: 400, description: '已经点赞过' })
  @ApiResponse({ status: 404, description: '动态不存在' })
  async likeFeed(@Param('feedId') feedId: string, @Request() req) {
    return await this.socialService.likeFeed(feedId, req.user.id)
  }

  @Delete('feeds/:feedId/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '取消点赞动态' })
  @ApiResponse({ status: 204, description: '取消点赞成功' })
  @ApiResponse({ status: 404, description: '未点赞该动态' })
  async unlikeFeed(@Param('feedId') feedId: string, @Request() req) {
    await this.socialService.unlikeFeed(feedId, req.user.id)
  }

  // 统计相关接口
  @Get('stats/:userId')
  @ApiOperation({ summary: '获取用户社交统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: SocialStatsDto })
  async getSocialStats(@Param('userId') userId: string): Promise<SocialStatsDto> {
    return await this.socialService.getSocialStats(userId)
  }

  @Get('stats/me')
  @ApiOperation({ summary: '获取我的社交统计' })
  @ApiResponse({ status: 200, description: '获取成功', type: SocialStatsDto })
  async getMySocialStats(@Request() req): Promise<SocialStatsDto> {
    return await this.socialService.getSocialStats(req.user.id)
  }
}
