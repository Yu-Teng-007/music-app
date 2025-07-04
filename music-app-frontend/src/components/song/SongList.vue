<template>
  <div class="song-list">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ loadingText }}</p>
    </div>
    <div v-else-if="songs.length > 0">
      <div v-for="song in songs" :key="song.id" class="song-item" @click="onSongClick(song)">
        <div class="song-cover">
          <img :src="getImageUrl(song.coverUrl)" :alt="song.title" v-img-fallback="'cover'" />
        </div>
        <div class="song-info">
          <h3 class="song-title">{{ song.title }}</h3>
          <p class="song-artist">{{ song.artist }}</p>
        </div>
        <button class="play-btn">
          <component :is="isCurrentSong(song) && isPlaying ? Pause : Play" :size="16" />
        </button>
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
.song-list {
  width: 100%;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.song-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
  min-width: 0;
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

.play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
  margin-left: 0.5rem;
}

.play-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.play-btn:active {
  transform: scale(0.95);
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
</style>
