/**
 * 路由模块统一导出
 */

// 导入所有路由模块
import { authRoutes } from './auth'
import { baseRoutes } from './base'
import { featureRoutes } from './features'
import { musicRoutes } from './music'
import { userRoutes } from './user'

// 重新导出所有路由模块
export { authRoutes, baseRoutes, featureRoutes, musicRoutes, userRoutes }

// 导出所有路由模块的数组
export const routeModules = [baseRoutes, musicRoutes, userRoutes, authRoutes, featureRoutes]
