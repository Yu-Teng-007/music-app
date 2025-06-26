import { IsString, IsUUID, IsOptional, IsNumber, IsDate } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'

export class CreateHistoryDto {
  @ApiProperty({ description: '歌曲ID' })
  @IsUUID()
  songId: string
}

export class UpdateHistoryDto {
  @ApiProperty({ description: '播放次数', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  playCount?: number

  @ApiProperty({ description: '最后播放时间', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastPlayedAt?: Date
}

export class HistoryQueryDto {
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

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  search?: string
}
