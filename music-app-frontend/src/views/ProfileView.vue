<template>
  <div class="profile-view">
    <!-- 用户信息头部 -->
    <div class="profile-header">
      <div class="user-avatar">
        <img
          :src="user.avatarUrl || 'https://picsum.photos/300/300?random=137'"
          :alt="user.name"
          @error="handleImageError"
        />
        <button class="edit-avatar-btn">
          <Camera :size="16" />
        </button>
      </div>

      <h1 class="user-name">{{ user.name }}</h1>
      <p class="user-handle">{{ user.handle }}</p>

      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-number">{{ user.playlists }}</span>
          <span class="stat-label">歌单</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ user.followers }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ user.following }}</span>
          <span class="stat-label">关注</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleMenuClick(item)"
      >
        <div class="menu-icon">
          <component :is="item.icon" :size="20" />
        </div>
        <span class="menu-label">{{ item.label }}</span>
        <ChevronRight :size="16" class="menu-arrow" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Camera,
  Heart,
  Users,
  Share,
  Settings,
  ChevronRight,
  LogOut,
  Clock,
  UserCog,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// 用户信息（从认证store获取或使用默认值）
const user = computed(() => {
  if (authStore.user) {
    // 生成用户显示名称和handle
    const displayName = authStore.user.username || authStore.user.phone || '用户'
    const handle = authStore.user.username
      ? `@${authStore.user.username}`
      : authStore.user.phone
        ? `@${authStore.user.phone.slice(-4)}` // 显示手机号后4位
        : '@user'

    return {
      name: displayName,
      handle: handle,
      avatarUrl: authStore.user.avatar || 'https://picsum.photos/300/300?random=138',
      playlists: 228, // TODO: 从API获取实际数据
      followers: 24.5, // TODO: 从API获取实际数据
      following: 4180, // TODO: 从API获取实际数据
    }
  }
  return {
    name: '未登录用户',
    handle: '@guest',
    avatarUrl: 'https://picsum.photos/300/300?random=138',
    playlists: 0,
    followers: 0,
    following: 0,
  }
})

const menuItems = computed(() => [
  {
    id: 'favorites',
    label: '收藏歌曲',
    icon: Heart,
  },
  {
    id: 'history',
    label: '播放历史',
    icon: Clock,
  },
  {
    id: 'account',
    label: '账户管理',
    icon: UserCog,
  },
  {
    id: 'settings',
    label: '设置',
    icon: Settings,
  },
  ...(authStore.isAuthenticated
    ? [
        {
          id: 'logout',
          label: '退出登录',
          icon: LogOut,
        },
      ]
    : []),
])

const handleMenuClick = async (item: any) => {
  switch (item.id) {
    case 'favorites':
      router.push('/favorites')
      break
    case 'history':
      router.push('/history')
      break
    case 'account':
      router.push('/account')
      break
    case 'friends':
      // TODO: 实现好友功能
      console.log('好友功能暂未实现')
      break
    case 'share':
      // TODO: 实现分享功能
      console.log('分享功能暂未实现')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=139'
}

// 组件挂载时检查认证状态
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth')
  }
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #007aff 0%, #1a1a2e 40%, #16213e 100%);
  color: white;
  padding-bottom: 100px;
}

.profile-header {
  text-align: center;
  padding: 2rem 1rem;
}

.user-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  /* 移除 overflow: hidden 以确保编辑按钮完全显示 */
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 10px;
  right: 0;
  background: #007aff;
  border: 2px solid white;
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.edit-avatar-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.edit-avatar-btn:active {
  background: #004494;
  transform: scale(0.98);
}

.edit-avatar-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

/* 移动端编辑头像按钮优化 */
@media (hover: none) {
  .edit-avatar-btn:active {
    background: #004494;
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .edit-avatar-btn:focus {
    outline: none;
    box-shadow: none;
  }
}

.user-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.user-handle {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0 0 2rem 0;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.menu-section {
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem;
  border-radius: 1rem;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.99);
}

.menu-item:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端菜单项优化 */
@media (hover: none) {
  .menu-item:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
    transition: all 0.1s ease;
  }

  .menu-item:focus {
    outline: none;
    background: transparent;
    box-shadow: none;
  }
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.menu-label {
  flex: 1;
  font-weight: 500;
}

.menu-arrow {
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-stats {
    gap: 1rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }
}
</style>
