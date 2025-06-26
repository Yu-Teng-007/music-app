import { IsNotEmpty, IsString, IsUUID, IsOptional, IsInt, Min } from 'class-validator'

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string

  @IsNotEmpty()
  @IsUUID()
  songId: string
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string
}

export class QueryCommentsDto {
  @IsOptional()
  @IsUUID()
  songId?: string

  @IsOptional()
  @IsUUID()
  userId?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number
}
