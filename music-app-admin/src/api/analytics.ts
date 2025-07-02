import { api } from '@/utils/request'
import type {
  OverviewStats,
  TrendData,
  PopularGenre,
  PopularArtist,
  UserActivityAnalysis,
  ContentStats,
} from '@/types'

// 数据统计API
export const analyticsApi = {
  // 获取总体统计
  getOverview(): Promise<OverviewStats> {
    return api.get('/admin/analytics/overview')
  },

  // 获取用户增长趋势
  getUserGrowthTrend(days?: number): Promise<TrendData[]> {
    return api.get('/admin/analytics/user-growth', { params: { days } })
  },

  // 获取播放趋势
  getPlayTrend(days?: number): Promise<TrendData[]> {
    return api.get('/admin/analytics/play-trend', { params: { days } })
  },

  // 获取热门音乐类型
  getPopularGenres(limit?: number): Promise<PopularGenre[]> {
    return api.get('/admin/analytics/popular-genres', { params: { limit } })
  },

  // 获取热门艺术家
  getPopularArtists(limit?: number): Promise<PopularArtist[]> {
    return api.get('/admin/analytics/popular-artists', { params: { limit } })
  },

  // 获取用户活跃度分析
  getUserActivity(): Promise<UserActivityAnalysis> {
    return api.get('/admin/analytics/user-activity')
  },

  // 获取内容统计
  getContentStats(): Promise<ContentStats> {
    return api.get('/admin/analytics/content-stats')
  },
}
