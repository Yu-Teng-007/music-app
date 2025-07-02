import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { AdminUser, AdminRole, AdminPermission } from '../../entities'
import { AdminLoginDto } from '../../dto'

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(AdminRole)
    private adminRoleRepository: Repository<AdminRole>,
    @InjectRepository(AdminPermission)
    private adminPermissionRepository: Repository<AdminPermission>,
    private jwtService: JwtService
  ) {}

  /**
   * 管理员登录
   */
  async login(loginDto: AdminLoginDto) {
    const { username, password } = loginDto

    // 查找管理员用户
    const adminUser = await this.adminUserRepository.findOne({
      where: { username, isActive: true },
      relations: ['roles', 'roles.permissions'],
      select: ['id', 'username', 'email', 'password', 'realName', 'avatar', 'phone', 'isActive'],
    })

    if (!adminUser) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, adminUser.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误')
    }

    // 更新最后登录时间
    await this.adminUserRepository.update(adminUser.id, {
      lastLoginAt: new Date(),
    })

    // 生成JWT token
    const payload = {
      sub: adminUser.id,
      username: adminUser.username,
      type: 'admin',
    }

    const accessToken = this.jwtService.sign(payload, { expiresIn: '24h' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    // 获取用户权限
    const permissions = this.extractPermissions(adminUser.roles)

    return {
      user: this.sanitizeUser(adminUser),
      accessToken,
      refreshToken,
      permissions,
    }
  }

  /**
   * 获取当前管理员信息
   */
  async getCurrentUser(userId: string) {
    const adminUser = await this.adminUserRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles', 'roles.permissions'],
    })

    if (!adminUser) {
      throw new UnauthorizedException('用户不存在或已被禁用')
    }

    const permissions = this.extractPermissions(adminUser.roles)

    return {
      user: this.sanitizeUser(adminUser),
      permissions,
    }
  }

  /**
   * 刷新token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken)

      const adminUser = await this.adminUserRepository.findOne({
        where: { id: payload.sub, isActive: true },
        relations: ['roles', 'roles.permissions'],
      })

      if (!adminUser) {
        throw new UnauthorizedException('用户不存在或已被禁用')
      }

      const newPayload = {
        sub: adminUser.id,
        username: adminUser.username,
        type: 'admin',
      }

      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '24h' })
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' })

      const permissions = this.extractPermissions(adminUser.roles)

      return {
        user: this.sanitizeUser(adminUser),
        accessToken,
        refreshToken: newRefreshToken,
        permissions,
      }
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌')
    }
  }

  /**
   * 检查权限
   */
  async checkPermission(userId: string, permission: string): Promise<boolean> {
    const adminUser = await this.adminUserRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles', 'roles.permissions'],
    })

    if (!adminUser) {
      return false
    }

    const permissions = this.extractPermissions(adminUser.roles)
    return permissions.includes(permission)
  }

  /**
   * 提取用户权限
   */
  private extractPermissions(roles: AdminRole[]): string[] {
    const permissions = new Set<string>()

    roles.forEach(role => {
      if (role.isActive) {
        role.permissions?.forEach(permission => {
          if (permission.isActive) {
            permissions.add(permission.name)
          }
        })
      }
    })

    return Array.from(permissions)
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: AdminUser) {
    const { password, ...sanitizedUser } = user
    return sanitizedUser
  }

  /**
   * 验证JWT token
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token)

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('无效的令牌类型')
      }

      const adminUser = await this.adminUserRepository.findOne({
        where: { id: payload.sub, isActive: true },
      })

      if (!adminUser) {
        throw new UnauthorizedException('用户不存在或已被禁用')
      }

      return payload
    } catch (error) {
      throw new UnauthorizedException('无效的令牌')
    }
  }
}
