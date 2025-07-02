// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// 分页查询参数
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

// 管理员用户类型
export interface AdminUser {
  id: string
  username: string
  email?: string
  realName: string
  avatar?: string
  phone?: string
  isActive: boolean
  lastLoginAt?: string
  lastLoginIp?: string
  remark?: string
  createdAt: string
  updatedAt: string
  roles?: AdminRole[]
}

// 管理员角色类型
export interface AdminRole {
  id: string
  name: string
  displayName: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  permissions?: AdminPermission[]
}

// 管理员权限类型
export interface AdminPermission {
  id: string
  name: string
  displayName: string
  type: 'menu' | 'button' | 'api'
  resource?: string
  action?: string
  parentId?: string
  description?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 歌曲类型
export interface Song {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  audioUrl: string
  genre?: string
  year?: number
  playCount: number
  lyrics?: string
  fileSize?: number
  originalFileName?: string
  sourceId?: string
  sourceUrl?: string
  uploaderId?: string
  createdAt: string
  updatedAt: string
  uploader?: {
    id: string
    username?: string
    phone?: string
  }
}

// 用户类型
export interface User {
  id: string
  phone?: string
  username?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  user: AdminUser
  accessToken: string
  refreshToken: string
  permissions: string[]
}

// 统计数据类型
export interface OverviewStats {
  totalUsers: number
  totalSongs: number
  totalPlaylists: number
  totalPlays: number
  totalComments: number
  activeUsers: number
  totalPlayTime: number
}

// 趋势数据类型
export interface TrendData {
  date: string
  count: number
}

// 热门类型数据
export interface PopularGenre {
  genre: string
  songCount: number
  totalPlays: number
}

// 热门艺术家数据
export interface PopularArtist {
  artist: string
  songCount: number
  totalPlays: number
}

// 用户活跃度分析
export interface UserActivityAnalysis {
  totalUsers: number
  activeUsers7d: number
  activeUsers30d: number
  playDurationDistribution: {
    '0-1h': number
    '1-5h': number
    '5-20h': number
    '20h+': number
  }
}

// 内容统计
export interface ContentStats {
  songsByGenre: Array<{ genre: string; count: number }>
  songsByYear: Array<{ year: number; count: number }>
  playlistStats: {
    total: number
    public: number
    private: number
  }
  commentStats: {
    total: number
    recent: Array<{ date: string; count: number }>
  }
}

// 表单验证规则类型
export interface FormRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}

// 表格列配置类型
export interface TableColumn {
  key: string
  title: string
  width?: number
  sortable?: boolean
  render?: (value: any, record: any) => string | JSX.Element
}

// 菜单项类型
export interface MenuItem {
  key: string
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
  permission?: string
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string
  path?: string
}
