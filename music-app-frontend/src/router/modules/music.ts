import type { RouteModule } from '../types'

/**
 * 音乐相关路由模块
 * 包含发现音乐、播放器、艺术家、专辑等页面
 */
export const musicRoutes: RouteModule = {
  name: 'music',
  routes: [
    // 发现音乐
    {
      path: '/discover',
      name: 'discover',
      component: () => import('../../views/DiscoverView.vue'),
      meta: {
        title: '发现音乐',
        showInMenu: true,
        menuOrder: 2
      }
    },
    // 播放器
    {
      path: '/player',
      name: 'player',
      component: () => import('../../views/PlayerView.vue'),
      meta: {
        title: '播放器',
        hideNavigation: true
      }
    },
    // 艺术家详情
    {
      path: '/artist/:id',
      name: 'artist',
      component: () => import('../../views/ArtistView.vue'),
      meta: {
        title: '艺术家'
      }
    },
    // 专辑详情
    {
      path: '/album/:id',
      name: 'album',
      component: () => import('../../views/AlbumView.vue'),
      meta: {
        title: '专辑'
      }
    },
    // 搜索结果
    {
      path: '/search',
      name: 'search',
      component: () => import('../../views/SearchResultsView.vue'),
      meta: {
        title: '搜索结果'
      }
    },
    // 分类浏览页面
    {
      path: '/category/:type?',
      name: 'category',
      component: () => import('../../views/CategoryView.vue'),
      meta: {
        title: '分类浏览'
      }
    },
    // 排行榜详情页面
    {
      path: '/charts/:type',
      name: 'charts',
      component: () => import('../../views/ChartsView.vue'),
      meta: {
        title: '排行榜'
      }
    },
    // 新歌首发页面
    {
      path: '/new-releases',
      name: 'new-releases',
      component: () => import('../../views/NewReleasesView.vue'),
      meta: {
        title: '新歌首发',
        showInMenu: true,
        menuOrder: 3
      }
    },
  ]
}
