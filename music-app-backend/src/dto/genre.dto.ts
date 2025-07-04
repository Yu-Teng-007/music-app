import { IsString, IsOptional, IsBoolean, IsNumber, IsHexColor, Min, Max } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateGenreDto {
  @ApiProperty({
    description: '流派名称',
    example: 'pop',
  })
  @IsString()
  name: string

  @ApiProperty({
    description: '流派描述',
    example: '流行音乐',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: '流派主题色',
    example: '#FF5722',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color?: string

  @ApiProperty({
    description: '流派图标',
    example: 'music-note',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string

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
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class UpdateGenreDto {
  @ApiProperty({
    description: '流派名称',
    example: 'pop',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: '流派描述',
    example: '流行音乐',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: '流派主题色',
    example: '#FF5722',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color?: string

  @ApiProperty({
    description: '流派图标',
    example: 'music-note',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string

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
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class QueryGenresDto {
  @ApiProperty({
    description: '是否只显示激活的流派',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    description: '搜索关键词',
    example: 'pop',
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
    enum: ['sortOrder', 'name', 'createdAt'],
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
