import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/discover',
      name: 'discover',
      component: () => import('../views/DiscoverView.vue'),
    },
    {
      path: '/playlist',
      name: 'playlist',
      component: () => import('../views/PlaylistView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/player',
      name: 'player',
      component: () => import('../views/PlayerView.vue'),
    },
    {
      path: '/artist/:id',
      name: 'artist',
      component: () => import('../views/ArtistView.vue'),
    },
    {
      path: '/album/:id',
      name: 'album',
      component: () => import('../views/AlbumView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/test-api',
      name: 'test-api',
      component: () => import('../views/TestApiView.vue'),
    },
    // 认证相关路由
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      meta: { requiresGuest: true },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/AuthView.vue'),
          meta: { requiresGuest: true },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/AuthView.vue'),
          meta: { requiresGuest: true },
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
    // 收藏页面（暂时重定向到个人页面）
    {
      path: '/favorites',
      name: 'favorites',
      redirect: '/profile',
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 未登录，重定向到登录页面
      next({
        path: '/auth',
        query: { redirect: to.fullPath },
      })
      return
    }

    // 检查token是否过期
    if (authStore.isTokenExpired()) {
      authStore.clearAuth()
      next({
        path: '/auth',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  // 检查是否需要游客状态（未登录）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // 已登录用户访问登录/注册页面，重定向到首页
    next('/')
    return
  }

  next()
})

export default router
