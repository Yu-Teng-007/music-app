// API响应基础类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 分页参数类型
export interface PaginationParams {
  page?: number
  limit?: number
}

// 搜索参数类型
export interface SearchParams {
  search?: string
  keyword?: string
}

// 排序参数类型
export interface SortParams {
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

// 歌曲查询参数类型
export interface SongQueryParams extends PaginationParams, SearchParams, SortParams {
  genre?: string
  artist?: string
}

// 播放列表查询参数类型
export interface PlaylistQueryParams extends SearchParams {
  isPrivate?: boolean
}

// 收藏查询参数类型
export interface FavoriteQueryParams extends PaginationParams, SearchParams {}

// 播放列表创建/更新数据类型
export interface PlaylistData {
  name: string
  description?: string
  coverUrl?: string
  isPrivate?: boolean
}

export interface PlaylistUpdateData {
  name?: string
  description?: string
  coverUrl?: string
  isPrivate?: boolean
}

// 密码修改数据类型
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

// 重置密码数据类型
export interface ResetPasswordData {
  token: string
  password: string
}

// 文件上传响应类型
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimetype: string
}
