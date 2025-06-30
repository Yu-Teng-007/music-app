import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isFirstLaunch } from '@/utils'
import {
  requiresAuth,
  requiresGuest,
  validateRouteParams,
  createAuthRedirect,
  setPageTitle,
} from './utils'

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    try {
      // 页面加载进度指示（可选）
      if (typeof window !== 'undefined') {
        document.body.style.cursor = 'wait'
      }

      // 检查是否为首次启动（除了引导页面本身）
      if (to.name !== 'onboarding' && isFirstLaunch()) {
        next('/onboarding')
        return
      }

      // 如果已完成引导但访问引导页面，重定向到首页
      if (to.name === 'onboarding' && !isFirstLaunch()) {
        next('/')
        return
      }

      // 检查是否需要认证
      if (requiresAuth(to)) {
        if (!authStore.isAuthenticated) {
          // 未登录，重定向到登录页面
          next(createAuthRedirect(to.fullPath))
          return
        }

        // 检查token是否过期
        if (authStore.isTokenExpired()) {
          authStore.clearAuth()
          next(createAuthRedirect(to.fullPath))
          return
        }
      }

      // 检查是否需要游客状态（未登录）
      if (requiresGuest(to) && authStore.isAuthenticated) {
        // 已登录用户访问登录/注册页面，重定向到首页
        next('/')
        return
      }

      // 路由参数验证
      if (!validateRouteParams(to)) {
        // 无效的参数，重定向到404
        next({ name: 'not-found' })
        return
      }

      next()
    } catch (error) {
      console.error('路由守卫错误:', error)
      // 发生错误时重定向到首页
      next('/')
    }
  })

  // 后置守卫
  router.afterEach((to, from) => {
    // 恢复鼠标样式
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'default'
    }

    // 设置页面标题
    setPageTitle(to)

    // 页面访问统计（可选）
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const pageTitle = to.meta?.title || '音乐应用'
      ;(window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: pageTitle,
        page_location: window.location.href,
      })
    }

    // 滚动到顶部（除非是同一页面内的导航）
    if (to.path !== from.path) {
      window.scrollTo(0, 0)
    }
  })

  // 路由错误处理
  router.onError(error => {
    console.error('路由错误:', error)

    // 可以在这里添加错误报告逻辑
    if (typeof window !== 'undefined') {
      // 显示用户友好的错误信息
      alert('页面加载失败，请刷新页面重试')
    }
  })
}
