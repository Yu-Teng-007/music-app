<template>
  <div class="discover-view">
    <div class="header">
      <h1>广场</h1>
      <SearchBar v-model="searchQuery" @search="handleSearch" @clear="clearSearch" />
    </div>

    <div class="content">
      <!-- 搜索结果 -->
      <SearchResults
        v-if="searchQuery"
        :songs="searchResults"
        :is-loading="isSearching"
        :query="searchQuery"
        @song-click="playSong"
      />

      <!-- 默认内容 -->
      <div v-else class="default-content">
        <!-- 热门分类 -->
        <div class="section">
          <h2>热门分类</h2>
          <CategoryGrid :categories="categories" @category-click="handleCategoryClick" />
        </div>

        <!-- 推荐歌曲 -->
        <div class="section">
          <h2>推荐歌曲</h2>
          <SongGrid
            :songs="recommendedSongs"
            :is-loading="isLoading"
            :columns="2"
            @song-click="playSong"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import SearchBar from '@/components/discover/SearchBar.vue'
import SearchResults from '@/components/discover/SearchResults.vue'
import CategoryGrid from '@/components/discover/CategoryGrid.vue'
import SongGrid from '@/components/song/SongGrid.vue'

const musicStore = useMusicStore()
const searchQuery = ref('')

// 分类数据
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

// 加载推荐歌曲
const loadRecommendedSongs = async () => {
  try {
    isLoading.value = true
    const songs = await musicStore.loadRecommendedSongs(12)
    recommendedSongs.value = songs
  } finally {
    isLoading.value = false
  }
}

// 搜索歌曲
const handleSearch = async (keyword: string) => {
  if (!keyword.trim()) {
    searchResults.value = []
    return
  }

  try {
    isSearching.value = true
    const songs = await musicStore.searchSongs(keyword, 20)
    searchResults.value = songs
  } finally {
    isSearching.value = false
  }
}

// 清除搜索
const clearSearch = () => {
  searchResults.value = []
}

// 播放歌曲
const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
}

// 处理分类点击
const handleCategoryClick = (category: any) => {
  console.log('分类点击:', category)
  // 这里可以实现分类筛选逻辑
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

.content {
  padding: 1rem;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.default-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
