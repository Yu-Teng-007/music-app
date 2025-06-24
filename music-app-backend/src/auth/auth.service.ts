import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
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
} from '../dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password, name, confirmPassword } = registerDto

    // 验证密码确认
    if (password !== confirmPassword) {
      throw new ConflictException('两次输入的密码不一致')
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    })
    if (existingUserByEmail) {
      throw new ConflictException('该邮箱已被注册')
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
      email,
      username,
      name,
      password: hashedPassword,
    })

    const savedUser = await this.userRepository.save(user)

    // 生成tokens
    const tokens = await this.generateTokens(savedUser)

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'email',
        'username',
        'name',
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
    } catch (error) {
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
      select: ['id', 'email', 'name', 'password', 'avatar', 'isActive', 'createdAt', 'updatedAt'],
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    // 验证当前密码
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
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
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

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    })

    if (!user || !user.isActive) {
      // 为了安全，即使用户不存在也返回成功消息
      return { message: '如果该邮箱存在，重置密码邮件已发送' }
    }

    // 生成重置令牌
    const resetToken = this.generateResetToken()
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1小时后过期

    // 保存重置令牌到数据库
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = resetTokenExpires
    await this.userRepository.save(user)

    // TODO: 发送邮件
    // 在实际应用中，这里应该发送包含重置链接的邮件
    console.log(`重置密码令牌: ${resetToken}`)
    console.log(`重置链接: http://localhost:5173/auth/reset-password?token=${resetToken}`)

    return { message: '重置密码邮件已发送' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    })

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('重置令牌无效或已过期')
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码并清除重置令牌
    user.password = hashedPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null

    await this.userRepository.save(user)

    return { message: '密码重置成功' }
  }

  private generateResetToken(): string {
    // 生成32位随机字符串
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
