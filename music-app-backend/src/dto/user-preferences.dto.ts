import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class UpsertPreferenceDto {
  @ApiProperty({
    description: '偏好设置键名',
    example: 'theme',
    enum: ['theme', 'language', 'autoPlay', 'volume', 'quality', 'notifications'],
  })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({
    description: '偏好设置值',
    example: 'dark',
    examples: {
      theme: { value: 'dark', description: '主题设置：light/dark' },
      language: { value: 'zh-CN', description: '语言设置：zh-CN/en-US' },
      autoPlay: { value: 'true', description: '自动播放：true/false' },
      volume: { value: '80', description: '音量：0-100' },
      quality: { value: 'high', description: '音质：low/medium/high' },
      notifications: { value: 'enabled', description: '通知：enabled/disabled' },
    },
  })
  @IsString()
  @IsNotEmpty()
  value: string

  @ApiProperty({
    description: '设置描述（可选）',
    example: '用户界面主题设置',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  description?: string
}

export class BulkUpsertPreferencesDto {
  @ApiProperty({
    description: '批量偏好设置列表',
    type: [UpsertPreferenceDto],
    example: [
      { key: 'theme', value: 'dark', description: '深色主题' },
      { key: 'autoPlay', value: 'true', description: '启用自动播放' },
      { key: 'volume', value: '80', description: '默认音量80%' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertPreferenceDto)
  preferences: UpsertPreferenceDto[]
}
