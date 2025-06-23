import { IsUUID, IsNotEmpty, IsOptional, IsNumber, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class AddFavoriteDto {
  @IsUUID()
  @IsNotEmpty()
  songId: string
}

export class QueryFavoritesDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 20

  @IsOptional()
  @IsString()
  search?: string
}
