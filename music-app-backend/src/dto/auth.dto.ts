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

// 发送短信验证码DTO
export class SendSmsDto {
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone: string

  @IsString({ message: '验证码类型必须是字符串' })
  @IsIn(['register', 'login'], { message: '验证码类型只能是register或login' })
  type: 'register' | 'login'
}

export class LoginDto {
  // 登录方式：'phone' 或 'username'
  @IsString({ message: '登录方式必须是字符串' })
  @IsIn(['phone', 'username'], { message: '登录方式只能是phone或username' })
  loginType: 'phone' | 'username'

  // 手机号（手机号登录时必填）
  @ValidateIf(o => o.loginType === 'phone')
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string

  // 短信验证码（手机号登录时必填）
  @ValidateIf(o => o.loginType === 'phone')
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  smsCode?: string

  // 用户名（用户名登录时必填）
  @ValidateIf(o => o.loginType === 'username')
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  username?: string

  // 密码（用户名登录时必填）
  @ValidateIf(o => o.loginType === 'username')
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  password?: string
}

export class RegisterDto {
  // 注册方式：'phone' 或 'username'
  @IsString({ message: '注册方式必须是字符串' })
  @IsIn(['phone', 'username'], { message: '注册方式只能是phone或username' })
  registerType: 'phone' | 'username'

  // 手机号（手机号注册时必填）
  @ValidateIf(o => o.registerType === 'phone')
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' })
  phone?: string

  // 短信验证码（手机号注册时必填）
  @ValidateIf(o => o.registerType === 'phone')
  @IsString({ message: '验证码必须是字符串' })
  @Length(6, 6, { message: '验证码必须是6位数字' })
  smsCode?: string

  // 用户名（用户名注册时必填）
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username?: string

  // 密码（用户名注册时必填）
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password?: string

  // 确认密码（用户名注册时必填）
  @ValidateIf(o => o.registerType === 'username')
  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword?: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string
}

export class ChangePasswordDto {
  @IsString({ message: '当前密码必须是字符串' })
  currentPassword: string

  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度至少6位' })
  @MaxLength(50, { message: '新密码长度不能超过50位' })
  newPassword: string
}

export class ResetPasswordDto {
  @IsString({ message: '重置令牌必须是字符串' })
  token: string

  @IsString({ message: '新密码必须是字符串' })
  @MinLength(6, { message: '新密码长度至少6位' })
  @MaxLength(50, { message: '新密码长度不能超过50位' })
  password: string
}

export class RefreshTokenDto {
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken: string
}
