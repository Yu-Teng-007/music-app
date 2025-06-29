<template>
  <div class="charts-view">
    <!-- 头部 -->
    <div class="header">
      <button class="btn-circle back-button" @click="goBack">
        <ChevronLeft :size="24" />
      </button>
      <h1>{{ chartTitle }}</h1>
      <div class="header-actions">
        <button class="btn-circle refresh-button" @click="refreshChart">
          <RotateCcw :size="20" />
        </button>
      </div>
    </div>

    <!-- 排行榜信息 -->
    <div class="chart-info">
      <div class="chart-banner">
        <div class="chart-cover">
          <img :src="chartCover" :alt="chartTitle" @error="handleImageError" />
          <div class="chart-overlay">
            <div class="chart-icon">
              <TrendingUp :size="32" />
            </div>
          </div>
        </div>
        <div class="chart-details">
          <h2>{{ chartTitle }}</h2>
          <p>{{ chartDescription }}</p>
          <div class="chart-meta">
            <span>{{ songs.length }} 首歌曲</span>
            <span>{{ updateTime }}</span>
          </div>
          <button
            class="btn-primary play-all-button"
            @click="playAll"
            :disabled="songs.length === 0"
          >
            <Play :size="18" />
            播放全部
          </button>
        </div>
      </div>
    </div>

    <!-- 排行榜列表 -->
    <div class="chart-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载排行榜...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="songs.length === 0" class="empty-state">
        <Music :size="64" />
        <h3>暂无数据</h3>
        <p>该排行榜暂时没有歌曲</p>
      </div>

      <!-- 歌曲列表 -->
      <div v-else class="songs-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="list-item song-item"
          :class="{ playing: isCurrentSong(song.id) }"
          @click="playSong(song)"
        >
          <div class="song-rank">
            <span class="rank-number" :class="getRankClass(index + 1)">{{ index + 1 }}</span>
            <div v-if="song.rankChange !== undefined" class="rank-change">
              <TrendingUp v-if="song.rankChange > 0" :size="12" class="rank-up" />
              <TrendingDown v-else-if="song.rankChange < 0" :size="12" class="rank-down" />
              <Minus v-else :size="12" class="rank-same" />
            </div>
          </div>

          <div class="song-cover">
            <img :src="song.coverUrl" :alt="song.title" @error="handleImageError" />
            <div class="play-overlay">
              <Play v-if="!isCurrentSong(song.id)" :size="16" />
              <Pause v-else :size="16" />
            </div>
          </div>

          <div class="song-info">
            <h4 class="song-title">{{ song.title }}</h4>
            <p class="song-artist">{{ song.artist }}</p>
            <div class="song-meta">
              <span class="song-album">{{ song.album }}</span>
              <span class="song-duration">{{ formatTime(song.duration) }}</span>
            </div>
          </div>

          <div class="song-stats">
            <div class="play-count">
              <Play :size="12" />
              <span>{{ formatPlayCount(song.playCount || 0) }}</span>
            </div>
          </div>

          <div class="song-actions">
            <button class="icon-button action-button" @click.stop="toggleFavorite(song, $event)">
              <Heart :size="16" :class="{ filled: isFavorite(song.id) }" />
            </button>
            <button class="icon-button action-button" @click.stop="showSongMenu(song, $event)">
              <MoreVertical :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { useFavoritesStore } from '@/stores/favorites'
import { musicApi } from '@/services'
import type { Song } from '@/stores/music'
import {
  ChevronLeft,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  Music,
  Heart,
  MoreVertical,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const favoritesStore = useFavoritesStore()

// 页面状态
const songs = ref<Song[]>([])
const isLoading = ref(false)

// 路由参数
const chartType = computed(() => route.params.type as string)

// 排行榜信息
const chartInfo = computed(() => {
  const charts: any = {
    new: {
      title: '新歌榜',
      description: '最新发布的热门歌曲，每小时更新',
      cover: 'https://picsum.photos/400/400?random=30',
      updateTime: '每小时更新',
    },
    hot: {
      title: '热歌榜',
      description: '最受欢迎的热门歌曲，根据播放量排序',
      cover: 'https://picsum.photos/400/400?random=31',
      updateTime: '每周更新',
    },
    trending: {
      title: '飙升榜',
      description: '播放量快速增长的歌曲，实时更新',
      cover: 'https://picsum.photos/400/400?random=33',
      updateTime: '实时更新',
    },
    original: {
      title: '原创榜',
      description: '优质原创音乐作品推荐',
      cover: 'https://picsum.photos/400/400?random=34',
      updateTime: '每日更新',
    },
    rock: {
      title: '摇滚榜',
      description: '最受欢迎的摇滚音乐',
      cover: 'https://picsum.photos/400/400?random=35',
      updateTime: '每周更新',
    },
    pop: {
      title: '流行榜',
      description: '流行音乐排行榜',
      cover: 'https://picsum.photos/400/400?random=36',
      updateTime: '每日更新',
    },
    ancient: {
      title: '古风榜',
      description: '古风音乐排行榜',
      cover: 'https://picsum.photos/400/400?random=38',
      updateTime: '每日更新',
    },
    mv: {
      title: 'MV榜',
      description: '热门MV排行榜',
      cover: 'https://picsum.photos/400/400?random=32',
      updateTime: '每日更新',
    },
  }

  return charts[chartType.value] || charts.hot
})

const chartTitle = computed(() => chartInfo.value.title)
const chartDescription = computed(() => chartInfo.value.description)
const chartCover = computed(() => chartInfo.value.cover)
const updateTime = computed(() => chartInfo.value.updateTime)

// 方法
async function loadChartSongs() {
  if (isLoading.value) return

  isLoading.value = true

  try {
    // 根据排行榜类型加载不同的歌曲
    let loadedSongs: Song[] = []

    switch (chartType.value) {
      case 'new':
        loadedSongs = await musicApi.getRecommendedSongs(50)
        // 按创建时间排序（模拟新歌榜）
        loadedSongs.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        break
      case 'hot':
        loadedSongs = await musicApi.getPopularSongs(50)
        break
      case 'trending':
        loadedSongs = await musicApi.getRecommendedSongs(50)
        // 随机排序模拟飙升榜
        loadedSongs.sort(() => Math.random() - 0.5)
        break
      case 'original':
        loadedSongs = await musicApi.getRecommendedSongs(50)
        // 过滤原创歌曲（这里简单模拟）
        loadedSongs = loadedSongs.filter((_, index) => index % 3 === 0)
        break
      default:
        // 其他排行榜使用推荐歌曲
        loadedSongs = await musicApi.getRecommendedSongs(50)
        break
    }

    // 添加排名变化信息（模拟数据）
    songs.value = loadedSongs.map(song => ({
      ...song,
      rankChange: Math.floor(Math.random() * 21) - 10, // -10 到 +10 的随机变化
    }))
  } catch (error) {
    console.error('加载排行榜失败:', error)
    songs.value = []
  } finally {
    isLoading.value = false
  }
}

function refreshChart() {
  loadChartSongs()
}

function playAll() {
  if (songs.value.length === 0) return

  musicStore.setPlaylist(songs.value)
  musicStore.setCurrentSong(songs.value[0])
  musicStore.play()
}

function playSong(song: Song) {
  musicStore.setPlaylist(songs.value)
  musicStore.setCurrentSong(song)
  musicStore.play()
}

function isCurrentSong(songId: string): boolean {
  return musicStore.currentSong?.id === songId && musicStore.isPlaying
}

function toggleFavorite(song: Song, event?: Event) {
  if (isFavorite(song.id)) {
    favoritesStore.removeFavorite(song.id)
  } else {
    favoritesStore.addFavorite(song.id)
  }

  // 清除焦点状态，避免点击效果保留
  if (event?.target) {
    ;(event.target as HTMLElement).blur()
  }
}

function isFavorite(songId: string): boolean {
  return favoritesStore.favorites.some(fav => fav.songId === songId)
}

function showSongMenu(song: Song, event?: Event) {
  // TODO: 实现歌曲菜单
  console.log('显示歌曲菜单:', song.title)

  // 清除焦点状态，避免点击效果保留
  if (event?.target) {
    ;(event.target as HTMLElement).blur()
  }
}

function getRankClass(rank: number): string {
  if (rank <= 3) return 'top-three'
  if (rank <= 10) return 'top-ten'
  return ''
}

function formatTime(seconds: number): string {
  return musicStore.formatTime(seconds)
}

function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return (count / 100000000).toFixed(1) + '亿'
  } else if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 1000)
}

function goBack() {
  router.go(-1)
}

// 监听路由变化
watch(
  () => chartType.value,
  () => {
    loadChartSongs()
  },
  { immediate: true }
)

onMounted(() => {
  loadChartSongs()
})
</script>

<style scoped>
.charts-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: calc(140px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
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
.refresh-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.back-button:hover,
.refresh-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.back-button:focus,
.refresh-button:focus {
  background: rgba(255, 255, 255, 0.1);
}

.back-button:active,
.refresh-button:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
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

.chart-info {
  padding: 0 1rem 1rem;
}

.chart-banner {
  display: flex;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-cover {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.chart-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-icon {
  color: white;
  opacity: 0.8;
}

.chart-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-details h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.chart-details p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.chart-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.7;
  margin-bottom: 1rem;
}

.play-all-button {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.play-all-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-1px);
}

.play-all-button:focus:not(:disabled) {
  background: linear-gradient(135deg, #0056cc, #004499);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.play-all-button:active:not(:disabled) {
  background: linear-gradient(135deg, #004499, #003366);
  transform: translateY(0px) scale(0.98);
}

.play-all-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-content {
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

.songs-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-item:focus {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(0, 122, 255, 0.3);
}

.song-item:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.995);
}

.song-item.playing {
  background: rgba(0, 122, 255, 0.1);
  border-left: 3px solid #007aff;
}

.song-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  margin-right: 1rem;
}

.rank-number {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.rank-number.top-three {
  color: #ffd700;
  font-weight: 700;
}

.rank-number.top-ten {
  color: #ff6b6b;
}

.rank-change {
  margin-top: 0.25rem;
}

.rank-up {
  color: #4ecdc4;
}

.rank-down {
  color: #ff6b6b;
}

.rank-same {
  color: rgba(255, 255, 255, 0.5);
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.song-cover img {
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

.song-item:hover .play-overlay,
.song-item.playing .play-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.song-stats {
  display: flex;
  align-items: center;
  margin: 0 1rem;
}

.play-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.song-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.action-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.action-button:focus {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.action-button:active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.9);
}

/* 确保点击后立即清除焦点状态 */
.action-button:active:focus {
  box-shadow: none;
}

.action-button .filled {
  color: #ff4757;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-banner {
    flex-direction: column;
    text-align: center;
  }

  .chart-cover {
    align-self: center;
  }

  .song-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .song-stats {
    display: none;
  }
}
</style>
