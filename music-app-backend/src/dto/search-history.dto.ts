import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'

export class CreateSearchHistoryDto {
  @ApiProperty({ description: '搜索关键词' })
  @IsString()
  @IsNotEmpty()
  keyword: string
}

export class SearchHistoryQueryDto {
  @ApiProperty({ description: '页码', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number

  @ApiProperty({ description: '每页数量', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number
}
