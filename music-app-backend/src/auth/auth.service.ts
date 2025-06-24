import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { User } from '../entities/user.entity'
import {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ChangePasswordDto,
  RefreshTokenDto,
  SendSmsDto,
} from '../dto/auth.dto'
import { SmsService } from '../sms/sms.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smsService: SmsService
  ) {}

  async register(registerDto: RegisterDto) {
    const { registerType, phone, smsCode, username, password, confirmPassword } = registerDto

    if (registerType === 'phone') {
      // 手机号注册
      if (!phone || !smsCode) {
        throw new BadRequestException('手机号和验证码不能为空')
      }

      // 验证短信验证码
      await this.smsService.verifySmsCode(phone, smsCode, 'register')

      // 检查手机号是否已存在
      const existingUserByPhone = await this.userRepository.findOne({
        where: { phone },
      })
      if (existingUserByPhone) {
        throw new ConflictException('该手机号已被注册')
      }

      // 创建用户（手机号注册不需要密码）
      const user = this.userRepository.create({
        phone,
        username: null, // 手机号注册时用户名为空
        password: null, // 手机号注册时密码为空
      })

      const savedUser = await this.userRepository.save(user)

      // 生成tokens
      const tokens = await this.generateTokens(savedUser)

      return {
        user: this.sanitizeUser(savedUser),
        ...tokens,
      }
    } else if (registerType === 'username') {
      // 用户名注册
      if (!username || !password || !confirmPassword) {
        throw new BadRequestException('用户名、密码和确认密码不能为空')
      }

      // 验证密码确认
      if (password !== confirmPassword) {
        throw new ConflictException('两次输入的密码不一致')
      }

      // 检查用户名是否已存在
      const existingUserByUsername = await this.userRepository.findOne({
        where: { username },
      })
      if (existingUserByUsername) {
        throw new ConflictException('该用户名已被注册')
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 12)

      // 创建用户
      const user = this.userRepository.create({
        phone: null, // 用户名注册时手机号为空
        username,
        password: hashedPassword,
      })

      const savedUser = await this.userRepository.save(user)

      // 生成tokens
      const tokens = await this.generateTokens(savedUser)

      return {
        user: this.sanitizeUser(savedUser),
        ...tokens,
      }
    } else {
      throw new BadRequestException('无效的注册方式')
    }
  }

  async login(loginDto: LoginDto) {
    const { loginType, phone, smsCode, username, password } = loginDto

    if (loginType === 'phone') {
      // 手机号登录
      if (!phone || !smsCode) {
        throw new BadRequestException('手机号和验证码不能为空')
      }

      // 验证短信验证码
      await this.smsService.verifySmsCode(phone, smsCode, 'login')

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { phone },
        select: [
          'id',
          'phone',
          'username',
          'password',
          'avatar',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已被禁用')
      }

      // 生成tokens
      const tokens = await this.generateTokens(user)

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      }
    } else if (loginType === 'username') {
      // 用户名登录
      if (!username || !password) {
        throw new BadRequestException('用户名和密码不能为空')
      }

      // 查找用户
      const user = await this.userRepository.findOne({
        where: { username },
        select: [
          'id',
          'phone',
          'username',
          'password',
          'avatar',
          'isActive',
          'createdAt',
          'updatedAt',
        ],
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户名或密码错误')
      }

      // 验证密码
      if (!user.password) {
        throw new UnauthorizedException('用户名或密码错误')
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new UnauthorizedException('用户名或密码错误')
      }

      // 生成tokens
      const tokens = await this.generateTokens(user)

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      }
    } else {
      throw new BadRequestException('无效的登录方式')
    }
  }

  async sendSmsCode(sendSmsDto: SendSmsDto) {
    const { phone, type } = sendSmsDto

    // 如果是注册验证码，检查手机号是否已存在
    if (type === 'register') {
      const existingUser = await this.userRepository.findOne({
        where: { phone },
      })
      if (existingUser) {
        throw new ConflictException('该手机号已被注册')
      }
    }

    // 如果是登录验证码，检查手机号是否存在
    if (type === 'login') {
      const existingUser = await this.userRepository.findOne({
        where: { phone },
      })
      if (!existingUser) {
        throw new NotFoundException('该手机号尚未注册')
      }
    }

    // 发送短信验证码
    await this.smsService.sendSmsCode(phone, type)

    return { message: '验证码发送成功' }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      })

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      })

      if (!user || !user.isActive) {
        throw new UnauthorizedException('用户不存在或已被禁用')
      }

      const tokens = await this.generateTokens(user)
      return tokens
    } catch {
      throw new UnauthorizedException('刷新令牌无效')
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user || !user.isActive) {
      throw new NotFoundException('用户不存在')
    }

    return this.sanitizeUser(user)
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 更新用户信息
    Object.assign(user, updateProfileDto)
    const updatedUser = await this.userRepository.save(user)

    return this.sanitizeUser(updatedUser)
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'phone',
        'username',
        'password',
        'avatar',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证当前密码
    if (!user.password) {
      throw new UnauthorizedException('用户未设置密码')
    }
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('当前密码错误')
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedNewPassword

    await this.userRepository.save(user)

    return { message: '密码修改成功' }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      username: user.username,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ])

    return {
      token: accessToken,
      refreshToken,
    }
  }

  private sanitizeUser(user: User) {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitizedUser } = user
    return sanitizedUser
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用')
    }

    return user
  }
}
