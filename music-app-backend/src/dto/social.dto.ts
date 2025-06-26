import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FeedType } from '../entities/user-feed.entity'

// 关注用户DTO
export class FollowUserDto {
  @ApiProperty({ description: '要关注的用户ID' })
  @IsUUID()
  userId: string
}

// 创建动态DTO
export class CreateFeedDto {
  @ApiProperty({ description: '动态类型', enum: FeedType })
  @IsEnum(FeedType)
  type: FeedType

  @ApiPropertyOptional({ description: '动态内容' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ description: '相关歌曲ID' })
  @IsOptional()
  @IsUUID()
  songId?: string

  @ApiPropertyOptional({ description: '相关歌单ID' })
  @IsOptional()
  @IsUUID()
  playlistId?: string

  @ApiPropertyOptional({ description: '目标用户ID' })
  @IsOptional()
  @IsUUID()
  targetUserId?: string

  @ApiPropertyOptional({ description: '额外元数据' })
  @IsOptional()
  metadata?: any
}

// 更新动态DTO
export class UpdateFeedDto {
  @ApiPropertyOptional({ description: '动态内容' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ description: '是否可见' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean
}

// 动态查询DTO
export class FeedQueryDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ description: '动态类型', enum: FeedType })
  @IsOptional()
  @IsEnum(FeedType)
  type?: FeedType

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({ description: '排序方向', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'
}

// 关注列表查询DTO
export class FollowQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string
}

// 动态评论DTO
export class CreateFeedCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  content: string

  @ApiPropertyOptional({ description: '回复的评论ID' })
  @IsOptional()
  @IsUUID()
  replyToId?: string
}

// 更新评论DTO
export class UpdateFeedCommentDto {
  @ApiPropertyOptional({ description: '评论内容' })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ description: '是否可见' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean
}

// 评论查询DTO
export class CommentQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20

  @ApiPropertyOptional({ description: '排序方向', default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC'
}

// 社交统计DTO
export class SocialStatsDto {
  @ApiProperty({ description: '关注数' })
  followingCount: number

  @ApiProperty({ description: '粉丝数' })
  followerCount: number

  @ApiProperty({ description: '动态数' })
  feedCount: number

  @ApiProperty({ description: '获赞数' })
  totalLikes: number
}
