import type { RouteModule } from '../types'

/**
 * 用户相关路由模块
 * 包含歌单、收藏、个人中心、设置等页面
 */
export const userRoutes: RouteModule = {
  name: 'user',
  routes: [
    // 我的歌单
    {
      path: '/playlist',
      name: 'playlist',
      component: () => import('../../views/PlaylistView.vue'),
      meta: { 
        requiresAuth: true,
        title: '我的歌单',
        showInMenu: true,
        menuOrder: 4
      },
    },
    // 歌单详情页路由
    {
      path: '/playlist/:id',
      name: 'playlist-detail',
      component: () => import('../../views/PlaylistDetailView.vue'),
      meta: {
        title: '歌单详情'
      }
    },
    // 个人中心
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../../views/ProfileView.vue'),
      meta: { 
        requiresAuth: true,
        title: '个人中心',
        showInMenu: true,
        menuOrder: 8
      },
    },
    // 收藏页面
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../../views/FavoritesView.vue'),
      meta: { 
        requiresAuth: true,
        title: '我的收藏',
        showInMenu: true,
        menuOrder: 5
      },
    },
    // 播放历史页面
    {
      path: '/history',
      name: 'history',
      component: () => import('../../views/HistoryView.vue'),
      meta: { 
        requiresAuth: true,
        title: '播放历史',
        showInMenu: true,
        menuOrder: 6
      },
    },
    // 设置页面
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../../views/SettingsView.vue'),
      meta: { 
        requiresAuth: true,
        title: '设置',
        showInMenu: true,
        menuOrder: 9
      },
    },
    // 账户管理页面
    {
      path: '/account',
      name: 'account',
      component: () => import('../../views/AccountView.vue'),
      meta: { 
        requiresAuth: true,
        title: '账户管理'
      },
    },
    // 下载管理页面
    {
      path: '/downloads',
      name: 'downloads',
      component: () => import('../../views/DownloadsView.vue'),
      meta: { 
        requiresAuth: true,
        title: '下载管理',
        showInMenu: true,
        menuOrder: 7
      },
    },
  ]
}
