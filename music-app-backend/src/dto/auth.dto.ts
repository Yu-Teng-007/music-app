import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  password: string
}

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string

  @IsString({ message: '姓名必须是字符串' })
  @MinLength(2, { message: '姓名长度至少2位' })
  @MaxLength(20, { message: '姓名长度不能超过20位' })
  name: string

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password: string

  @IsString({ message: '确认密码必须是字符串' })
  confirmPassword: string
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @MinLength(2, { message: '姓名长度至少2位' })
  @MaxLength(20, { message: '姓名长度不能超过20位' })
  name?: string

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

export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string
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
