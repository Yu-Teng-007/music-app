import type { RouteModule } from '../types'

/**
 * 其他功能路由模块
 * 包含社交、开发工具等页面
 */
export const featureRoutes: RouteModule = {
  name: 'features',
  routes: [
    // 社交功能页面
    {
      path: '/social',
      name: 'social',
      component: () => import('../../views/SocialView.vue'),
      meta: { 
        requiresAuth: true,
        title: '社交'
      },
    },
    // 开发工具页面（仅开发环境）
    {
      path: '/dev-tools',
      name: 'dev-tools',
      component: () => import('../../views/DevToolsView.vue'),
      meta: {
        title: '开发工具'
      }
    },
  ]
}
