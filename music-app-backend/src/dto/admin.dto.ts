import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator'
import { LogAction, LogLevel } from '../entities/admin-log.entity'
import { PermissionType } from '../entities/admin-permission.entity'
import { ConfigType } from '../entities/system-config.entity'

// 管理员登录DTO
export class AdminLoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string
}

// 创建管理员DTO
export class CreateAdminUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string

  @ApiPropertyOptional({ description: '邮箱', example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ description: '真实姓名', example: '管理员' })
  @IsString()
  @MaxLength(100)
  realName: string

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiPropertyOptional({ description: '角色ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]
}

// 更新管理员DTO
export class UpdateAdminUserDto {
  @ApiPropertyOptional({ description: '邮箱', example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ description: '真实姓名', example: '管理员' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  realName?: string

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string

  @ApiPropertyOptional({ description: '角色ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[]
}

// 创建角色DTO
export class CreateAdminRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @IsString()
  @MaxLength(50)
  name: string

  @ApiProperty({ description: '显示名称', example: '超级管理员' })
  @IsString()
  @MaxLength(100)
  displayName: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @ApiPropertyOptional({ description: '权限ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[]
}

// 更新角色DTO
export class UpdateAdminRoleDto {
  @ApiPropertyOptional({ description: '显示名称', example: '超级管理员' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @ApiPropertyOptional({ description: '权限ID列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[]
}

// 创建权限DTO
export class CreateAdminPermissionDto {
  @ApiProperty({ description: '权限名称', example: 'user:list' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiProperty({ description: '显示名称', example: '用户列表' })
  @IsString()
  @MaxLength(100)
  displayName: string

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @IsEnum(PermissionType)
  type: PermissionType

  @ApiPropertyOptional({ description: '资源', example: '/admin/users' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  resource?: string

  @ApiPropertyOptional({ description: '操作', example: 'read' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string

  @ApiPropertyOptional({ description: '父权限ID' })
  @IsOptional()
  @IsString()
  parentId?: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

// 更新权限DTO
export class UpdateAdminPermissionDto {
  @ApiPropertyOptional({ description: '显示名称', example: '用户列表' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string

  @ApiPropertyOptional({ description: '权限类型', enum: PermissionType })
  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType

  @ApiPropertyOptional({ description: '资源', example: '/admin/users' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  resource?: string

  @ApiPropertyOptional({ description: '操作', example: 'read' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string

  @ApiPropertyOptional({ description: '父权限ID' })
  @IsOptional()
  @IsString()
  parentId?: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

// 系统配置DTO
export class CreateSystemConfigDto {
  @ApiProperty({ description: '配置键', example: 'site_name' })
  @IsString()
  @MaxLength(100)
  key: string

  @ApiProperty({ description: '配置值', example: '音乐应用' })
  @IsString()
  value: string

  @ApiProperty({ description: '配置类型', enum: ConfigType })
  @IsEnum(ConfigType)
  type: ConfigType

  @ApiProperty({ description: '配置名称', example: '网站名称' })
  @IsString()
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '分组', example: 'basic' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  group?: string

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

// 更新系统配置DTO
export class UpdateSystemConfigDto {
  @ApiPropertyOptional({ description: '配置值', example: '音乐应用' })
  @IsOptional()
  @IsString()
  value?: string

  @ApiPropertyOptional({ description: '配置类型', enum: ConfigType })
  @IsOptional()
  @IsEnum(ConfigType)
  type?: ConfigType

  @ApiPropertyOptional({ description: '配置名称', example: '网站名称' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: '分组', example: 'basic' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  group?: string

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

// 查询参数DTO
export class AdminQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({ description: '排序方向', example: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC'
}
