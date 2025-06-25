import { IsString, IsOptional, IsBoolean, IsNumber, IsHexColor } from 'class-validator'

export class CreateGenreDto {
  @IsString()
  name: string

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
