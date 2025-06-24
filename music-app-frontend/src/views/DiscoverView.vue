<template>
  <div class="discover-view">
    <div class="header">
      <h1>广场</h1>
      <div class="search-bar">
        <Search :size="20" />
        <input type="text" placeholder="搜索歌曲、艺人、专辑" v-model="searchQuery" />
      </div>
    </div>

    <div class="content">
      <!-- 搜索结果 -->
      <div v-if="searchQuery" class="search-results">
        <h2>搜索结果</h2>
        <div class="result-tabs">
          <button
            v-for="tab in searchTabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="tab-btn"
            :class="{ active: activeTab === tab.key }"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="results-content">
          <div v-if="activeTab === 'songs'" class="song-results">
            <div v-if="isSearching" class="loading-container">
              <div class="loading-spinner"></div>
              <p>搜索中...</p>
            </div>
            <div v-else-if="filteredSongs.length > 0">
              <div
                v-for="song in filteredSongs"
                :key="song.id"
                class="song-item"
                @click="playSong(song)"
              >
                <div class="song-cover">
                  <img
                    :src="song.coverUrl || 'https://picsum.photos/300/300?random=128'"
                    :alt="song.title"
                    @error="handleImageError"
                  />
                </div>
                <div class="song-info">
                  <h3 class="song-title">{{ song.title }}</h3>
                  <p class="song-artist">{{ song.artist }}</p>
                </div>
                <button class="play-btn">
                  <Play :size="16" />
                </button>
              </div>
            </div>
            <div v-else class="empty-state">
              <p>未找到相关歌曲</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 默认内容 -->
      <div v-else class="default-content">
        <!-- 热门分类 -->
        <div class="section">
          <h2>热门分类</h2>
          <div class="category-grid">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :style="{ backgroundColor: category.color }"
            >
              <span>{{ category.name }}</span>
            </div>
          </div>
        </div>

        <!-- 推荐歌曲 -->
        <div class="section">
          <h2>推荐歌曲</h2>
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          <div v-else-if="recommendedSongs.length > 0" class="song-grid">
            <div
              v-for="song in recommendedSongs"
              :key="song.id"
              class="song-card"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img
                  :src="song.coverUrl || 'https://picsum.photos/300/300?random=129'"
                  :alt="song.title"
                  @error="handleImageError"
                />
                <div class="play-overlay">
                  <Play :size="24" />
                </div>
              </div>
              <h3 class="song-title">{{ song.title }}</h3>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无推荐歌曲</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { Search, Play } from 'lucide-vue-next'

const musicStore = useMusicStore()
const searchQuery = ref('')
const activeTab = ref('songs')

const searchTabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'artists', label: '艺人' },
  { key: 'albums', label: '专辑' },
  { key: 'playlists', label: '歌单' },
]

const categories = [
  { id: 1, name: '流行', color: '#FF6B6B' },
  { id: 2, name: '摇滚', color: '#4ECDC4' },
  { id: 3, name: '电子', color: '#45B7D1' },
  { id: 4, name: '古典', color: '#96CEB4' },
  { id: 5, name: '爵士', color: '#FFEAA7' },
  { id: 6, name: '民谣', color: '#DDA0DD' },
]

// 推荐歌曲和搜索结果
const recommendedSongs = ref<Song[]>([])
const searchResults = ref<Song[]>([])

// 加载状态
const isLoading = ref(false)
const isSearching = ref(false)

const filteredSongs = computed(() => {
  if (!searchQuery.value) return []
  return searchResults.value
})

// 加载推荐歌曲
const loadRecommendedSongs = async () => {
  try {
    isLoading.value = true
    const songs = await musicStore.loadRecommendedSongs(6)
    recommendedSongs.value = songs
  } catch (error) {
    recommendedSongs.value = []
  } finally {
    isLoading.value = false
  }
}

// 搜索歌曲
const searchSongs = async (keyword: string) => {
  if (!keyword.trim()) {
    searchResults.value = []
    return
  }

  try {
    isSearching.value = true
    const songs = await musicStore.searchSongs(keyword, 20)
    searchResults.value = songs
  } catch (error) {
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 监听搜索查询变化
let searchTimeout: number | null = null
watch(searchQuery, newQuery => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    if (newQuery.trim()) {
      searchSongs(newQuery)
    } else {
      searchResults.value = []
    }
  }, 300)
})

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=136'
}

onMounted(() => {
  loadRecommendedSongs()
})
</script>

<style scoped>
.discover-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 100px; /* 为底部导航留空间 */
}

.header {
  padding: 2rem 1rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
}

.search-bar input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.content {
  padding: 1rem;
}

.search-results h2,
.section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.result-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tab-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.tab-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  background: #007aff;
}

.tab-btn.active:hover {
  background: #0056b3;
}

.song-results,
.song-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.song-item:active {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(0px);
}

.song-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.song-artist {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0;
}

.play-btn {
  background: #007aff;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.play-btn:hover {
  transform: scale(1.1);
  background: #0056b3;
}

.play-btn:active {
  transform: scale(1.05);
  background: #004494;
}

.play-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.section {
  margin-bottom: 2rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-item {
  aspect-ratio: 1;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.category-item:hover {
  transform: scale(1.05);
}

.category-item:active {
  transform: scale(1.02);
}

.category-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.song-card {
  cursor: pointer;
  transition: all 0.2s ease;
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.song-card:hover {
  transform: scale(1.05);
}

.song-card:active {
  transform: scale(1.02);
}

.song-card:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.song-card .song-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
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

.song-card .song-title {
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.song-card .song-artist {
  font-size: 0.75rem;
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
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .song-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
