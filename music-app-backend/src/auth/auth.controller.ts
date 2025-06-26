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
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { SmsService } from '../sms/sms.service'
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly smsService: SmsService
  ) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '支持手机号注册，需要短信验证码' })
  @ApiBody({ type: RegisterDto, description: '注册信息' })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT访问令牌' },
            refreshToken: { type: 'string', description: '刷新令牌' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', description: '用户ID' },
                phone: { type: 'string', description: '手机号' },
                username: { type: 'string', description: '用户名' },
                avatar: { type: 'string', description: '头像URL' },
                isActive: { type: 'boolean', description: '是否激活' },
                createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
                updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
              },
            },
          },
        },
        message: { type: 'string', example: '注册成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户已存在' })
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
  @ApiOperation({ summary: '用户登录', description: '支持手机号验证码登录和用户名密码登录' })
  @ApiBody({ type: LoginDto, description: '登录信息' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT访问令牌' },
            refreshToken: { type: 'string', description: '刷新令牌' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', description: '用户ID' },
                phone: { type: 'string', description: '手机号' },
                username: { type: 'string', description: '用户名' },
                avatar: { type: 'string', description: '头像URL' },
                isActive: { type: 'boolean', description: '是否激活' },
                createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
                updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
              },
            },
          },
        },
        message: { type: 'string', example: '登录成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '登录失败，用户名或密码错误' })
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
  @ApiOperation({ summary: '刷新访问令牌', description: '使用刷新令牌获取新的访问令牌' })
  @ApiBody({ type: RefreshTokenDto, description: '刷新令牌信息' })
  @ApiResponse({
    status: 200,
    description: 'Token刷新成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', description: '新的JWT访问令牌' },
            refreshToken: { type: 'string', description: '新的刷新令牌' },
          },
        },
        message: { type: 'string', example: 'Token刷新成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息', description: '获取当前登录用户的基本信息' })
  @ApiResponse({
    status: 200,
    description: '获取用户信息成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '用户ID' },
            phone: { type: 'string', description: '手机号' },
            username: { type: 'string', description: '用户名' },
            avatar: { type: 'string', description: '头像URL' },
            isActive: { type: 'boolean', description: '是否激活' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取用户信息成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取用户档案', description: '获取用户详细档案信息，包含个性化问候语' })
  @ApiResponse({
    status: 200,
    description: '获取用户档案成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '用户ID' },
            phone: { type: 'string', description: '手机号' },
            username: { type: 'string', description: '用户名' },
            avatar: { type: 'string', description: '头像URL' },
            isActive: { type: 'boolean', description: '是否激活' },
            greeting: { type: 'string', description: '个性化问候语' },
            subGreeting: { type: 'string', description: '副问候语' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '获取用户档案成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新用户档案', description: '更新用户的基本信息' })
  @ApiBody({ type: UpdateProfileDto, description: '更新的用户信息' })
  @ApiResponse({
    status: 200,
    description: '更新用户信息成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', description: '用户ID' },
            phone: { type: 'string', description: '手机号' },
            username: { type: 'string', description: '用户名' },
            avatar: { type: 'string', description: '头像URL' },
            isActive: { type: 'boolean', description: '是否激活' },
            createdAt: { type: 'string', format: 'date-time', description: '创建时间' },
            updatedAt: { type: 'string', format: 'date-time', description: '更新时间' },
          },
        },
        message: { type: 'string', example: '更新用户信息成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '修改密码', description: '修改用户登录密码' })
  @ApiBody({ type: ChangePasswordDto, description: '密码修改信息' })
  @ApiResponse({
    status: 200,
    description: '密码修改成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object', description: '返回数据' },
        message: { type: 'string', example: '密码修改成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误或原密码不正确' })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
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
  @ApiOperation({ summary: '发送短信验证码', description: '向指定手机号发送验证码' })
  @ApiBody({ type: SendSmsDto, description: '短信发送信息' })
  @ApiResponse({
    status: 200,
    description: '短信发送成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', description: '发送结果消息' },
          },
        },
        message: { type: 'string', example: '短信发送成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 429, description: '发送频率过快，请稍后再试' })
  async sendSmsCode(@Body() sendSmsDto: SendSmsDto) {
    const result = await this.authService.sendSmsCode(sendSmsDto)
    return {
      success: true,
      data: result,
      message: result.message,
    }
  }

  @Get('get-sms-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取验证码（开发用）',
    description: '开发环境下获取指定手机号的验证码',
  })
  @ApiQuery({ name: 'phone', description: '手机号', example: '13800138000' })
  @ApiQuery({ name: 'type', description: '验证码类型', enum: ['register', 'login'] })
  @ApiResponse({
    status: 200,
    description: '获取验证码成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'string', description: '验证码' },
        message: { type: 'string', example: '获取验证码成功' },
      },
    },
  })
  async getSmsCode(@Query('phone') phone: string, @Query('type') type: 'register' | 'login') {
    const result = await this.smsService.getSmsCode(phone, type)
    return {
      success: true,
      data: result,
      message: result ? '获取验证码成功' : '验证码不存在或已过期',
    }
  }

  @Get('get-all-sms-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有验证码（开发用）', description: '开发环境下获取所有验证码' })
  @ApiResponse({
    status: 200,
    description: '获取所有验证码成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object', description: '所有验证码数据' },
        message: { type: 'string', example: '获取所有验证码成功' },
      },
    },
  })
  async getAllSmsCodes() {
    const result = await this.smsService.getAllSmsCodes()
    return {
      success: true,
      data: result,
      message: '获取所有验证码成功',
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '用户登出', description: '用户登出，前端需要清除本地token' })
  @ApiResponse({
    status: 200,
    description: '登出成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '登出成功' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权，请先登录' })
  logout() {
    // 在实际应用中，这里可以将token加入黑名单
    // 目前只是返回成功响应，让前端清除本地token
    return {
      success: true,
      message: '登出成功',
    }
  }
}
