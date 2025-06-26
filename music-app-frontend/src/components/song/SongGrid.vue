<template>
  <div class="song-grid">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ loadingText }}</p>
    </div>
    <div v-else-if="songs.length > 0" class="grid-container">
      <div v-for="song in songs" :key="song.id" class="song-card" @click="onSongClick(song)">
        <div class="song-cover">
          <img :src="getImageUrl(song.coverUrl)" :alt="song.title" v-img-fallback="'cover'" />
          <div class="play-overlay">
            <component :is="isCurrentSong(song) && isPlaying ? Pause : Play" :size="24" />
          </div>
        </div>
        <h3 class="song-title">{{ song.title }}</h3>
        <p class="song-artist">{{ song.artist }}</p>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Pause } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { getImageUrl } from '@/utils/imageHandlers'

const props = defineProps({
  songs: {
    type: Array as () => Song[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '加载中...',
  },
  emptyText: {
    type: String,
    default: '暂无歌曲',
  },
  columns: {
    type: Number,
    default: 2,
  },
})

const emit = defineEmits(['song-click'])

const musicStore = useMusicStore()

const isPlaying = computed(() => musicStore.isPlaying)
const currentSong = computed(() => musicStore.currentSong)

// 检查是否是当前播放的歌曲
const isCurrentSong = (song: Song): boolean => {
  return currentSong.value?.id === song.id
}

// 处理歌曲点击
const onSongClick = (song: Song) => {
  emit('song-click', song)
}
</script>

<style scoped>
.song-grid {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 1rem;
}

.song-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: translateY(-5px);
}

.song-card:hover .play-overlay {
  opacity: 1;
}

.song-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 1:1 宽高比 */
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.song-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.song-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.2rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 响应式布局 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
