import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreatePlaylistDto {
  @IsString({ message: '播放列表名称必须是字符串' })
  name: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  coverUrl?: string;

  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean = false;
}

export class UpdatePlaylistDto {
  @IsOptional()
  @IsString({ message: '播放列表名称必须是字符串' })
  name?: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsString({ message: '封面URL必须是字符串' })
  coverUrl?: string;

  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean;
}

export class AddSongToPlaylistDto {
  @IsUUID('4', { message: '歌曲ID格式不正确' })
  songId: string;
}

export class QueryPlaylistsDto {
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @IsOptional()
  @IsBoolean({ message: '私有状态必须是布尔值' })
  isPrivate?: boolean;
}
