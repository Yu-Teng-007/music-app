import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsInt, Min, Max, IsNumber } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AudioQuality, DownloadStatus } from '../entities/download.entity'

// 创建下载任务DTO
export class CreateDownloadDto {
  @ApiProperty({ description: '歌曲ID' })
  @IsUUID()
  songId: string

  @ApiProperty({ description: '音质', enum: AudioQuality })
  @IsEnum(AudioQuality)
  quality: AudioQuality
}

// 更新下载任务DTO
export class UpdateDownloadDto {
  @ApiPropertyOptional({ description: '下载状态', enum: DownloadStatus })
  @IsOptional()
  @IsEnum(DownloadStatus)
  status?: DownloadStatus

  @ApiPropertyOptional({ description: '本地文件路径' })
  @IsOptional()
  @IsString()
  localPath?: string

  @ApiPropertyOptional({ description: '文件大小' })
  @IsOptional()
  @IsNumber()
  fileSize?: number

  @ApiPropertyOptional({ description: '已下载大小' })
  @IsOptional()
  @IsNumber()
  downloadedSize?: number

  @ApiPropertyOptional({ description: '下载进度' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number

  @ApiPropertyOptional({ description: '错误信息' })
  @IsOptional()
  @IsString()
  errorMessage?: string
}

// 下载查询DTO
export class DownloadQueryDto {
  @ApiPropertyOptional({ description: '下载状态', enum: DownloadStatus })
  @IsOptional()
  @IsEnum(DownloadStatus)
  status?: DownloadStatus

  @ApiPropertyOptional({ description: '音质', enum: AudioQuality })
  @IsOptional()
  @IsEnum(AudioQuality)
  quality?: AudioQuality

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'

  @ApiPropertyOptional({ description: '排序方向', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'
}

// 批量下载DTO
export class BatchDownloadDto {
  @ApiProperty({ description: '歌曲ID列表', type: [String] })
  @IsUUID(4, { each: true })
  songIds: string[]

  @ApiProperty({ description: '音质', enum: AudioQuality })
  @IsEnum(AudioQuality)
  quality: AudioQuality
}

// 下载进度DTO
export class DownloadProgressDto {
  @ApiProperty({ description: '下载ID' })
  downloadId: string

  @ApiProperty({ description: '歌曲信息' })
  song: any

  @ApiProperty({ description: '下载状态', enum: DownloadStatus })
  status: DownloadStatus

  @ApiProperty({ description: '下载进度' })
  progress: number

  @ApiProperty({ description: '文件大小' })
  fileSize: number

  @ApiProperty({ description: '已下载大小' })
  downloadedSize: number

  @ApiProperty({ description: '下载速度（字节/秒）' })
  speed: number

  @ApiProperty({ description: '剩余时间（秒）' })
  remainingTime: number
}

// 存储统计DTO
export class StorageStatsDto {
  @ApiProperty({ description: '已使用空间（字节）' })
  usedSpace: number

  @ApiProperty({ description: '总空间（字节）' })
  totalSpace: number

  @ApiProperty({ description: '可用空间（字节）' })
  availableSpace: number

  @ApiProperty({ description: '使用百分比' })
  usagePercentage: number

  @ApiProperty({ description: '下载文件数量' })
  downloadCount: number

  @ApiProperty({ description: '最大下载文件数' })
  maxDownloads: number
}

// 清理选项DTO
export class CleanupOptionsDto {
  @ApiPropertyOptional({ description: '清理天数', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30

  @ApiPropertyOptional({ description: '是否清理失败的下载', default: true })
  @IsOptional()
  @IsBoolean()
  cleanupFailed?: boolean = true

  @ApiPropertyOptional({ description: '是否清理长时间未访问的文件', default: false })
  @IsOptional()
  @IsBoolean()
  cleanupUnused?: boolean = false

  @ApiPropertyOptional({ description: '强制清理（忽略用户设置）', default: false })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false
}
