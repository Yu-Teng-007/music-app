import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatePlaylistDto {
  @ApiProperty({
    description: '歌单名称',
    example: '我的最爱',
  })
  @IsString({ message: '播放列表名称必须是字符串' })
  name: string

  @ApiProperty({
    description: '歌单描述',
    example: '收藏的经典歌曲',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string

  @ApiProperty({
    description: '封面图片URL',
    example: 'https://example.com/playlist-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  coverUrl?: string

  @ApiProperty({
    description: '是否为私有歌单',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean = false
}

export class UpdatePlaylistDto {
  @ApiProperty({
    description: '歌单名称',
    example: '我的最爱',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '播放列表名称必须是字符串' })
  name?: string

  @ApiProperty({
    description: '歌单描述',
    example: '收藏的经典歌曲',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string

  @ApiProperty({
    description: '封面图片URL',
    example: 'https://example.com/playlist-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  coverUrl?: string

  @ApiProperty({
    description: '是否为私有歌单',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean
}

export class AddSongToPlaylistDto {
  @ApiProperty({
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: '歌曲ID格式不正确' })
  songId: string
}

export class QueryPlaylistsDto {
  @ApiProperty({
    description: '搜索关键词',
    example: '我的最爱',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string

  @ApiProperty({
    description: '是否为私有歌单',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean

  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  page?: number

  @ApiProperty({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number
}
