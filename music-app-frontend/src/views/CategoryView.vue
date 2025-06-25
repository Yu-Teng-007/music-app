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
      <div class="category-banner" :style="{ backgroundColor: currentCategory.color }">
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
        :style="{ backgroundColor: category.color }"
        @click="navigateToCategory(category.name)"
      >
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
        <button class="load-more-button" @click="loadMore">
          加载更多
        </button>
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
              v-for="(year,index) in yearOptions"
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
              v-for="(play,index) in playCountOptions"
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
import {
  ChevronLeft,
  Filter,
  Music,
  Play,
  Heart,
  MoreVertical,
} from 'lucide-vue-next'

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
watch(() => categoryType.value, async (newType) => {
  if (newType) {
    await loadCategoryInfo()
    await loadSongs(true)
  } else {
    currentCategory.value = null
    songs.value = []
  }
}, { immediate: true })

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

.category-info {
  padding: 0 1rem 1rem;
}

.category-banner {
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.category-details h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.category-details p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0 0 1rem 0;
}

.category-stats {
  font-size: 0.875rem;
  opacity: 0.7;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.category-card {
  padding: 1.5rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.category-card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.category-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.category-card p {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
}

.songs-section {
  padding: 0 1rem;
}

.sort-options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.sort-button {
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

.sort-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.sort-button.active {
  background: linear-gradient(135deg, #007aff, #0056cc);
  border-color: #007aff;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
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

.song-item:hover .play-overlay {
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
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .category-banner {
    flex-direction: column;
    text-align: center;
  }
  
  .song-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
