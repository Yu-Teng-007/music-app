import { Module, NestModule, MiddlewareConsumer, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import { doubleCsrf } from 'csrf-csrf'
import helmet from 'helmet'
import { Request } from 'express'
import { CsrfService } from './csrf.service'

@Global()
@Module({
  providers: [CsrfService],
  exports: [CsrfService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(),
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'blob:'],
              mediaSrc: ["'self'", 'data:', 'blob:'],
            },
          },
          xssFilter: true,
          noSniff: true,
          referrerPolicy: { policy: 'same-origin' },
        }),
        session({
          secret: process.env.SESSION_SECRET || 'music-app-secret',
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          },
        }),
        (req: Request, res: any, next: any) => {
          const { doubleCsrfProtection } = doubleCsrf({
            getSecret: () => process.env.CSRF_SECRET || 'csrf-secret-key',
            cookieName: 'csrf-token',
            cookieOptions: {
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax',
            },
            size: 64,
            getSessionIdentifier: (req: Request) => {
              // 使用会话ID作为标识符
              return req.sessionID || ''
            },
            getCsrfTokenFromRequest: req => req.headers['x-csrf-token'],
          })

          // 排除不需要CSRF保护的路由
          const excludedPaths = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/send-sms',
            '/api/admin/auth/login',
            '/api/admin/auth/refresh',
            '/api/csrf-token',
            '/api/upload/music',
            '/api/upload/cover',
            '/api/songs', // 临时添加，稍后需要修复CSRF token处理
          ]

          // 检查是否为排除的路径

          if (excludedPaths.includes(req.originalUrl) || req.method === 'GET') {
            return next()
          }

          try {
            // 应用CSRF保护
            doubleCsrfProtection(req, res, next)
          } catch (error) {
            res.status(403).json({
              statusCode: 403,
              message: 'CSRF验证失败',
              error: 'Forbidden',
            })
          }
        }
      )
      .forRoutes('*')
  }
}
