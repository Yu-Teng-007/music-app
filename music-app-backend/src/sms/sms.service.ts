import { Injectable, BadRequestException } from '@nestjs/common'

interface SmsCode {
  phone: string
  code: string
  type: 'register' | 'login'
  expiresAt: Date
  attempts: number
}

@Injectable()
export class SmsService {
  // 在实际应用中，这应该存储在Redis或数据库中
  private smsCodes: Map<string, SmsCode> = new Map()
  private readonly MAX_ATTEMPTS = 3
  private readonly CODE_EXPIRY_MINUTES = 5

  /**
   * 发送短信验证码（模拟实现）
   */
  async sendSmsCode(phone: string, type: 'register' | 'login'): Promise<void> {
    // 检查是否频繁发送
    const key = `${phone}_${type}`
    const existingCode = this.smsCodes.get(key)

    if (existingCode && existingCode.expiresAt > new Date()) {
      const timeDiff = existingCode.expiresAt.getTime() - Date.now()
      if (timeDiff > 4 * 60 * 1000) {
        // 如果距离过期还有超过4分钟，说明刚发送过
        throw new BadRequestException('验证码发送过于频繁，请稍后再试')
      }
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000)

    // 存储验证码
    this.smsCodes.set(key, {
      phone,
      code,
      type,
      expiresAt,
      attempts: 0,
    })

    // 在开发环境下打印验证码到控制台
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(
        `📱 短信验证码 [${phone}] [${type}]: ${code} (${this.CODE_EXPIRY_MINUTES}分钟内有效)`
      )
    }

    // TODO: 在生产环境中，这里应该调用真实的短信服务API
    // 例如：阿里云短信、腾讯云短信等
  }

  /**
   * 验证短信验证码
   */
  async verifySmsCode(phone: string, code: string, type: 'register' | 'login'): Promise<boolean> {
    const key = `${phone}_${type}`
    const storedCode = this.smsCodes.get(key)

    if (!storedCode) {
      throw new BadRequestException('验证码不存在或已过期')
    }

    // 检查是否过期
    if (storedCode.expiresAt < new Date()) {
      this.smsCodes.delete(key)
      throw new BadRequestException('验证码已过期')
    }

    // 检查尝试次数
    if (storedCode.attempts >= this.MAX_ATTEMPTS) {
      this.smsCodes.delete(key)
      throw new BadRequestException('验证码尝试次数过多，请重新获取')
    }

    // 增加尝试次数
    storedCode.attempts++

    // 验证码码
    if (storedCode.code !== code) {
      throw new BadRequestException('验证码错误')
    }

    // 验证成功，删除验证码
    this.smsCodes.delete(key)
    return true
  }

  /**
   * 获取验证码（仅开发环境使用）
   */
  async getSmsCode(
    phone: string,
    type: 'register' | 'login'
  ): Promise<{ code: string; expiresAt: Date } | null> {
    // 仅在开发环境下提供此功能
    if (process.env.NODE_ENV !== 'development') {
      throw new BadRequestException('此功能仅在开发环境下可用')
    }

    const key = `${phone}_${type}`
    const storedCode = this.smsCodes.get(key)

    if (!storedCode) {
      return null
    }

    // 检查是否过期
    if (storedCode.expiresAt < new Date()) {
      this.smsCodes.delete(key)
      return null
    }

    return {
      code: storedCode.code,
      expiresAt: storedCode.expiresAt,
    }
  }

  /**
   * 获取所有验证码（仅开发环境使用）
   */
  async getAllSmsCodes(): Promise<
    Array<{ phone: string; code: string; type: string; expiresAt: Date }>
  > {
    // 仅在开发环境下提供此功能
    if (process.env.NODE_ENV !== 'development') {
      throw new BadRequestException('此功能仅在开发环境下可用')
    }

    const now = new Date()
    const codes: Array<{ phone: string; code: string; type: string; expiresAt: Date }> = []

    for (const [key, smsCode] of this.smsCodes.entries()) {
      // 只返回未过期的验证码
      if (smsCode.expiresAt > now) {
        codes.push({
          phone: smsCode.phone,
          code: smsCode.code,
          type: smsCode.type,
          expiresAt: smsCode.expiresAt,
        })
      }
    }

    return codes
  }

  /**
   * 清理过期的验证码（定时任务可以调用）
   */
  cleanExpiredCodes(): void {
    const now = new Date()
    for (const [key, smsCode] of this.smsCodes.entries()) {
      if (smsCode.expiresAt < now) {
        this.smsCodes.delete(key)
      }
    }
  }
}
