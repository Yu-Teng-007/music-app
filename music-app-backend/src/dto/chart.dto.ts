import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateChartDto {
  @ApiProperty({
    description: '排行榜名称',
    example: '新歌榜',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: '排行榜类型',
    example: 'new',
    enum: ['new', 'hot', 'trending', 'original', 'kpop', 'electronic', 'folk', 'ancient', 'mv'],
  })
  @IsString()
  type: string

  @ApiProperty({
    description: '排行榜描述',
    example: '最新发布的热门歌曲，每小时更新',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: '排行榜封面图片URL',
    example: 'https://example.com/chart-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string

  @ApiProperty({
    description: '更新频率',
    example: '每小时更新',
    default: '每日更新',
    required: false,
  })
  @IsOptional()
  @IsString()
  updateFrequency?: string

  @ApiProperty({
    description: '是否激活',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    description: '排序顺序',
    example: 1,
    minimum: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number
}

export class UpdateChartDto {
  @ApiProperty({
    description: '排行榜名称',
    example: '新歌榜',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: '排行榜类型',
    example: 'new',
    enum: ['new', 'hot', 'trending', 'original', 'kpop', 'electronic', 'folk', 'ancient', 'mv'],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string

  @ApiProperty({
    description: '排行榜描述',
    example: '最新发布的热门歌曲，每小时更新',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: '排行榜封面图片URL',
    example: 'https://example.com/chart-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  coverUrl?: string

  @ApiProperty({
    description: '更新频率',
    example: '每小时更新',
    required: false,
  })
  @IsOptional()
  @IsString()
  updateFrequency?: string

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    description: '排序顺序',
    example: 1,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number
}

export class QueryChartsDto {
  @ApiProperty({
    description: '排行榜类型筛选',
    example: 'new',
    enum: ['new', 'hot', 'trending', 'original', 'kpop', 'electronic', 'folk', 'ancient', 'mv'],
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string

  @ApiProperty({
    description: '是否只显示激活的排行榜',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    description: '搜索关键词',
    example: '新歌',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
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
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiProperty({
    description: '排序字段',
    example: 'sortOrder',
    enum: ['sortOrder', 'name', 'createdAt', 'type'],
    default: 'sortOrder',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder'

  @ApiProperty({
    description: '排序方向',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC'
}

export class AddSongToChartDto {
  @ApiProperty({
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  songId: string

  @ApiProperty({
    description: '在排行榜中的位置',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  position?: number
}
