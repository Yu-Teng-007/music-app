# 🔐 JWT认证技术文档

**技术栈**: NestJS + Passport + JWT  
**版本**: v1.0  
**更新日期**: 2025-06-27

---

## 📋 JWT认证概览

JSON Web Token (JWT) 是一种开放标准 (RFC 7519)，用于在各方之间安全地传输信息。本项目使用JWT实现无状态的用户认证机制，支持访问令牌和刷新令牌的双令牌策略。

### 🏗️ JWT架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   客户端请求    │    │   JWT验证中间件 │    │   受保护资源    │
│                 │    │                 │    │                 │
│ • 携带JWT Token │───►│ • 验证签名      │───►│ • 返回用户数据  │
│ • Authorization │    │ • 检查过期时间  │    │ • 执行业务逻辑  │
│   Header        │    │ • 解析用户信息  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   令牌刷新      │    │   错误处理      │    │   日志记录      │
│                 │    │                 │    │                 │
│ • 刷新令牌验证  │    │ • 401未授权     │    │ • 认证日志      │
│ • 生成新令牌    │    │ • 403禁止访问   │    │ • 安全审计      │
│ • 返回新Token   │    │ • 令牌过期处理  │    │ • 异常监控      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔧 JWT配置

### 环境变量配置

```env
# JWT配置
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-access-token
JWT_REFRESH_EXPIRES_IN=7d

# 安全配置
JWT_ISSUER=music-app
JWT_AUDIENCE=music-app-users
```

### JWT配置模块

```typescript
// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'music-app',
  audience: process.env.JWT_AUDIENCE || 'music-app-users',
}))
```

### JWT模块配置

```typescript
// src/auth/jwt.module.ts
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
          issuer: configService.get<string>('jwt.issuer'),
          audience: configService.get<string>('jwt.audience'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
```

---

## 🔑 JWT令牌结构

### 访问令牌 (Access Token)

```typescript
interface JwtPayload {
  sub: string          // 用户ID (Subject)
  username: string     // 用户名
  phone?: string       // 手机号
  iat: number         // 签发时间 (Issued At)
  exp: number         // 过期时间 (Expiration)
  iss: string         // 签发者 (Issuer)
  aud: string         // 受众 (Audience)
  jti: string         // JWT ID (唯一标识)
}
```

### 刷新令牌 (Refresh Token)

```typescript
interface RefreshTokenPayload {
  sub: string          // 用户ID
  tokenId: string      // 令牌唯一ID
  iat: number         // 签发时间
  exp: number         // 过期时间
  iss: string         // 签发者
  aud: string         // 受众
}
```

### 令牌示例

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "123e4567-e89b-12d3-a456-426614174000",
    "username": "testuser",
    "phone": "13800138000",
    "iat": 1703664000,
    "exp": 1703665800,
    "iss": "music-app",
    "aud": "music-app-users",
    "jti": "unique-token-id"
  }
}
```

---

## 🛠️ JWT服务实现

### JWT服务类

```typescript
// src/auth/jwt.service.ts
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 生成访问令牌
   */
  async generateAccessToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      phone: user.phone,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15分钟
      iss: this.configService.get<string>('jwt.issuer'),
      aud: this.configService.get<string>('jwt.audience'),
      jti: uuidv4(),
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
    })
  }

  /**
   * 生成刷新令牌
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      tokenId: uuidv4(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天
      iss: this.configService.get<string>('jwt.issuer'),
      aud: this.configService.get<string>('jwt.audience'),
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
    })
  }

  /**
   * 验证访问令牌
   */
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
        issuer: this.configService.get<string>('jwt.issuer'),
        audience: this.configService.get<string>('jwt.audience'),
      })
    } catch (error) {
      throw new Error('Invalid access token')
    }
  }

  /**
   * 验证刷新令牌
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        issuer: this.configService.get<string>('jwt.issuer'),
        audience: this.configService.get<string>('jwt.audience'),
      })
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * 解析令牌（不验证签名）
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token)
  }

  /**
   * 检查令牌是否即将过期
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded || !decoded.exp) return true

    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()
    const thresholdTime = thresholdMinutes * 60 * 1000

    return (expirationTime - currentTime) <= thresholdTime
  }
}
```

---

## 🛡️ JWT策略和守卫

### JWT策略

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      issuer: configService.get<string>('jwt.issuer'),
      audience: configService.get<string>('jwt.audience'),
    })
  }

  async validate(payload: JwtPayload) {
    // 验证用户是否存在且激活
    const user = await this.authService.validateUserById(payload.sub)
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive')
    }

    // 可以在这里添加更多验证逻辑
    // 例如：检查用户权限、黑名单等

    return {
      id: payload.sub,
      username: payload.username,
      phone: payload.phone,
    }
  }
}
```

### JWT守卫

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    return super.canActivate(context)
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (err || !user) {
      const request = context.switchToHttp().getRequest()
      const token = this.extractTokenFromHeader(request)
      
      // 记录认证失败日志
      console.error('JWT Authentication failed:', {
        error: err?.message || 'No user found',
        info: info?.message,
        token: token ? 'Present' : 'Missing',
        url: request.url,
        method: request.method,
      })

      throw new UnauthorizedException(
        err instanceof Error ? err.message : '请先登录'
      )
    }

    return user
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
```

---

## 🔄 令牌刷新机制

### 刷新令牌服务

```typescript
// src/auth/refresh-token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtAuthService } from './jwt.service'
import { User } from '../entities/user.entity'

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // 验证刷新令牌
      const payload = await this.jwtAuthService.verifyRefreshToken(refreshToken)
      
      // 查找用户
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true }
      })

      if (!user) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // 生成新的访问令牌
      const newAccessToken = await this.jwtAuthService.generateAccessToken(user)
      
      // 可选：生成新的刷新令牌（令牌轮换）
      const newRefreshToken = await this.jwtAuthService.generateRefreshToken(user.id)

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          avatar: user.avatar,
        }
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /**
   * 撤销刷新令牌（登出时调用）
   */
  async revokeRefreshToken(refreshToken: string) {
    // 在实际应用中，可以将令牌加入黑名单
    // 这里简化处理，仅验证令牌有效性
    try {
      await this.jwtAuthService.verifyRefreshToken(refreshToken)
      return { success: true, message: 'Token revoked successfully' }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
```

### 令牌刷新控制器

```typescript
// src/auth/auth.controller.ts (部分)
@Post('refresh')
@ApiOperation({ summary: '刷新访问令牌' })
@ApiBody({ type: RefreshTokenDto })
async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
  return this.refreshTokenService.refreshAccessToken(refreshTokenDto.refreshToken)
}

@Post('logout')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: '用户登出' })
async logout(@Body() refreshTokenDto: RefreshTokenDto) {
  return this.refreshTokenService.revokeRefreshToken(refreshTokenDto.refreshToken)
}
```

---

## 🔒 安全最佳实践

### 1. 令牌安全

```typescript
// 安全的令牌生成
class SecureJwtService {
  private readonly MINIMUM_SECRET_LENGTH = 32

  validateSecret(secret: string): void {
    if (!secret || secret.length < this.MINIMUM_SECRET_LENGTH) {
      throw new Error(`JWT secret must be at least ${this.MINIMUM_SECRET_LENGTH} characters long`)
    }
  }

  generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  // 添加令牌指纹以防止令牌被盗用
  addTokenFingerprint(payload: any, request: any): any {
    const fingerprint = crypto
      .createHash('sha256')
      .update(request.headers['user-agent'] + request.ip)
      .digest('hex')

    return {
      ...payload,
      fingerprint: fingerprint.substring(0, 16)
    }
  }
}
```

### 2. 令牌黑名单

```typescript
// src/auth/token-blacklist.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class TokenBlacklistService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 将令牌加入黑名单
   */
  async blacklistToken(token: string, expirationTime: number): Promise<void> {
    const key = `blacklist:${token}`
    const ttl = Math.max(0, expirationTime - Math.floor(Date.now() / 1000))
    
    if (ttl > 0) {
      await this.redis.setex(key, ttl, '1')
    }
  }

  /**
   * 检查令牌是否在黑名单中
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`
    const result = await this.redis.get(key)
    return result === '1'
  }

  /**
   * 清理过期的黑名单令牌
   */
  async cleanupExpiredTokens(): Promise<void> {
    // Redis会自动清理过期的键，这里可以添加额外的清理逻辑
    const pattern = 'blacklist:*'
    const keys = await this.redis.keys(pattern)
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key)
      if (ttl === -1) {
        // 没有过期时间的键，手动删除
        await this.redis.del(key)
      }
    }
  }
}
```

### 3. 速率限制

```typescript
// src/auth/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const ip = request.ip
    const key = `auth_rate_limit:${ip}`
    
    const current = await this.redis.incr(key)
    
    if (current === 1) {
      await this.redis.expire(key, 900) // 15分钟窗口
    }
    
    if (current > 5) { // 15分钟内最多5次认证请求
      throw new HttpException(
        'Too many authentication attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      )
    }
    
    return true
  }
}
```

---

## 📊 JWT监控和日志

### 认证日志服务

```typescript
// src/auth/auth-logger.service.ts
import { Injectable } from '@nestjs/common'
import { Logger } from '@nestjs/common'

@Injectable()
export class AuthLoggerService {
  private readonly logger = new Logger(AuthLoggerService.name)

  logSuccessfulLogin(userId: string, ip: string, userAgent: string) {
    this.logger.log(`Successful login - User: ${userId}, IP: ${ip}, UserAgent: ${userAgent}`)
  }

  logFailedLogin(identifier: string, ip: string, reason: string) {
    this.logger.warn(`Failed login - Identifier: ${identifier}, IP: ${ip}, Reason: ${reason}`)
  }

  logTokenRefresh(userId: string, ip: string) {
    this.logger.log(`Token refreshed - User: ${userId}, IP: ${ip}`)
  }

  logSuspiciousActivity(userId: string, activity: string, details: any) {
    this.logger.error(`Suspicious activity - User: ${userId}, Activity: ${activity}`, details)
  }

  logTokenExpiration(userId: string, tokenType: 'access' | 'refresh') {
    this.logger.log(`Token expired - User: ${userId}, Type: ${tokenType}`)
  }
}
```

### JWT中间件

```typescript
// src/auth/middleware/jwt-logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { JwtAuthService } from '../jwt.service'
import { AuthLoggerService } from '../auth-logger.service'

@Injectable()
export class JwtLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly authLogger: AuthLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req)
    
    if (token) {
      try {
        const decoded = this.jwtAuthService.decodeToken(token)
        
        // 检查令牌是否即将过期
        if (this.jwtAuthService.isTokenExpiringSoon(token)) {
          this.authLogger.logTokenExpiration(decoded.sub, 'access')
        }
        
        // 记录API访问
        req['user'] = decoded
      } catch (error) {
        this.authLogger.logSuspiciousActivity(
          'unknown',
          'Invalid token used',
          { token: token.substring(0, 20) + '...', error: error.message }
        )
      }
    }
    
    next()
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
```

---

## 🧪 JWT测试

### 单元测试

```typescript
// src/auth/jwt.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtAuthService } from './jwt.service'

describe('JwtAuthService', () => {
  let service: JwtAuthService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'jwt.secret': 'test-secret',
                'jwt.refreshSecret': 'test-refresh-secret',
                'jwt.issuer': 'test-issuer',
                'jwt.audience': 'test-audience',
              }
              return config[key]
            }),
          },
        },
      ],
    }).compile()

    service = module.get<JwtAuthService>(JwtAuthService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('generateAccessToken', () => {
    it('should generate a valid access token', async () => {
      const user = {
        id: 'test-user-id',
        username: 'testuser',
        phone: '13800138000',
      }

      const mockToken = 'mock.jwt.token'
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockToken)

      const result = await service.generateAccessToken(user)

      expect(result).toBe(mockToken)
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          username: user.username,
          phone: user.phone,
        }),
        expect.objectContaining({
          secret: 'test-secret',
        })
      )
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid token', async () => {
      const mockPayload = {
        sub: 'test-user-id',
        username: 'testuser',
        iat: 1703664000,
        exp: 1703665800,
      }

      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload)

      const result = await service.verifyAccessToken('valid.jwt.token')

      expect(result).toEqual(mockPayload)
    })

    it('should throw error for invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(service.verifyAccessToken('invalid.token')).rejects.toThrow('Invalid access token')
    })
  })
})
```

---

## 🔧 故障排除

### 常见问题

1. **令牌验证失败**
   ```typescript
   // 检查令牌格式
   const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   
   // 验证密钥配置
   console.log('JWT Secret:', process.env.JWT_SECRET?.length)
   
   // 检查令牌过期时间
   const decoded = jwt.decode(token)
   console.log('Token expires at:', new Date(decoded.exp * 1000))
   ```

2. **时钟偏移问题**
   ```typescript
   // 在JWT验证时添加时钟容差
   this.jwtService.verify(token, {
     secret: this.configService.get<string>('jwt.secret'),
     clockTolerance: 60, // 60秒容差
   })
   ```

3. **令牌过大问题**
   ```typescript
   // 减少payload大小
   const minimalPayload = {
     sub: user.id,
     username: user.username,
     // 移除不必要的字段
   }
   ```

### 调试工具

```typescript
// JWT调试中间件
@Injectable()
export class JwtDebugMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (token && process.env.NODE_ENV === 'development') {
      try {
        const decoded = jwt.decode(token, { complete: true })
        console.log('JWT Debug Info:', {
          header: decoded.header,
          payload: decoded.payload,
          isExpired: Date.now() >= decoded.payload.exp * 1000,
          timeToExpiry: decoded.payload.exp * 1000 - Date.now(),
        })
      } catch (error) {
        console.log('JWT Debug Error:', error.message)
      }
    }
    
    next()
  }
}
```

---

## 📚 参考资源

### 相关标准
- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [RFC 7515 - JSON Web Signature (JWS)](https://tools.ietf.org/html/rfc7515)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)

### 安全建议
- 使用强密钥（至少32字符）
- 设置合理的过期时间
- 实施令牌轮换机制
- 监控异常认证行为
- 定期更新密钥

---

*本文档详细介绍了JWT认证机制的实现，请根据实际需求调整配置和安全策略。*
