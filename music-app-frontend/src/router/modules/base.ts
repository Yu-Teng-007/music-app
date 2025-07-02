import type { RouteModule } from '../types'
import HomeView from '../../views/HomeView.vue'

/**
 * 基础路由模块
 * 包含首页、引导页、关于页等基础页面
 */
export const baseRoutes: RouteModule = {
  name: 'base',
  routes: [
    // 引导页面路由
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../../views/OnboardingView.vue'),
      meta: {
        requiresGuest: true,
        hideNavigation: true,
        title: '欢迎使用',
      },
    },
    // 首页
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '首页',
        showInMenu: true,
        menuOrder: 1,
      },
    },
    // 关于页面
    {
      path: '/about',
      name: 'about',
      component: () => import('../../views/AboutView.vue'),
      meta: {
        title: '关于',
        showInMenu: true,
        menuOrder: 99,
      },
    },
    // 404页面 - 必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../../views/NotFoundView.vue'),
      meta: {
        title: '页面未找到',
      },
    },
  ],
}
