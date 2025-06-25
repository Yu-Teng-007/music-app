<template>
  <div class="new-releases-view">
    <!-- 头部 -->
    <div class="header">
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" />
      </button>
      <h1>新歌首发</h1>
      <div class="header-actions">
        <button class="filter-button" @click="showFilterModal = true">
          <Filter :size="20" />
        </button>
      </div>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        :class="['filter-tab', { active: currentFilter === tab.value }]"
        @click="changeFilter(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载新歌...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="displayItems.length === 0" class="empty-state">
        <Music :size="64" />
        <h3>暂无新歌</h3>
        <p>暂时没有新发布的歌曲</p>
      </div>

      <!-- 新歌列表 -->
      <div v-else class="releases-list">
        <!-- 今日新歌 -->
        <div v-if="todayReleases.length > 0" class="release-section">
          <h2 class="section-title">
            <Calendar :size="20" />
            今日新歌
          </h2>
          <div class="songs-grid">
            <div
              v-for="song in todayReleases"
              :key="song.id"
              class="song-card"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img :src="song.coverUrl" :alt="song.title" @error="handleImageError" />
                <div class="play-overlay">
                  <Play :size="24" />
                </div>
                <div class="new-badge">NEW</div>
              </div>
              <div class="song-info">
                <h3 class="song-title">{{ song.title }}</h3>
                <p class="song-artist">{{ song.artist }}</p>
                <div class="song-meta">
                  <span class="release-time">{{ formatReleaseTime(song.createdAt) }}</span>
                </div>
              </div>
              <button class="favorite-button" @click.stop="toggleFavorite(song)">
                <Heart :size="16" :class="{ filled: isFavorite(song.id) }" />
              </button>
            </div>
          </div>
        </div>

        <!-- 本周新歌 -->
        <div v-if="weekReleases.length > 0" class="release-section">
          <h2 class="section-title">
            <Clock :size="20" />
            本周新歌
          </h2>
          <div class="songs-list">
            <div
              v-for="(song, index) in weekReleases"
              :key="song.id"
              class="song-item"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img :src="song.coverUrl" :alt="song.title" @error="handleImageError" />
                <div class="play-overlay">
                  <Play :size="16" />
                </div>
              </div>

              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
                <div class="song-meta">
                  <span class="song-album">{{ song.album }}</span>
                  <span class="release-time">{{ formatReleaseTime(song.createdAt) }}</span>
                </div>
              </div>

              <div class="song-actions">
                <button class="action-button" @click.stop="toggleFavorite(song)">
                  <Heart :size="16" :class="{ filled: isFavorite(song.id) }" />
                </button>
                <button class="action-button" @click.stop="showSongMenu(song)">
                  <MoreVertical :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 更多新歌 -->
        <div v-if="otherReleases.length > 0" class="release-section">
          <h2 class="section-title">
            <Sparkles :size="20" />
            更多新歌
          </h2>
          <div class="songs-list">
            <div
              v-for="song in otherReleases"
              :key="song.id"
              class="song-item"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img :src="song.coverUrl" :alt="song.title" @error="handleImageError" />
                <div class="play-overlay">
                  <Play :size="16" />
                </div>
              </div>

              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
                <div class="song-meta">
                  <span class="song-album">{{ song.album }}</span>
                  <span class="release-time">{{ formatReleaseTime(song.createdAt) }}</span>
                </div>
              </div>

              <div class="song-actions">
                <button class="action-button" @click.stop="toggleFavorite(song)">
                  <Heart :size="16" :class="{ filled: isFavorite(song.id) }" />
                </button>
                <button class="action-button" @click.stop="showSongMenu(song)">
                  <MoreVertical :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !isLoading" class="load-more">
        <button class="load-more-button" @click="loadMore">加载更多</button>
      </div>
    </div>

    <!-- 筛选模态框 -->
    <div v-if="showFilterModal" class="modal-overlay" @click="showFilterModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">筛选选项</h3>

        <div class="filter-section">
          <h4>发布时间</h4>
          <div class="filter-options">
            <button
              v-for="(time, index) in timeOptions"
              :key="index"
              :class="['filter-option', { active: selectedTime === time.value }]"
              @click="selectedTime = time.value"
            >
              {{ time.label }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <h4>音乐类型</h4>
          <div class="filter-options">
            <button
              v-for="(genre, index) in genreOptions"
              :key="index"
              :class="['filter-option', { active: selectedGenre === genre.value }]"
              @click="selectedGenre = genre.value"
            >
              {{ genre.label }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-button" @click="resetFilters">重置</button>
          <button class="confirm-button" @click="applyFilters">应用</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { useFavoritesStore } from '@/stores/favorites'
import { musicApi } from '@/services'
import type { Song } from '@/stores/music'
import {
  ChevronLeft,
  Filter,
  Calendar,
  Clock,
  Sparkles,
  Music,
  Play,
  Heart,
  MoreVertical,
} from 'lucide-vue-next'

const router = useRouter()
const musicStore = useMusicStore()
const favoritesStore = useFavoritesStore()

// 页面状态
const songs = ref<Song[]>([])
const isLoading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

// 筛选状态
const showFilterModal = ref(false)
const currentFilter = ref('all')
const selectedTime = ref<string | null>(null)
const selectedGenre = ref<string | null>(null)

// 筛选标签
const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]

// 时间选项
const timeOptions = [
  { value: null, label: '全部时间' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
]

// 类型选项
const genreOptions = [
  { value: null, label: '全部类型' },
  { value: '流行', label: '流行' },
  { value: '摇滚', label: '摇滚' },
  { value: '民谣', label: '民谣' },
  { value: '电子', label: '电子' },
  { value: '古典', label: '古典' },
]

// 计算属性
const displayItems = computed(() => {
  let filtered = songs.value

  // 按筛选标签过滤
  if (currentFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    filtered = songs.value.filter(song => {
      const releaseDate = new Date(song.createdAt || 0)

      switch (currentFilter.value) {
        case 'today':
          return releaseDate >= today
        case 'week':
          return releaseDate >= weekStart
        case 'month':
          return releaseDate >= monthStart
        default:
          return true
      }
    })
  }

  return filtered
})

const todayReleases = computed(() => {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return displayItems.value
    .filter(song => {
      const releaseDate = new Date(song.createdAt || 0)
      return releaseDate >= todayStart
    })
    .slice(0, 6) // 最多显示6首
})

const weekReleases = computed(() => {
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  return displayItems.value
    .filter(song => {
      const releaseDate = new Date(song.createdAt || 0)
      return releaseDate >= weekStart && releaseDate < todayStart
    })
    .slice(0, 10) // 最多显示10首
})

const otherReleases = computed(() => {
  const today = new Date()
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  return displayItems.value.filter(song => {
    const releaseDate = new Date(song.createdAt || 0)
    return releaseDate < weekStart
  })
})

// 方法
async function loadNewReleases(reset = false) {
  if (isLoading.value) return

  isLoading.value = true

  try {
    if (reset) {
      currentPage.value = 1
      songs.value = []
      hasMore.value = true
    }

    // 获取推荐歌曲作为新歌（实际项目中应该有专门的新歌API）
    const newSongs = await musicApi.getRecommendedSongs(pageSize)

    // 为歌曲添加随机的发布时间（模拟新歌）
    const songsWithReleaseTime = newSongs.map((song: any) => ({
      ...song,
      createdAt: generateRandomReleaseTime(),
    }))

    if (reset) {
      songs.value = songsWithReleaseTime
    } else {
      songs.value.push(...songsWithReleaseTime)
    }

    // 按发布时间排序
    songs.value.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )

    hasMore.value = newSongs.length === pageSize
    currentPage.value++
  } catch (error) {
    console.error('加载新歌失败:', error)
  } finally {
    isLoading.value = false
  }
}

function generateRandomReleaseTime(): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30) // 0-30天前
  const releaseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  return releaseDate.toISOString()
}

function loadMore() {
  loadNewReleases(false)
}

function changeFilter(filterValue: string) {
  currentFilter.value = filterValue
}

function applyFilters() {
  showFilterModal.value = false
  // 这里可以根据筛选条件重新加载数据
  loadNewReleases(true)
}

function resetFilters() {
  selectedTime.value = null
  selectedGenre.value = null
  showFilterModal.value = false
  loadNewReleases(true)
}

function playSong(song: Song) {
  musicStore.setPlaylist(displayItems.value)
  musicStore.setCurrentSong(song)
  musicStore.play()
}

function toggleFavorite(song: Song) {
  if (isFavorite(song.id)) {
    favoritesStore.removeFavorite(song.id)
  } else {
    favoritesStore.addFavorite(song.id)
  }
}

function isFavorite(songId: string): boolean {
  return favoritesStore.favorites.some(fav => fav.songId === songId)
}

function showSongMenu(song: Song) {
  // TODO: 实现歌曲菜单
  console.log('显示歌曲菜单:', song.title)
}

function formatReleaseTime(dateString?: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}周前`
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 1000)
}

function goBack() {
  router.go(-1)
}

onMounted(() => {
  loadNewReleases(true)
})
</script>

<style scoped>
.new-releases-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  position: sticky;
  top: 0;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-button,
.filter-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.back-button:hover,
.filter-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-tab.active {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-color: #007aff;
}

.content {
  padding: 0 1rem;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
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

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
}

.releases-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.release-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: white;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.song-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.song-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.song-card .song-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.song-card .song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.song-card:hover .play-overlay {
  opacity: 1;
}

.new-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: linear-gradient(135deg, #ff4757, #ff3742);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.song-card .song-info {
  flex: 1;
}

.song-card .song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-card .song-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-card .song-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.favorite-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.favorite-button:hover {
  color: white;
  background: rgba(0, 0, 0, 0.7);
}

.favorite-button .filled {
  color: #ff4757;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-item .song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.song-item .song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.song-item .song-info {
  flex: 1;
  min-width: 0;
}

.song-item .song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item .song-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-item .song-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.song-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.action-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.action-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.action-button .filled {
  color: #ff4757;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.load-more-button {
  padding: 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section h4 {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.75rem 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-option {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-option:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-option.active {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-color: #007aff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.confirm-button {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  color: white;
  font-weight: 600;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .song-item .song-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .songs-grid {
    grid-template-columns: 1fr 1fr;
  }

  .song-card {
    padding: 0.75rem;
  }

  .release-section {
    padding: 1rem;
  }
}
</style>
