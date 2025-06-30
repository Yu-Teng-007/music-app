/**
 * 路由模块统一导出
 */

export { baseRoutes } from './base'
export { musicRoutes } from './music'
export { userRoutes } from './user'
export { authRoutes } from './auth'
export { featureRoutes } from './features'

// 导出所有路由模块的数组
export const routeModules = [
  baseRoutes,
  musicRoutes,
  userRoutes,
  authRoutes,
  featureRoutes,
]
