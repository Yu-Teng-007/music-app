import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false, title: '登录' },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, title: '仪表盘', permission: 'admin:menu:dashboard' },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { requiresAuth: true, title: '用户管理', permission: 'admin:menu:users' },
    },
    {
      path: '/songs',
      name: 'songs',
      component: () => import('@/views/SongsView.vue'),
      meta: { requiresAuth: true, title: '歌曲管理', permission: 'admin:menu:songs' },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsView.vue'),
      meta: { requiresAuth: true, title: '数据统计', permission: 'admin:menu:analytics' },
    },
    {
      path: '/system',
      children: [
        {
          path: 'roles',
          name: 'system-roles',
          component: () => import('@/views/system/RolesView.vue'),
          meta: { requiresAuth: true, title: '角色管理', permission: 'admin:role:list' },
        },
        {
          path: 'permissions',
          name: 'system-permissions',
          component: () => import('@/views/system/PermissionsView.vue'),
          meta: { requiresAuth: true, title: '权限管理', permission: 'admin:permission:list' },
        },
        {
          path: 'config',
          name: 'system-config',
          component: () => import('@/views/system/ConfigView.vue'),
          meta: { requiresAuth: true, title: '系统配置', permission: 'admin:config:list' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { requiresAuth: false, title: '页面不存在' },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const appStore = useAppStore()

  // 设置页面标题
  if (to.meta.title) {
    appStore.setPageTitle(to.meta.title as string)
  }

  // 生成面包屑
  appStore.generateBreadcrumbs(to.path)

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // 检查权限
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
      // 权限不足，跳转到仪表盘或显示错误页面
      next({ name: 'dashboard' })
      return
    }
  }

  // 如果已登录且访问登录页，重定向到仪表盘
  if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
