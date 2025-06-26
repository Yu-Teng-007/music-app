<template>
  <div class="search-results">
    <h2>搜索结果</h2>

    <!-- 结果分类标签 -->
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

    <!-- 结果内容 -->
    <div class="results-content">
      <!-- 歌曲结果 -->
      <div v-if="activeTab === 'songs'" class="tab-content">
        <SongList
          :songs="songs"
          :is-loading="isLoading"
          :empty-text="'未找到相关歌曲'"
          @song-click="onSongClick"
        />
      </div>

      <!-- 艺人结果 -->
      <div v-if="activeTab === 'artists'" class="tab-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>搜索中...</p>
        </div>
        <div v-else class="empty-state">
          <p>未找到相关艺人</p>
        </div>
      </div>

      <!-- 专辑结果 -->
      <div v-if="activeTab === 'albums'" class="tab-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>搜索中...</p>
        </div>
        <div v-else class="empty-state">
          <p>未找到相关专辑</p>
        </div>
      </div>

      <!-- 歌单结果 -->
      <div v-if="activeTab === 'playlists'" class="tab-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>搜索中...</p>
        </div>
        <div v-else class="empty-state">
          <p>未找到相关歌单</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SongList from '@/components/song/SongList.vue'
import type { Song } from '@/stores/music'

// 搜索标签
const searchTabs = [
  { key: 'songs', label: '歌曲' },
  { key: 'artists', label: '艺人' },
  { key: 'albums', label: '专辑' },
  { key: 'playlists', label: '歌单' },
]

const props = defineProps({
  songs: {
    type: Array as () => Song[],
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['song-click'])

// 当前激活的标签
const activeTab = ref('songs')

// 监听搜索查询变化，重置为歌曲标签
watch(
  () => props.query,
  () => {
    activeTab.value = 'songs'
  }
)

// 处理歌曲点击
const onSongClick = (song: Song) => {
  emit('song-click', song)
}
</script>

<style scoped>
.search-results {
  margin-top: 1rem;
}

.search-results h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.result-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none; /* Firefox */
}

.result-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.results-content {
  min-height: 200px;
}

.tab-content {
  animation: fadeIn 0.3s;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
