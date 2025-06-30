import type { RouteModule } from '../types'

/**
 * 认证相关路由模块
 * 包含登录、注册等页面
 */
export const authRoutes: RouteModule = {
  name: 'auth',
  routes: [
    // 认证主页面
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../../views/AuthView.vue'),
      meta: { 
        requiresGuest: true,
        title: '登录注册'
      },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../../views/AuthView.vue'),
          meta: { 
            requiresGuest: true,
            title: '登录'
          },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../../views/AuthView.vue'),
          meta: { 
            requiresGuest: true,
            title: '注册'
          },
        },
      ],
    },
    // 重定向路由
    {
      path: '/login',
      redirect: '/auth',
    },
    {
      path: '/register',
      redirect: '/auth',
    },
  ]
}
