import { IsString, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'

export class CreateHistoryDto {
  @ApiProperty({
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  songId: string
}

export class UpdateHistoryDto {
  @ApiProperty({
    description: '播放次数',
    example: 5,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  playCount?: number

  @ApiProperty({
    description: '最后播放时间',
    example: '2023-12-01T10:30:00Z',
    format: 'date-time',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastPlayedAt?: Date
}

export class HistoryQueryDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number

  @ApiProperty({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number

  @ApiProperty({
    description: '搜索关键词，可搜索歌曲标题、艺术家等',
    example: '周杰伦',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string
}
