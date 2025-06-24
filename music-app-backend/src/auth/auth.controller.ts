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
  SendSmsDto,
} from '../dto/auth.dto'

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    phone: string
    username: string
  }
}

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
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    const result = await this.authService.getCurrentUser(req.user.id)
    return {
      success: true,
      data: result,
      message: '获取用户信息成功',
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Request() req: AuthenticatedRequest) {
    const user = await this.authService.getCurrentUser(req.user.id)

    // 生成个性化问候语
    const hour = new Date().getHours()
    let greeting = '戴上耳机好好听'
    let subGreeting = '今日榜单上歌曲的准备吧！'

    if (hour < 6) {
      greeting = '夜深了，来点轻音乐吧'
      subGreeting = '深夜时光，音乐相伴'
    } else if (hour < 12) {
      greeting = '早上好，开启美好的一天'
      subGreeting = '用音乐唤醒你的活力'
    } else if (hour < 18) {
      greeting = '下午好，放松一下吧'
      subGreeting = '午后时光，享受音乐的美好'
    } else {
      greeting = '晚上好，享受音乐时光'
      subGreeting = '夜晚来临，让音乐陪伴你'
    }

    const profile = {
      ...user,
      greeting,
      subGreeting,
    }

    return {
      success: true,
      data: profile,
      message: '获取用户档案成功',
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    const result = await this.authService.updateProfile(req.user.id, updateProfileDto)
    return {
      success: true,
      data: result,
      message: '更新用户信息成功',
    }
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    const result = await this.authService.changePassword(req.user.id, changePasswordDto)
    return {
      success: true,
      data: result,
      message: '密码修改成功',
    }
  }

  @Post('send-sms')
  @HttpCode(HttpStatus.OK)
  async sendSmsCode(@Body() sendSmsDto: SendSmsDto) {
    const result = await this.authService.sendSmsCode(sendSmsDto)
    return {
      success: true,
      data: result,
      message: result.message,
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout() {
    // 在实际应用中，这里可以将token加入黑名单
    // 目前只是返回成功响应，让前端清除本地token
    return {
      success: true,
      message: '登出成功',
    }
  }
}
