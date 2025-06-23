import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from '../dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto)
    return {
      success: true,
      data: result,
      message: '注册成功',
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto)
    return {
      success: true,
      data: result,
      message: '登录成功',
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(refreshTokenDto)
    return {
      success: true,
      data: result,
      message: 'Token刷新成功',
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const result = await this.authService.getCurrentUser(req.user.id)
    return {
      success: true,
      data: result,
      message: '获取用户信息成功',
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const result = await this.authService.updateProfile(req.user.id, updateProfileDto)
    return {
      success: true,
      data: result,
      message: '更新用户信息成功',
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const result = await this.authService.changePassword(req.user.id, changePasswordDto)
    return {
      success: true,
      data: result,
      message: '密码修改成功',
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    // 在实际应用中，这里可以将token加入黑名单
    // 目前只是返回成功响应，让前端清除本地token
    return {
      success: true,
      message: '登出成功',
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    const result = await this.authService.forgotPassword(email)
    return {
      success: true,
      data: result,
      message: result.message,
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: { token: string; password: string }) {
    const result = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    )
    return {
      success: true,
      data: result,
      message: result.message,
    }
  }
}
