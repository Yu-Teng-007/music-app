<template>
  <div class="category-view">
    <!-- 头部 -->
    <div class="header">
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" />
      </button>
      <h1 v-if="currentCategory">{{ currentCategory.name }}</h1>
      <h1 v-else>音乐分类</h1>
      <div class="header-actions">
        <button class="filter-button" @click="showFilterModal = true">
          <Filter :size="20" />
        </button>
      </div>
    </div>

    <!-- 分类信息 -->
    <div v-if="currentCategory" class="category-info">
      <div
        class="category-banner"
        :style="{ backgroundImage: `url(${getCategoryBackgroundImage(currentCategory.id)})` }"
      >
        <div class="category-overlay"></div>
        <div class="category-icon">{{ currentCategory.icon }}</div>
        <div class="category-details">
          <h2>{{ currentCategory.name }}</h2>
          <p>{{ currentCategory.description }}</p>
          <div class="category-stats">
            <span>{{ songCount }} 首歌曲</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类列表（当没有指定分类时显示） -->
    <div v-if="!categoryType" class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :style="{ backgroundImage: `url(${getCategoryBackgroundImage(category.id)})` }"
        @click="navigateToCategory(category.name)"
      >
        <div class="category-overlay"></div>
        <div class="category-card-icon">{{ category.icon }}</div>
        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div v-else class="songs-section">
      <!-- 排序选项 -->
      <div class="sort-options">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="['sort-button', { active: currentSort === option.value }]"
          @click="changeSort(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载歌曲...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="songs.length === 0" class="empty-state">
        <Music :size="64" />
        <h3>暂无歌曲</h3>
        <p>该分类下还没有歌曲</p>
      </div>

      <!-- 歌曲列表 -->
      <div v-else class="songs-list">
        <div
          v-for="(song, index) in songs"
          :key="song.id"
          class="song-item"
          @click="playSong(song, index)"
        >
          <div class="song-cover">
            <img :src="song.coverUrl" :alt="song.title" @error="handleImageError" />
            <div class="play-overlay">
              <Play :size="20" />
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

          <div class="song-actions">
            <button class="action-button" @click.stop="toggleFavorite(song)">
              <Heart :size="18" :class="{ filled: isFavorite(song.id) }" />
            </button>
            <button class="action-button" @click.stop="showSongMenu(song)">
              <MoreVertical :size="18" />
            </button>
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
          <h4>年代</h4>
          <div class="filter-options">
            <button
              v-for="(year, index) in yearOptions"
              :key="index"
              :class="['filter-option', { active: selectedYear === year.value }]"
              @click="selectedYear = year.value"
            >
              {{ year.label }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <h4>播放量</h4>
          <div class="filter-options">
            <button
              v-for="(play, index) in playCountOptions"
              :key="index"
              :class="['filter-option', { active: selectedPlayCount === play.value }]"
              @click="selectedPlayCount = play.value"
            >
              {{ play.label }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { useFavoritesStore } from '@/stores/favorites'
import { genreApi, musicApi } from '@/services'
import type { Genre } from '@/services/genre-api'
import type { Song } from '@/stores/music'
import { ChevronLeft, Filter, Music, Play, Heart, MoreVertical } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const favoritesStore = useFavoritesStore()

// 页面状态
const categories = ref<Genre[]>([])
const currentCategory = ref<Genre | null>(null)
const songs = ref<Song[]>([])
const isLoading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

// 筛选状态
const showFilterModal = ref(false)
const selectedYear = ref<string | null>(null)
const selectedPlayCount = ref<string | null>(null)

// 排序状态
const currentSort = ref('popular')

// 路由参数
const categoryType = computed(() => route.params.type as string)

// 歌曲数量
const songCount = computed(() => songs.value.length)

// 排序选项
const sortOptions = [
  { value: 'popular', label: '热门' },
  { value: 'newest', label: '最新' },
  { value: 'title', label: '标题' },
  { value: 'artist', label: '歌手' },
]

// 年代选项
const yearOptions = [
  { value: null, label: '全部' },
  { value: '2020s', label: '2020年代' },
  { value: '2010s', label: '2010年代' },
  { value: '2000s', label: '2000年代' },
  { value: '1990s', label: '1990年代' },
  { value: '1980s', label: '1980年代' },
]

// 播放量选项
const playCountOptions = [
  { value: null, label: '全部' },
  { value: 'high', label: '高播放量' },
  { value: 'medium', label: '中等播放量' },
  { value: 'low', label: '低播放量' },
]

// 为每个分类生成随机背景图片
const getCategoryBackgroundImage = (categoryId: string) => {
  // 使用分类ID作为种子，确保同一分类每次获得相同的图片
  const seed = categoryId.charCodeAt(0) + categoryId.charCodeAt(categoryId.length - 1)
  // 使用picsum.photos，尺寸更大以适合背景图片
  return `https://picsum.photos/800/600?random=${seed}`
}

// 方法
async function loadCategories() {
  try {
    categories.value = await genreApi.getActiveGenres()
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

async function loadCategoryInfo() {
  if (!categoryType.value) return

  try {
    currentCategory.value = await genreApi.getGenreByName(categoryType.value)
  } catch (error) {
    console.error('加载分类信息失败:', error)
  }
}

async function loadSongs(reset = false) {
  if (isLoading.value) return

  isLoading.value = true

  try {
    if (reset) {
      currentPage.value = 1
      songs.value = []
      hasMore.value = true
    }

    const params = {
      page: currentPage.value,
      limit: pageSize,
      sort: currentSort.value,
      year: selectedYear.value,
      playCount: selectedPlayCount.value,
    }

    const response = await musicApi.getSongsByGenre(categoryType.value, params)

    if (reset) {
      songs.value = response
    } else {
      songs.value.push(...response)
    }

    hasMore.value = response.length === pageSize
    currentPage.value++
  } catch (error) {
    console.error('加载歌曲失败:', error)
  } finally {
    isLoading.value = false
  }
}

function loadMore() {
  loadSongs(false)
}

function changeSort(sortValue: string) {
  currentSort.value = sortValue
  loadSongs(true)
}

function applyFilters() {
  showFilterModal.value = false
  loadSongs(true)
}

function resetFilters() {
  selectedYear.value = null
  selectedPlayCount.value = null
  showFilterModal.value = false
  loadSongs(true)
}

function navigateToCategory(categoryName: string) {
  router.push(`/category/${categoryName}`)
}

function playSong(song: Song, index: number) {
  musicStore.setPlaylist(songs.value)
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

function formatTime(seconds: number): string {
  return musicStore.formatTime(seconds)
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
  () => categoryType.value,
  async newType => {
    if (newType) {
      await loadCategoryInfo()
      await loadSongs(true)
    } else {
      currentCategory.value = null
      songs.value = []
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await loadCategories()
  if (categoryType.value) {
    await loadCategoryInfo()
    await loadSongs(true)
  }
})
</script>

<style scoped>
.category-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 120px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  position: sticky;
  top: 0;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  z-index: 10;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.back-button,
.filter-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.back-button:hover,
.filter-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.back-button:active,
.filter-button:active {
  transform: scale(0.95);
}

.header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #fff, #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.category-info {
  padding: 0.5rem 1.25rem 1.5rem;
}

.category-banner {
  border-radius: 1.25rem;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  z-index: 1;
}

.category-banner:hover {
  transform: translateY(-5px);
}

.category-icon {
  font-size: 3.5rem;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
}

.category-details {
  position: relative;
  z-index: 2;
}

.category-details h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(to right, #fff, #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.category-details p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 1.25rem 0;
  line-height: 1.6;
}

.category-stats {
  font-size: 0.95rem;
  opacity: 0.8;
  font-weight: 500;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.25rem;
}

.category-card {
  padding: 2rem;
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-card .category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
  z-index: 1;
  transition: background 0.3s ease;
}

.category-card:hover .category-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.category-card-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
}

.category-card h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(to right, #fff, #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  z-index: 2;
}

.category-card p {
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}

.songs-section {
  padding: 0.5rem 1.25rem;
}

.sort-options {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding: 0.75rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.sort-options::-webkit-scrollbar {
  height: 4px;
}

.sort-options::-webkit-scrollbar-track {
  background: transparent;
}

.sort-options::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
}

.sort-button {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.sort-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.sort-button.active {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-color: #007aff;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #007aff;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  margin-bottom: 1.5rem;
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
  margin: 1.25rem 0 0.75rem;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.songs-list {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 1.25rem;
  overflow: hidden;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.song-item {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(5px);
}

.song-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.song-item:hover .song-cover img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-item:hover .play-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.35rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.35rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.song-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: 1.25rem;
}

.action-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.action-button .filled {
  color: #ff4757;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 2.5rem 0;
}

.load-more-button {
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.load-more-button:active {
  transform: translateY(-1px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.25rem;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
  transform-origin: bottom;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
  background: linear-gradient(to right, #fff, #ccc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-option {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-option:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.filter-option.active {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-color: #007aff;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.4);
}

.modal-actions {
  display: flex;
  gap: 1.25rem;
  margin-top: 2.5rem;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
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
  transform: translateY(-2px);
}

.confirm-button {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border: none;
  color: white;
  font-weight: 600;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.4);
}

.confirm-button:active,
.cancel-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .category-banner {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .category-icon {
    margin-bottom: 1rem;
  }

  .song-meta {
    flex-direction: column;
    gap: 0.35rem;
  }

  .modal-content {
    padding: 1.75rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .song-cover {
    width: 50px;
    height: 50px;
    margin-right: 1rem;
  }

  .song-title {
    font-size: 1rem;
  }

  .song-artist {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.3rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-details h2 {
    font-size: 1.5rem;
  }

  .song-item {
    padding: 1rem;
  }

  .song-actions {
    margin-left: 0.75rem;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.5rem;
  }
}
</style>
