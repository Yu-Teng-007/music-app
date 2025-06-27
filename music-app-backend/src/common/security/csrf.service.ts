import { Injectable } from '@nestjs/common'
import { doubleCsrf } from 'csrf-csrf'
import { Request, Response } from 'express'

@Injectable()
export class CsrfService {
  private csrfInstance: ReturnType<typeof doubleCsrf>

  constructor() {
    this.csrfInstance = doubleCsrf({
      getSecret: () => {
        const secret = process.env.CSRF_SECRET
        if (!secret) {
          throw new Error('CSRF_SECRET environment variable is required')
        }
        return secret
      },
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
  }

  /**
   * 生成CSRF token
   */
  generateToken(req: Request, res: Response): string {
    return this.csrfInstance.generateCsrfToken(req, res)
  }

  /**
   * 验证CSRF token
   */
  validateToken(req: Request, res: Response, next?: any): boolean {
    try {
      const nextFunction =
        next ||
        ((error?: any) => {
          if (error) {
            throw error
          }
        })
      this.csrfInstance.doubleCsrfProtection(req, res, nextFunction)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取CSRF保护中间件
   */
  getProtectionMiddleware() {
    return this.csrfInstance.doubleCsrfProtection
  }
}
