// 统一导出所有API服务和工具

// HTTP客户端
export { apiClient } from './http'

// API服务
export { authApi } from './auth-api'
export { musicApi } from './music-api'
export { favoritesApi } from './favorites-api'
export { playlistApi } from './playlist-api'
export { uploadApi } from './upload-api'

// 注意：认证相关的业务逻辑已迁移到 @/stores/auth 中
// 请直接使用 useAuthStore() 来处理认证操作

// 类型定义
export type {
  ApiResponse,
  PaginationParams,
  SearchParams,
  SortParams,
  SongQueryParams,
  PlaylistQueryParams,
  FavoriteQueryParams,
  PlaylistData,
  PlaylistUpdateData,
  ChangePasswordData,
  ResetPasswordData,
  UploadResponse,
} from './types'

// 表单验证工具
export {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateUsername,
  validatePhone,
  validatePlaylistName,
  validatePlaylistDescription,
  validateFileSize,
  validateFileType,
  validateAudioFile,
  validateImageFile,
} from './validators'
