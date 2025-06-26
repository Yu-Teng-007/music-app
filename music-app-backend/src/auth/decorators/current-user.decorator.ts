import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * 获取当前登录用户信息的装饰器
 * @param propertyPath 可选，指定要获取的用户属性路径，如 'id'、'email' 等
 */
export const CurrentUser = createParamDecorator(
  (propertyPath: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      return null
    }

    if (propertyPath) {
      return propertyPath.split('.').reduce((obj, prop) => {
        return obj && obj[prop] !== undefined ? obj[prop] : null
      }, user)
    }

    return user
  }
)
