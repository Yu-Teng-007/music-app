import type { RouteLocationNormalized } from 'vue-router'
import type { RouteMeta } from './types'

/**
 * 页面标题映射
 */
export const PAGE_TITLES: Record<string, string> = {
  home: '首页',
  discover: '发现音乐',
  playlist: '我的歌单',
  'playlist-detail': '歌单详情',
  favorites: '我的收藏',
  history: '播放历史',
  profile: '个人中心',
  search: '搜索结果',
  auth: '登录注册',
  login: '登录',
  register: '注册',
  settings: '设置',
  player: '播放器',
  artist: '艺术家',
  album: '专辑',
  onboarding: '欢迎使用',
  'not-found': '页面未找到',
  about: '关于',
  account: '账户管理',
  social: '社交',
  downloads: '下载管理',
  'dev-tools': '开发工具',
  category: '分类浏览',
  charts: '排行榜',
  'new-releases': '新歌首发',
}

/**
 * 获取页面标题
 */
export function getPageTitle(route: RouteLocationNormalized): string {
  // 优先使用路由元信息中的标题
  if (route.meta?.title) {
    return route.meta.title as string
  }
  
  // 使用预定义的标题映射
  const routeName = route.name as string
  return PAGE_TITLES[routeName] || '音乐应用'
}

/**
 * 设置页面标题
 */
export function setPageTitle(route: RouteLocationNormalized): void {
  const pageTitle = getPageTitle(route)
  document.title = `${pageTitle} - 音乐应用`
}

/**
 * 检查路由是否需要认证
 */
export function requiresAuth(route: RouteLocationNormalized): boolean {
  return !!(route.meta as RouteMeta)?.requiresAuth
}

/**
 * 检查路由是否需要游客状态
 */
export function requiresGuest(route: RouteLocationNormalized): boolean {
  return !!(route.meta as RouteMeta)?.requiresGuest
}

/**
 * 检查路由是否隐藏导航
 */
export function hideNavigation(route: RouteLocationNormalized): boolean {
  return !!(route.meta as RouteMeta)?.hideNavigation
}

/**
 * 检查路由是否在菜单中显示
 */
export function showInMenu(route: RouteLocationNormalized): boolean {
  return !!(route.meta as RouteMeta)?.showInMenu
}

/**
 * 验证路由参数
 */
export function validateRouteParams(route: RouteLocationNormalized): boolean {
  // 验证ID参数
  if (route.params.id) {
    const id = route.params.id as string
    if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
      return false
    }
  }
  
  // 验证type参数
  if (route.params.type) {
    const type = route.params.type as string
    if (!/^[a-zA-Z0-9-_]+$/.test(type)) {
      return false
    }
  }
  
  return true
}

/**
 * 获取重定向路径
 */
export function getRedirectPath(route: RouteLocationNormalized): string {
  return route.query.redirect as string || '/'
}

/**
 * 创建带重定向的登录路径
 */
export function createAuthRedirect(currentPath: string): { path: string; query: { redirect: string } } {
  return {
    path: '/auth',
    query: { redirect: currentPath }
  }
}
