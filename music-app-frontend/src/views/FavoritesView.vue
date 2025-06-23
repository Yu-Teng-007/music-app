<template>
  <div class="favorites-view">
    <div class="header">
      <h1>我的收藏</h1>
      <div class="stats">
        <span>共 {{ totalFavorites }} 首歌曲</span>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索收藏的歌曲..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- 收藏列表 -->
    <div class="favorites-content">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredFavorites.length === 0" class="empty-state">
        <Heart :size="64" class="empty-icon" />
        <h3>{{ searchQuery ? '没有找到相关歌曲' : '还没有收藏任何歌曲' }}</h3>
        <p>{{ searchQuery ? '尝试其他关键词' : '去发现页面找些喜欢的歌曲吧' }}</p>
        <button v-if="!searchQuery" @click="goToDiscover" class="discover-btn">去发现音乐</button>
      </div>

      <div v-else class="favorites-list">
        <div
          v-for="song in filteredFavorites"
          :key="song.id"
          class="song-item"
          @click="playSong(song)"
        >
          <img :src="song.coverUrl" :alt="song.title" class="song-cover" />
          <div class="song-info">
            <h3 class="song-title">{{ song.title }}</h3>
            <p class="song-artist">{{ song.artist }}</p>
            <p class="song-album">{{ song.album }}</p>
          </div>
          <div class="song-meta">
            <span class="song-duration">{{ formatDuration(song.duration) }}</span>
            <button class="play-btn" @click.stop="playSong(song)">
              <Play :size="16" />
            </button>
            <button class="remove-btn" @click.stop="removeFavorite(song)" title="取消收藏">
              <Heart :size="16" fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { favoritesApi } from '@/services'
import type { Song } from '@/stores/music'
import { Search, X, Play, Heart } from 'lucide-vue-next'

const router = useRouter()
const musicStore = useMusicStore()

// 状态
const loading = ref(false)
const searchQuery = ref('')
const favorites = ref<Song[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalFavorites = ref(0)
const totalPages = ref(0)

// 计算属性
const filteredFavorites = computed(() => {
  if (!searchQuery.value.trim()) {
    return favorites.value
  }

  const query = searchQuery.value.toLowerCase()
  return favorites.value.filter(
    song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
  )
})

// 方法
const loadFavorites = async () => {
  loading.value = true
  try {
    const response = await favoritesApi.getFavorites({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value.trim() || undefined,
    })

    favorites.value = response.data || []
    totalFavorites.value = response.pagination?.total || 0
    totalPages.value = response.pagination?.totalPages || 0
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
}

const removeFavorite = async (song: Song) => {
  try {
    await favoritesApi.removeFavorite(song.id)
    // 从列表中移除
    const index = favorites.value.findIndex(f => f.id === song.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      totalFavorites.value--
    }
    // TODO: 显示成功提示
  } catch (error) {
    console.error('取消收藏失败:', error)
    // TODO: 显示错误提示
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const clearSearch = () => {
  searchQuery.value = ''
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadFavorites()
  }
}

const goToDiscover = () => {
  router.push('/discover')
}

// 生命周期
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
}

.stats {
  color: var(--text-secondary);
  font-size: 14px;
}

.search-section {
  margin-bottom: 24px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  max-width: 400px;
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha);
}

.search-icon {
  color: var(--text-secondary);
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.favorites-content {
  min-height: 400px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-tertiary);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
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
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
}

.discover-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
}

.discover-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.song-item:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.song-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.song-artist,
.song-album {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-duration {
  font-size: 14px;
  color: var(--text-secondary);
}

.play-btn,
.remove-btn {
  background: var(--primary);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn {
  background: var(--danger, #ff4757);
}

.play-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.remove-btn:hover {
  background: var(--danger-dark, #ff3838);
  transform: scale(1.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--bg-hover);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .favorites-view {
    padding: 16px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-bar {
    max-width: 100%;
  }

  .song-item {
    flex-direction: column;
    text-align: center;
  }

  .song-meta {
    justify-content: center;
  }
}
</style>
