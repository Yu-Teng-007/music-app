import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || 'default-secret',
    })
  }

  async validate(payload: { sub: string; phone: string; username: string }) {
    try {
      const user = await this.authService.validateUser(payload.sub)
      return {
        id: user.id,
        phone: user.phone,
        username: user.username,
      }
    } catch {
      throw new UnauthorizedException('Token无效')
    }
  }
}
