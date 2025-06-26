<template>
  <div class="song-list">
    <div class="song-list-header" v-if="showHeader">
      <div class="header-index" v-if="showIndex">#</div>
      <div class="header-title">歌曲</div>
      <div class="header-duration">时长</div>
      <div class="header-actions"></div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div v-else-if="songs.length === 0" class="empty-state">
      <div class="empty-icon">🎵</div>
      <div class="empty-text">{{ emptyText }}</div>
    </div>

    <div v-else class="song-list-content">
      <SongItem
        v-for="(song, index) in songs"
        :key="song.id"
        :song="song"
        :index="index"
        :showIndex="showIndex"
        :showCover="showCover"
        @click="handleSongClick(song)"
        @menu="handleMenuClick"
      />
    </div>

    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <button
        class="pagination-btn"
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        上一页
      </button>
      <span class="pagination-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
      <button
        class="pagination-btn"
        :disabled="pagination.page >= pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/stores/music'
import SongItem from './SongItem.vue'

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const props = defineProps({
  songs: {
    type: Array as () => Song[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showIndex: {
    type: Boolean,
    default: true,
  },
  showCover: {
    type: Boolean,
    default: true,
  },
  emptyText: {
    type: String,
    default: '暂无歌曲',
  },
  pagination: {
    type: Object as () => Pagination,
    default: null,
  },
})

const emit = defineEmits(['song-click', 'menu-click', 'page-change'])

const handleSongClick = (song: Song) => {
  emit('song-click', song)
}

const handleMenuClick = (song: Song) => {
  emit('menu-click', song)
}

const changePage = (page: number) => {
  emit('page-change', page)
}
</script>

<style scoped>
.song-list {
  width: 100%;
}

.song-list-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.header-index {
  width: 30px;
  margin-right: 10px;
  text-align: center;
}

.header-title {
  flex: 1;
  padding-left: 65px;
}

.header-duration {
  margin: 0 15px;
}

.header-actions {
  width: 80px;
}

.song-list-content {
  margin-top: 10px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 122, 255, 0.1);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.empty-text {
  font-size: 16px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
}

.pagination-btn {
  background: transparent;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
  color: #007aff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 15px;
  color: #666;
}

@media (max-width: 768px) {
  .header-duration {
    display: none;
  }

  .header-title {
    padding-left: 50px;
  }

  .header-actions {
    width: 60px;
  }
}
</style>
