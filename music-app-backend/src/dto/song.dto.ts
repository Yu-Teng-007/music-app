import { IsString, IsNumber, IsOptional, Min, Max, IsUrl } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateSongDto {
  @ApiProperty({
    description: '歌曲标题',
    example: '青花瓷',
  })
  @IsString({ message: '歌曲标题必须是字符串' })
  title: string

  @ApiProperty({
    description: '艺术家',
    example: '周杰伦',
  })
  @IsString({ message: '艺术家必须是字符串' })
  artist: string

  @ApiProperty({
    description: '专辑名称',
    example: '我很忙',
  })
  @IsString({ message: '专辑名必须是字符串' })
  album: string

  @ApiProperty({
    description: '歌曲时长（秒）',
    example: 240,
    minimum: 1,
  })
  @IsNumber({}, { message: '持续时间必须是数字' })
  @Min(1, { message: '持续时间必须大于0' })
  duration: number

  @ApiProperty({
    description: '封面图片URL',
    example: 'https://example.com/cover.jpg',
    format: 'url',
  })
  @IsUrl({ require_tld: false }, { message: '封面URL格式不正确' })
  coverUrl: string

  @ApiProperty({
    description: '音频文件URL',
    example: 'https://example.com/audio.mp3',
    format: 'url',
  })
  @IsUrl({ require_tld: false }, { message: '音频URL格式不正确' })
  audioUrl: string

  @ApiProperty({
    description: '音乐流派',
    example: 'pop',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @ApiProperty({
    description: '发行年份',
    example: 2007,
    minimum: 1900,
    maximum: new Date().getFullYear(),
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '年份必须是数字' })
  @Min(1900, { message: '年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '年份不能超过当前年份' })
  year?: number

  @ApiProperty({
    description: '歌词',
    example: '素胚勾勒出青花笔锋浓转淡...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '歌词必须是字符串' })
  lyrics?: string

  @ApiProperty({
    description: '文件大小（字节）',
    example: 5242880,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '文件大小必须是数字' })
  @Min(1, { message: '文件大小必须大于0' })
  fileSize?: number

  @ApiProperty({
    description: '原始文件名',
    example: 'qinghuaci.mp3',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '原始文件名必须是字符串' })
  originalFileName?: string

  @ApiProperty({
    description: '上传者ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '上传者ID必须是字符串' })
  uploaderId?: string
}

export class UpdateSongDto {
  @ApiProperty({
    description: '歌曲标题',
    example: '青花瓷（修改版）',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '歌曲标题必须是字符串' })
  title?: string

  @ApiProperty({
    description: '艺术家',
    example: '周杰伦',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '艺术家必须是字符串' })
  artist?: string

  @ApiProperty({
    description: '专辑名称',
    example: '我很忙',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '专辑名必须是字符串' })
  album?: string

  @ApiProperty({
    description: '歌曲时长（秒）',
    example: 240,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '持续时间必须是数字' })
  @Min(1, { message: '持续时间必须大于0' })
  duration?: number

  @ApiProperty({
    description: '歌曲封面图片URL',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: '封面URL格式不正确' })
  coverUrl?: string

  @ApiProperty({
    description: '音乐流派',
    example: 'pop',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @ApiProperty({
    description: '发行年份',
    example: 2023,
    minimum: 1900,
    maximum: new Date().getFullYear(),
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '年份必须是数字' })
  @Min(1900, { message: '年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '年份不能超过当前年份' })
  year?: number

  @ApiProperty({
    description: '歌词内容',
    example: '青花瓷的歌词内容...',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '歌词必须是字符串' })
  lyrics?: string
}

export class QuerySongsDto {
  @ApiProperty({
    description: '搜索关键词，可搜索歌曲标题、艺术家、专辑等',
    example: '周杰伦',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string

  @ApiProperty({
    description: '音乐流派筛选',
    example: 'pop',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @ApiProperty({
    description: '艺术家筛选',
    example: '周杰伦',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '艺术家必须是字符串' })
  artist?: string

  @ApiProperty({
    description: '上传者ID筛选',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '上传者ID必须是字符串' })
  uploaderId?: string

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
  page?: number = 1

  @ApiProperty({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 20

  @ApiProperty({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'artist', 'playCount', 'duration'],
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt'

  @ApiProperty({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC'
}
