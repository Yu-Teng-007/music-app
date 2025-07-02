import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AdminAuthService } from './admin-auth.service'

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminAuthService: AdminAuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('用户信息不存在')
    }

    // 检查用户是否具有所需权限
    for (const permission of requiredPermissions) {
      const hasPermission = await this.adminAuthService.checkPermission(user.sub, permission)
      if (!hasPermission) {
        throw new ForbiddenException(`缺少权限: ${permission}`)
      }
    }

    return true
  }
}
