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
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchResultsView.vue'),
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
    // 收藏页面
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { requiresAuth: true },
    },
    // 404页面 - 必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  try {
    // 页面加载进度指示（可选）
    if (typeof window !== 'undefined') {
      document.body.style.cursor = 'wait'
    }

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

    // 路由参数验证
    if (to.params.id && !/^[a-zA-Z0-9-_]+$/.test(to.params.id as string)) {
      // 无效的ID参数，重定向到404
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

// 路由后置守卫
router.afterEach((to, from) => {
  // 恢复鼠标样式
  if (typeof window !== 'undefined') {
    document.body.style.cursor = 'default'
  }

  // 页面标题设置
  const titles: Record<string, string> = {
    home: '首页',
    discover: '发现音乐',
    playlist: '我的歌单',
    favorites: '我的收藏',
    profile: '个人中心',
    search: '搜索结果',
    auth: '登录注册',
    settings: '设置',
    player: '播放器',
    'not-found': '页面未找到',
  }

  const pageTitle = titles[to.name as string] || '音乐应用'
  document.title = `${pageTitle} - 音乐应用`

  // 页面访问统计（可选）
  if (typeof window !== 'undefined' && (window as any).gtag) {
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
router.onError((error) => {
  console.error('路由错误:', error)

  // 可以在这里添加错误报告逻辑
  if (typeof window !== 'undefined') {
    // 显示用户友好的错误信息
    alert('页面加载失败，请刷新页面重试')
  }
})

export default router
