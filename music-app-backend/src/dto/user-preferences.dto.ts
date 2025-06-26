import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpsertPreferenceDto {
  @ApiProperty({ description: '偏好设置键' })
  @IsString()
  @IsNotEmpty()
  key: string

  @ApiProperty({ description: '偏好设置值' })
  @IsString()
  @IsNotEmpty()
  value: string
}

export class BulkUpsertPreferencesDto {
  @ApiProperty({ description: '批量偏好设置', type: [UpsertPreferenceDto] })
  preferences: UpsertPreferenceDto[]
}
