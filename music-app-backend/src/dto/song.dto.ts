import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsUrl,
  IsBoolean,
  IsArray,
} from 'class-validator'

export class CreateSongDto {
  @IsString({ message: '歌曲标题必须是字符串' })
  title: string

  @IsString({ message: '艺术家必须是字符串' })
  artist: string

  @IsString({ message: '专辑名必须是字符串' })
  album: string

  @IsNumber({}, { message: '持续时间必须是数字' })
  @Min(1, { message: '持续时间必须大于0' })
  duration: number

  @IsUrl({}, { message: '封面URL格式不正确' })
  coverUrl: string

  @IsUrl({}, { message: '音频URL格式不正确' })
  audioUrl: string

  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @IsOptional()
  @IsNumber({}, { message: '年份必须是数字' })
  @Min(1900, { message: '年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '年份不能超过当前年份' })
  year?: number

  @IsOptional()
  @IsString({ message: '歌词必须是字符串' })
  lyrics?: string

  @IsOptional()
  @IsNumber({}, { message: '文件大小必须是数字' })
  @Min(1, { message: '文件大小必须大于0' })
  fileSize?: number

  @IsOptional()
  @IsString({ message: '原始文件名必须是字符串' })
  originalFileName?: string
}

export class UpdateSongDto {
  @IsOptional()
  @IsString({ message: '歌曲标题必须是字符串' })
  title?: string

  @IsOptional()
  @IsString({ message: '艺术家必须是字符串' })
  artist?: string

  @IsOptional()
  @IsString({ message: '专辑名必须是字符串' })
  album?: string

  @IsOptional()
  @IsNumber({}, { message: '持续时间必须是数字' })
  @Min(1, { message: '持续时间必须大于0' })
  duration?: number

  @IsOptional()
  @IsUrl({}, { message: '封面URL格式不正确' })
  coverUrl?: string

  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @IsOptional()
  @IsNumber({}, { message: '年份必须是数字' })
  @Min(1900, { message: '年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '年份不能超过当前年份' })
  year?: number

  @IsOptional()
  @IsString({ message: '歌词必须是字符串' })
  lyrics?: string
}

export class QuerySongsDto {
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string

  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @IsOptional()
  @IsString({ message: '艺术家必须是字符串' })
  artist?: string

  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1

  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 20

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt'

  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC'
}

export class CrawlSongDto {
  @IsString({ message: '歌曲标题必须是字符串' })
  title: string

  @IsString({ message: '艺术家必须是字符串' })
  artist: string

  @IsOptional()
  @IsString({ message: '专辑名必须是字符串' })
  album?: string

  @IsOptional()
  @IsNumber({}, { message: '持续时间必须是数字' })
  @Min(0, { message: '持续时间不能为负数' })
  duration?: number

  @IsOptional()
  @IsUrl({}, { message: '封面URL格式不正确' })
  coverUrl?: string

  @IsOptional()
  @IsUrl({}, { message: '音频URL格式不正确' })
  audioUrl?: string

  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @IsOptional()
  @IsNumber({}, { message: '年份必须是数字' })
  @Min(1900, { message: '年份不能早于1900年' })
  @Max(new Date().getFullYear(), { message: '年份不能超过当前年份' })
  year?: number

  @IsOptional()
  @IsString({ message: '歌词必须是字符串' })
  lyrics?: string

  @IsOptional()
  @IsNumber({}, { message: '文件大小必须是数字' })
  @Min(0, { message: '文件大小不能为负数' })
  fileSize?: number

  @IsOptional()
  @IsString({ message: '来源URL必须是字符串' })
  sourceUrl?: string

  @IsOptional()
  @IsString({ message: '来源ID必须是字符串' })
  sourceId?: string
}

export class CrawlConfigDto {
  @IsOptional()
  @IsNumber({}, { message: '爬取数量必须是数字' })
  @Min(1, { message: '爬取数量必须大于0' })
  @Max(100, { message: '单次爬取数量不能超过100' })
  limit?: number = 20

  @IsOptional()
  @IsString({ message: '爬取类型必须是字符串' })
  type?: 'recommended' | 'popular' | 'latest' = 'recommended'

  @IsOptional()
  @IsString({ message: '音乐类型必须是字符串' })
  genre?: string

  @IsOptional()
  @IsString({ message: '艺术家必须是字符串' })
  artist?: string

  @IsOptional()
  @IsBoolean({ message: '数据质量优化标志必须是布尔值' })
  enableDataOptimization?: boolean

  @IsOptional()
  @IsBoolean({ message: '重复检测标志必须是布尔值' })
  enableDuplicateDetection?: boolean

  @IsOptional()
  @IsNumber({}, { message: '重复检测阈值必须是数字' })
  @Min(0, { message: '重复检测阈值必须大于等于0' })
  @Max(1, { message: '重复检测阈值必须小于等于1' })
  duplicateThreshold?: number

  @IsOptional()
  @IsArray({ message: '网站列表必须是数组' })
  @IsString({ each: true, message: '网站名称必须是字符串' })
  sites?: string[]
}
