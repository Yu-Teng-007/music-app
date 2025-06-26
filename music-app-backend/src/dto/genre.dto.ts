import { IsString, IsOptional, IsBoolean, IsNumber, IsHexColor } from 'class-validator'
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
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsHexColor()
  color?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class QueryGenresDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC'
}
