<template>
  <div class="playlist-grid-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="playlists.length === 0" class="empty-playlists">
      <p>{{ emptyText }}</p>
    </div>

    <div v-else class="playlist-grid">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-item"
        @click="$emit('playlist-click', playlist)"
      >
        <div class="playlist-cover">
          <img
            :src="playlist.coverUrl || defaultCover"
            :alt="playlist.name"
            @error="handleImageError"
          />
          <div class="playlist-overlay">
            <Play :size="24" />
          </div>
        </div>
        <h3 class="playlist-name">{{ playlist.name }}</h3>
        <p class="playlist-info">
          <span v-if="playlist.songCount !== undefined">{{ playlist.songCount }}首歌曲</span>
          <span v-else-if="playlist.creator">by {{ playlist.creator }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Play } from 'lucide-vue-next'

interface Playlist {
  id: string
  name: string
  coverUrl?: string
  songCount?: number
  creator?: string
}

const props = defineProps({
  playlists: {
    type: Array as () => Playlist[],
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '暂无歌单',
  },
})

defineEmits(['playlist-click'])

const defaultCover = 'https://picsum.photos/300/300?random=200'

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultCover
}
</script>

<style scoped>
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.playlist-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.playlist-item:hover {
  transform: translateY(-5px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
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
  transition: opacity 0.2s ease;
  color: white;
}

.playlist-cover:hover .playlist-overlay {
  opacity: 1;
}

.playlist-name {
  margin: 10px 0 5px;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info {
  margin: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.empty-playlists {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 15px;
  }

  .playlist-name {
    font-size: 14px;
  }

  .playlist-info {
    font-size: 12px;
  }
}
</style>
