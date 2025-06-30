<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { useAuthStore } from '@/stores/auth'
import { genreApi } from '@/services'
import type { Song } from '@/stores/music'
import type { Genre } from '@/services/genre-api'
import { Play, ChevronRight } from 'lucide-vue-next'

// 调整颜色深浅的辅助函数
const adjustColor = (color: string, amount: number): string => {
  // 如果颜色是十六进制格式
  if (color.startsWith('#')) {
    let hex = color.substring(1)

    // 将3位颜色扩展为6位
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    // 转换为RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // 调整颜色
    const newR = Math.max(0, Math.min(255, r + amount))
    const newG = Math.max(0, Math.min(255, g + amount))
    const newB = Math.max(0, Math.min(255, b + amount))

    // 转回十六进制
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`
  }

  // 如果是其他格式，返回原色
  return color
}

const router = useRouter()
const musicStore = useMusicStore()
const authStore = useAuthStore()

interface UserInfo {
  name?: string
  avatar: string
  greeting: string
  subGreeting: string
}

// 用户信息
const userInfo = ref<UserInfo>({
  name: '音乐爱好者',
  avatar: 'https://picsum.photos/60/60?random=100',
  greeting: '戴上耳机好好听',
  subGreeting: '今日榜单上歌曲的准备吧！',
})

// 最近播放的歌曲
const recentSongs = ref<Song[]>([])

// 精选分类
const featuredCategories = ref<Genre[]>([])

// 排行榜类型
const chartTypes = ref([
  {
    id: 'new',
    title: '新歌榜',
    subtitle: '每小时更新',
    coverUrl: 'https://picsum.photos/300/300?random=30',
  },
  {
    id: 'hot',
    title: '热歌榜',
    subtitle: '每周更新',
    coverUrl: 'https://picsum.photos/300/300?random=31',
  },
  {
    id: 'trending',
    title: '飙升榜',
    subtitle: '实时更新',
    coverUrl: 'https://picsum.photos/300/300?random=33',
  },
  {
    id: 'original',
    title: '原创榜',
    subtitle: '每日更新',
    coverUrl: 'https://picsum.photos/300/300?random=34',
  },
  {
    id: 'kpop',
    title: 'K-Pop榜',
    subtitle: '每周更新',
    coverUrl: 'https://picsum.photos/300/300?random=35',
  },
  {
    id: 'electronic',
    title: '电音榜',
    subtitle: '每日更新',
    coverUrl: 'https://picsum.photos/300/300?random=36',
  },
  {
    id: 'folk',
    title: '民谣榜',
    subtitle: '每周更新',
    coverUrl: 'https://picsum.photos/300/300?random=37',
  },
  {
    id: 'ancient',
    title: '古风榜',
    subtitle: '每日更新',
    coverUrl: 'https://picsum.photos/300/300?random=38',
  },
  {
    id: 'mv',
    title: 'MV榜',
    subtitle: '每日更新',
    coverUrl: 'https://picsum.photos/300/300?random=32',
  },
])

// 加载状态
const isLoading = ref(false)

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
  router.push('/player')
}

const goToChart = (chartId: string) => {
  router.push(`/charts/${chartId}`)
}

// 跳转到分类页面
const goToCategory = (categoryName: string) => {
  router.push(`/category/${categoryName}`)
}

// 跳转到分类列表
const goToCategories = () => {
  router.push('/category')
}

// 跳转到新歌首发
const goToNewReleases = () => {
  router.push('/new-releases')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=104'
}

// 加载用户信息
const loadUserInfo = async () => {
  if (!authStore.isAuthenticated) return

  if (authStore.isAuthenticated) {
    try {
      const profile = await authStore.getUserProfile()
      userInfo.value = {
        name: profile.username,
        avatar: profile.avatar || 'https://picsum.photos/60/60?random=100',
        greeting: profile.greeting,
        subGreeting: profile.subGreeting,
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // 使用默认信息
      if (authStore.user) {
        userInfo.value = {
          name: authStore.user.username,
          avatar: authStore.user.avatar || 'https://picsum.photos/60/60?random=100',
          greeting: '戴上耳机好好听',
          subGreeting: '今日榜单上歌曲的准备吧！',
        }
      }
    }
  }
}

// 加载最近播放歌曲
const loadRecentSongs = async () => {
  try {
    isLoading.value = true
    // 获取推荐歌曲作为最近播放（实际项目中应该是用户的播放历史）
    const songs = await musicStore.loadRecommendedSongs(2)
    recentSongs.value = songs
  } catch (error) {
    console.error('Failed to load recent songs:', error)
    // 如果加载失败，使用默认数据
    recentSongs.value = []
  } finally {
    isLoading.value = false
  }
}

// 加载精选分类
const loadFeaturedCategories = async () => {
  try {
    const categories = await genreApi.getActiveGenres()
    // 只显示前6个分类
    featuredCategories.value = categories.slice(0, 6)
  } catch (error) {
    console.error('Failed to load categories:', error)
    featuredCategories.value = []
  }
}

onMounted(async () => {
  // 加载用户信息
  await loadUserInfo()

  // 加载最近播放歌曲
  await loadRecentSongs()

  // 加载精选分类
  await loadFeaturedCategories()

  // 初始化播放列表（如果还没有歌曲的话）
  if (!musicStore.currentSong) {
    await musicStore.initializePlaylist()
    if (musicStore.playlist.length > 0) {
      // 设置当前歌曲为第一首歌曲，但不自动播放
      musicStore.setCurrentSong(musicStore.playlist[0])
    }
  }
})
</script>

<template>
  <div class="home-view">
    <!-- 头部用户信息区域 -->
    <div class="header-section">
      <div class="user-info">
        <div class="user-text">
          <h1>欢迎回来，{{ userInfo.name }}</h1>
          <p>{{ userInfo.greeting }}</p>
          <p>{{ userInfo.subGreeting }}</p>
        </div>
        <div class="user-avatar">
          <img :src="userInfo.avatar" :alt="userInfo.name" @error="handleImageError" />
        </div>
      </div>
    </div>

    <!-- 最近播放 -->
    <div class="section">
      <h2>最近播放</h2>
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="recentSongs.length > 0" class="recent-songs">
        <div v-for="song in recentSongs" :key="song.id" class="recent-card" @click="playSong(song)">
          <img
            :src="song.coverUrl || 'https://picsum.photos/300/300?random=105'"
            :alt="song.title"
            @error="handleImageError"
            class="recent-background"
          />
          <div class="recent-overlay"></div>
          <div class="recent-content">
            <div class="recent-info">
              <h3 class="recent-title">{{ song.title }}</h3>
              <p class="recent-artist">{{ song.artist }}</p>
            </div>
            <div class="play-button">
              <Play :size="24" fill="white" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无最近播放的歌曲</p>
      </div>
    </div>

    <!-- 音乐分类 -->
    <div class="section">
      <div class="section-header">
        <h2>音乐分类</h2>
        <button class="see-all-button" @click="goToCategories">查看全部</button>
      </div>
      <div class="categories-grid">
        <div
          v-for="(category, index) in featuredCategories"
          :key="category.id"
          class="category-card"
          @click="goToCategory(category.name)"
        >
          <img
            :src="`https://picsum.photos/300/300?random=${100 + index}`"
            :alt="category.name"
            class="category-image"
            @error="handleImageError"
          />
          <div class="category-overlay"></div>
          <div class="category-content">
            <div class="category-icon">{{ category.icon }}</div>
            <span class="category-name">{{ category.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 流行趋势 -->
    <div class="section">
      <div class="section-header">
        <h2>流行趋势</h2>
      </div>
      <div class="charts-grid">
        <div
          v-for="chart in chartTypes"
          :key="chart.id"
          class="chart-card"
          @click="goToChart(chart.id)"
        >
          <div class="chart-cover">
            <img :src="chart.coverUrl" :alt="chart.title" @error="handleImageError" />
          </div>
          <div class="chart-info">
            <h3 class="chart-title">{{ chart.title }}</h3>
            <p class="chart-subtitle">{{ chart.subtitle }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section">
      <div class="section-header">
        <h2>发现更多</h2>
      </div>
      <div class="quick-access">
        <div class="access-card" @click="goToNewReleases">
          <div class="access-icon">
            <span class="icon-emoji">🎵</span>
          </div>
          <div class="access-info">
            <h3>新歌首发</h3>
            <p>最新发布的热门歌曲</p>
          </div>
          <div class="access-arrow">
            <ChevronRight :size="20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 导入设计系统 */
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;

.home-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, $bg-secondary 0%, $bg-tertiary 50%, $bg-quaternary 100%);
  color: $text-primary;
  padding: $spacing-6;
  padding-bottom: calc(140px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */

  @include respond-to(md) {
    padding: $spacing-4;
  }

  @include respond-to(sm) {
    padding: $spacing-3;
  }
}

.header-section {
  padding: $spacing-8 0;

  @include respond-to(md) {
    padding: $spacing-6 0;
  }

  @include respond-to(sm) {
    padding: $spacing-4 0;
  }
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-sizing: border-box;
}

.user-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.user-text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.see-all-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.see-all-button:hover {
  color: white;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  height: 120px;
  /* 添加点击状态重置 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.category-card:active {
  transform: translateY(0);
}

.category-card:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.category-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  z-index: 2;
}

.category-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 3;
  transition: all 0.3s ease;
}

/* 移动端分类项优化 */
@media (hover: none) {
  .category-card:active {
    transform: scale(0.98);
    transition: all 0.1s ease;
  }

  .category-card:focus {
    outline: none;
    box-shadow: none;
  }
}

.category-icon {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.quick-access {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.access-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* 添加点击状态重置 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.access-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.access-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-radius: 12px;
  margin-right: 1rem;
}

.icon-emoji {
  font-size: 1.5rem;
}

.access-info {
  flex: 1;
}

.access-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: white;
}

.access-info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.access-arrow {
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
}

.access-card:hover .access-arrow {
  color: white;
  transform: translateX(4px);
}

.access-card:active {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(0);
}

.access-card:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端访问卡片优化 */
@media (hover: none) {
  .access-card:active {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(0.98);
    transition: all 0.1s ease;
  }

  .access-card:focus {
    outline: none;
    box-shadow: none;
  }
}

/* 最近播放样式 */
.recent-songs {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.recent-songs::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.recent-card {
  flex: 0 0 auto;
  width: 280px;
  height: 160px;
  border-radius: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;
  /* 添加点击状态重置 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.recent-card:hover {
  transform: scale(1.02);
}

.recent-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.recent-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 2;
}

.recent-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 3;
}

.recent-info {
  color: white;
}

.recent-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.recent-artist {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.play-button {
  align-self: flex-end;
  width: 48px;
  height: 48px;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  transition: all 0.2s ease;
}

.recent-card:hover .play-button {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.5);
}

.recent-card:active {
  transform: scale(0.98);
}

.recent-card:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端最近播放卡片优化 */
@media (hover: none) {
  .recent-card:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }

  .recent-card:focus {
    outline: none;
    box-shadow: none;
  }
}

/* 排行榜样式 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.chart-card:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.2);
}

.chart-card:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 移动端卡片优化 */
@media (hover: none) {
  .chart-card:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.1s ease;
  }

  .chart-card:focus {
    outline: none;
    box-shadow: none;
  }
}

.chart-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.chart-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-info {
  text-align: center;
}

.chart-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: white;
}

.chart-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-view {
    padding: 1.5rem;
    padding-bottom: calc(150px + env(safe-area-inset-bottom));
  }

  .user-text h1 {
    font-size: 2rem;
  }

  .recent-card {
    width: 240px;
    height: 140px;
  }

  .play-button {
    width: 40px;
    height: 40px;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  }
}

@media (max-width: 480px) {
  .user-info {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .recent-card {
    width: 200px;
    height: 120px;
  }

  .recent-title {
    font-size: 1rem;
  }

  .recent-artist {
    font-size: 0.8125rem;
  }

  .play-button {
    width: 36px;
    height: 36px;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .category-card {
    height: 100px;
  }

  .category-content {
    padding: 0.75rem 0.5rem;
  }

  .category-icon {
    font-size: 1.5rem;
    margin-bottom: 0.4rem;
  }
}
</style>
