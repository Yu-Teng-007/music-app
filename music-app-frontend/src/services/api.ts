import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/stores/auth'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')

      // 可以在这里触发重新登录逻辑
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

// API响应类型
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 认证相关API
export const authApi = {
  // 用户登录
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post(
        '/auth/login',
        credentials,
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败，请检查用户名和密码')
    }
  },

  // 用户注册
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await apiClient.post(
        '/auth/register',
        credentials,
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '注册失败，请稍后重试')
    }
  },

  // 刷新token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ token: string; refreshToken: string }>> =
        await apiClient.post('/auth/refresh', { refreshToken })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token刷新失败')
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/me')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户信息失败')
    }
  },

  // 用户登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error: any) {
      // 即使服务器登出失败，也要清除本地状态
      console.error('Server logout failed:', error)
    }
  },

  // 更新用户信息
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.put(
        '/auth/profile',
        userData,
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新用户信息失败')
    }
  },

  // 修改密码
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await apiClient.put('/auth/change-password', data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '修改密码失败')
    }
  },

  // 忘记密码
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '发送重置密码邮件失败')
    }
  },

  // 重置密码
  async resetPassword(data: { token: string; password: string }): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '重置密码失败')
    }
  },
}

// 音乐相关API
export const musicApi = {
  // 获取歌曲列表
  async getSongs(params?: {
    search?: string
    genre?: string
    artist?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }) {
    try {
      const response = await apiClient.get('/songs', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取歌曲列表失败')
    }
  },

  // 获取单个歌曲详情
  async getSong(id: string) {
    try {
      const response = await apiClient.get(`/songs/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取歌曲详情失败')
    }
  },

  // 播放歌曲（增加播放次数）
  async playSong(id: string) {
    try {
      const response = await apiClient.post(`/songs/${id}/play`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '播放歌曲失败')
    }
  },

  // 获取推荐歌曲
  async getRecommendedSongs(limit?: number) {
    try {
      const response = await apiClient.get('/songs/recommended', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取推荐歌曲失败')
    }
  },

  // 获取热门歌曲
  async getPopularSongs(limit?: number) {
    try {
      const response = await apiClient.get('/songs/popular', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取热门歌曲失败')
    }
  },

  // 搜索歌曲
  async searchSongs(keyword: string, limit?: number) {
    try {
      const response = await apiClient.get('/songs/search', {
        params: { keyword, limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '搜索歌曲失败')
    }
  },

  // 按类型获取歌曲
  async getSongsByGenre(genre: string, limit?: number) {
    try {
      const response = await apiClient.get(`/songs/genre/${genre}`, {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取分类歌曲失败')
    }
  },

  // 按艺术家获取歌曲
  async getSongsByArtist(artist: string, limit?: number) {
    try {
      const response = await apiClient.get(`/songs/artist/${artist}`, {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取艺术家歌曲失败')
    }
  },
}

// 收藏相关API
export const favoritesApi = {
  // 添加收藏
  async addFavorite(songId: string) {
    try {
      const response = await apiClient.post('/favorites', { songId })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加收藏失败')
    }
  },

  // 取消收藏
  async removeFavorite(songId: string) {
    try {
      const response = await apiClient.delete(`/favorites/${songId}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '取消收藏失败')
    }
  },

  // 获取收藏列表
  async getFavorites(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const response = await apiClient.get('/favorites', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取收藏列表失败')
    }
  },

  // 检查收藏状态
  async checkFavorite(songId: string) {
    try {
      const response = await apiClient.get(`/favorites/check/${songId}`)
      return response.data.data.isFavorite
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '检查收藏状态失败')
    }
  },

  // 获取收藏数量
  async getFavoriteCount() {
    try {
      const response = await apiClient.get('/favorites/count')
      return response.data.data.count
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取收藏数量失败')
    }
  },
}

// 播放列表相关API
export const playlistApi = {
  // 获取播放列表
  async getPlaylists(params?: { search?: string; isPrivate?: boolean }) {
    try {
      const response = await apiClient.get('/playlists', { params })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放列表失败')
    }
  },

  // 获取我的播放列表
  async getMyPlaylists() {
    try {
      const response = await apiClient.get('/playlists/my')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取我的播放列表失败')
    }
  },

  // 获取公开播放列表
  async getPublicPlaylists(limit?: number) {
    try {
      const response = await apiClient.get('/playlists/public', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取公开播放列表失败')
    }
  },

  // 获取推荐播放列表
  async getRecommendedPlaylists(limit?: number) {
    try {
      const response = await apiClient.get('/playlists/recommended', {
        params: { limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取推荐播放列表失败')
    }
  },

  // 搜索播放列表
  async searchPlaylists(keyword: string, limit?: number) {
    try {
      const response = await apiClient.get('/playlists/search', {
        params: { keyword, limit },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '搜索播放列表失败')
    }
  },

  // 获取播放列表详情
  async getPlaylist(id: string) {
    try {
      const response = await apiClient.get(`/playlists/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取播放列表详情失败')
    }
  },

  // 创建播放列表
  async createPlaylist(data: {
    name: string
    description?: string
    coverUrl?: string
    isPrivate?: boolean
  }) {
    try {
      const response = await apiClient.post('/playlists', data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '创建播放列表失败')
    }
  },

  // 更新播放列表
  async updatePlaylist(
    id: string,
    data: {
      name?: string
      description?: string
      coverUrl?: string
      isPrivate?: boolean
    },
  ) {
    try {
      const response = await apiClient.patch(`/playlists/${id}`, data)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '更新播放列表失败')
    }
  },

  // 删除播放列表
  async deletePlaylist(id: string) {
    try {
      await apiClient.delete(`/playlists/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '删除播放列表失败')
    }
  },

  // 添加歌曲到播放列表
  async addSongToPlaylist(playlistId: string, songId: string) {
    try {
      const response = await apiClient.post(`/playlists/${playlistId}/songs`, { songId })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '添加歌曲到播放列表失败')
    }
  },

  // 从播放列表移除歌曲
  async removeSongFromPlaylist(playlistId: string, songId: string) {
    try {
      const response = await apiClient.delete(`/playlists/${playlistId}/songs/${songId}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '从播放列表移除歌曲失败')
    }
  },
}

// 文件上传相关API
export const uploadApi = {
  // 上传音乐文件
  async uploadMusic(file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传音乐文件失败')
    }
  },

  // 上传封面图片
  async uploadCover(file: File) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload/cover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '上传封面图片失败')
    }
  },
}

// 导出axios实例供其他API使用
export { apiClient }
export default apiClient
