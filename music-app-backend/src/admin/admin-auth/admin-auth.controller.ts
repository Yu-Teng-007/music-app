import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AdminAuthService } from './admin-auth.service'
import { AdminLoginDto } from '../../dto'
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard'

interface AdminAuthenticatedRequest extends Request {
  user: {
    sub: string
    username: string
    type: string
  }
}

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: AdminLoginDto) {
    const result = await this.adminAuthService.login(loginDto)
    return {
      success: true,
      data: result,
      message: '登录成功',
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const result = await this.adminAuthService.refreshToken(refreshToken)
    return {
      success: true,
      data: result,
      message: '刷新成功',
    }
  }

  @Get('profile')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前管理员信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getProfile(@Request() req: AdminAuthenticatedRequest) {
    const result = await this.adminAuthService.getCurrentUser(req.user.sub)
    return {
      success: true,
      data: result,
      message: '获取成功',
    }
  }

  @Post('logout')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logout() {
    // 在实际应用中，可以将token加入黑名单
    // 这里简单返回成功消息
    return {
      success: true,
      message: '登出成功',
    }
  }
}
