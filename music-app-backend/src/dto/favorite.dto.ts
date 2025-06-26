import { IsUUID, IsNotEmpty, IsOptional, IsNumber, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class AddFavoriteDto {
  @ApiProperty({
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  songId: string
}

export class QueryFavoritesDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiProperty({
    description: '每页数量',
    example: 20,
    minimum: 1,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  @Min(1)
  limit?: number = 20

  @ApiProperty({
    description: '搜索关键词',
    example: '周杰伦',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string
}
