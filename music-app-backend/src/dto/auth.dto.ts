import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  Matches,
  Length,
  ValidateIf,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

// 发送短信验证码DTO
export class SendSmsDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    pattern: '^1[3-9]\\d{9}$',
  })
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone: string

  @ApiProperty({
    description: '验证码类型',
    enum: ['register', 'login'],
    example: 'register',
  })
  @IsString({ message: '验证码类型必须是字符串' })
  @IsIn(['register', 'login'], { message: '验证码类型只能是register或login' })
  type: 'register' | 'login'
}

export class LoginDto {
  @ApiProperty({
    description: '登录方式',
    enum: ['phone', 'username'],
    example: 'phone',
  })
  @IsString({ message: '登录方式必须是字符串' })
  @IsIn(['phone', 'username'], { message: '登录方式只能是phone或username' })
  loginType: 'phone' | 'username'

  @ApiProperty({
    description: '手机号（手机号登录时必填）',
    example: '13800138000',
    required: false,
    pattern: '^1[3-9]\\d{9}$',
  })
  @ValidateIf(o => o.loginType === 'phone')
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string

  @ApiProperty({
    description: '短信验证码（手机号登录时必填）',
    example: '123456',
    required: false,
    minLength: 6,
    maxLength: 6,
  })
  @ValidateIf(o => o.loginType === 'phone')
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  smsCode?: string

  @ApiProperty({
    description: '用户名（用户名登录时必填）',
    example: 'testuser',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @ValidateIf(o => o.loginType === 'username')
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  username?: string

  @ApiProperty({
    description: '密码（用户名登录时必填）',
    example: 'password123',
    required: false,
    minLength: 6,
  })
  @ValidateIf(o => o.loginType === 'username')
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  password?: string
}

export class RegisterDto {
  @ApiProperty({
    description: '注册方式',
    enum: ['phone', 'username'],
    example: 'phone',
  })
  @IsString({ message: '注册方式必须是字符串' })
  @IsIn(['phone', 'username'], { message: '注册方式只能是phone或username' })
  registerType: 'phone' | 'username'

  @ApiProperty({
    description: '手机号（手机号注册时必填）',
    example: '13800138000',
    required: false,
    pattern: '^1[3-9]\\d{9}$',
  })
  @ValidateIf(o => o.registerType === 'phone')
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string

  @ApiProperty({
    description: '短信验证码（手机号注册时必填）',
    example: '123456',
    required: false,
    minLength: 6,
    maxLength: 6,
  })
  @ValidateIf(o => o.registerType === 'phone')
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  smsCode?: string

  @ApiProperty({
    description: '用户名（用户名注册时必填）',
    example: 'testuser',
    required: false,
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9_]+$',
  })
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username?: string

  @ApiProperty({
    description: '密码（用户名注册时必填）',
    example: 'password123',
    required: false,
    minLength: 6,
  })
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password?: string

  @ApiProperty({
    description: '确认密码（用户名注册时必填）',
    example: 'password123',
    required: false,
    minLength: 6,
  })
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword?: string
}

export class UpdateProfileDto {
  @ApiProperty({
    description: '用户头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string

  @ApiProperty({
    description: '用户名',
    example: 'newusername',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  username?: string
}

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldpassword123',
  })
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword: string

  @ApiProperty({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度至少6位' })
  @MaxLength(50, { message: '新密码长度不能超过50位' })
  newPassword: string
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '密码重置令牌',
    example: 'reset-token-123456',
  })
  @IsString({ message: '重置令牌必须是字符串' })
  token: string

  @ApiProperty({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度至少6位' })
  @MaxLength(50, { message: '新密码长度不能超过50位' })
  password: string
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken: string
}
