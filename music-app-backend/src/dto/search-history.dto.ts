import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'

export class CreateSearchHistoryDto {
  @ApiProperty({
    description: '搜索关键词',
    example: '周杰伦',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  keyword: string

  @ApiProperty({
    description: '搜索类型',
    example: 'song',
    enum: ['song', 'artist', 'album', 'playlist'],
    default: 'song',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchType?: string
}

export class SearchHistoryQueryDto {
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
    description: '搜索类型筛选',
    example: 'song',
    enum: ['song', 'artist', 'album', 'playlist'],
    required: false,
  })
  @IsString()
  @IsOptional()
  searchType?: string
}
