import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由元信息接口
 */
export interface RouteMeta {
  /** 是否需要认证 */
  requiresAuth?: boolean
  /** 是否需要游客状态（未登录） */
  requiresGuest?: boolean
  /** 是否隐藏导航 */
  hideNavigation?: boolean
  /** 页面标题 */
  title?: string
  /** 页面图标 */
  icon?: string
  /** 是否在菜单中显示 */
  showInMenu?: boolean
  /** 菜单排序 */
  menuOrder?: number
}

/**
 * 扩展的路由记录类型
 */
export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta
}

/**
 * 路由模块接口
 */
export interface RouteModule {
  /** 模块名称 */
  name: string
  /** 模块路由 */
  routes: AppRouteRecordRaw[]
}
