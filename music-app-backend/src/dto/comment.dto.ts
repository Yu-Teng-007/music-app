import { IsNotEmpty, IsString, IsUUID, IsOptional, IsInt, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCommentDto {
  @ApiProperty({
    description: '评论内容',
    example: '这首歌真的很好听！',
    minLength: 1,
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  content: string

  @ApiProperty({
    description: '歌曲ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  songId: string
}

export class UpdateCommentDto {
  @ApiProperty({
    description: '评论内容',
    example: '修改后的评论内容',
    required: false,
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  content?: string
}

export class QueryCommentsDto {
  @ApiProperty({
    description: '歌曲ID，用于筛选特定歌曲的评论',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  songId?: string

  @ApiProperty({
    description: '用户ID，用于筛选特定用户的评论',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @ApiProperty({
    description: '每页数量',
    example: 20,
    minimum: 1,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number
}
