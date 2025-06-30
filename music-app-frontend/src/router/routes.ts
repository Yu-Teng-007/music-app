import type { RouteRecordRaw } from 'vue-router'
import { baseRoutes } from './modules/base'
import { musicRoutes } from './modules/music'
import { userRoutes } from './modules/user'
import { authRoutes } from './modules/auth'
import { featureRoutes } from './modules/features'

/**
 * 合并所有路由模块
 */
function combineRoutes(): RouteRecordRaw[] {
  const allRoutes: RouteRecordRaw[] = []

  // 按顺序添加各模块路由
  allRoutes.push(...baseRoutes.routes)
  allRoutes.push(...musicRoutes.routes)
  allRoutes.push(...userRoutes.routes)
  allRoutes.push(...authRoutes.routes)
  allRoutes.push(...featureRoutes.routes)

  return allRoutes
}

export const routes = combineRoutes()
