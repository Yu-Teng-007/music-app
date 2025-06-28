// 用户相关类型定义
export interface User {
  id: string
  phone?: string
  username?: string
  name?: string // 添加 name 属性以兼容现有代码
  avatar?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  phone?: string
  username?: string
  name?: string
  avatar?: string
}

export interface UserFollow {
  id: string
  followerId: string
  followingId: string
  createdAt: string
  follower?: User
  following?: User
}
