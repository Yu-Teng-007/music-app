import { Controller, Get, Req, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { AppService } from './app.service'
import { CsrfService } from './common/security/csrf.service'

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly csrfService: CsrfService
  ) {}

  @Get()
  @ApiOperation({ summary: '获取应用信息' })
  @ApiResponse({ status: 200, description: '应用信息' })
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '服务健康状态' })
  getHealth() {
    return this.appService.getHealth()
  }

  @Get('csrf-token')
  @ApiOperation({ summary: '获取CSRF令牌' })
  @ApiResponse({
    status: 200,
    description: 'CSRF令牌获取成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            csrfToken: { type: 'string', description: 'CSRF令牌' },
          },
        },
        message: { type: 'string', example: 'CSRF令牌获取成功' },
      },
    },
  })
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    try {
      const csrfToken = this.csrfService.generateToken(req, res)
      return res.json({
        success: true,
        data: { csrfToken },
        message: 'CSRF令牌获取成功',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'CSRF令牌生成失败',
        error: error.message,
      })
    }
  }
}
