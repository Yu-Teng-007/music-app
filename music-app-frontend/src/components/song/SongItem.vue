<template>
  <div
    class="song-item"
    :class="{ active: isActive, 'is-playing': isPlaying && isActive }"
    @click="handleClick"
  >
    <div class="song-index" v-if="showIndex">
      <span v-if="!isPlaying || !isActive">{{ index + 1 }}</span>
      <PlayIcon v-else :size="16" class="playing-icon" />
    </div>

    <div class="song-cover" v-if="showCover">
      <img :src="song.coverUrl || defaultCover" :alt="song.title" @error="handleImageError" />
      <div class="play-overlay" v-if="!isPlaying || !isActive" @click.stop="playSong">
        <PlayIcon :size="20" />
      </div>
      <div class="pause-overlay" v-else @click.stop="pauseSong">
        <PauseIcon :size="20" />
      </div>
    </div>

    <div class="song-info">
      <div class="song-title">{{ song.title }}</div>
      <div class="song-artist">{{ song.artist }}</div>
    </div>

    <div class="song-duration">
      {{ formatDuration(song.duration) }}
    </div>

    <div class="song-actions">
      <button class="action-btn" @click.stop="toggleFavorite">
        <HeartIcon :fill="isFavorite ? 'currentColor' : 'none'" />
      </button>
      <button class="action-btn" @click.stop="showMenu">
        <MoreVerticalIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  Heart as HeartIcon,
  MoreVertical as MoreVerticalIcon,
} from 'lucide-vue-next'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps({
  song: {
    type: Object as () => Song,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
  showIndex: {
    type: Boolean,
    default: true,
  },
  showCover: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click', 'menu'])

const musicStore = useMusicStore()
const favoritesStore = useFavoritesStore()

const defaultCover = '/images/default-cover.jpg'

// 计算属性
const isActive = computed(() => {
  return musicStore.currentSong?.id === props.song.id
})

const isPlaying = computed(() => {
  return musicStore.isPlaying
})

const isFavorite = computed(() => {
  return favoritesStore.isFavorite(props.song.id)
})

// 方法
const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleClick = () => {
  emit('click', props.song)
}

const playSong = () => {
  musicStore.setCurrentSong(props.song)
  musicStore.play()
}

const pauseSong = () => {
  musicStore.pause()
}

const toggleFavorite = async () => {
  if (isFavorite.value) {
    await favoritesStore.removeFavorite(props.song.id)
  } else {
    await favoritesStore.addFavorite(props.song.id)
  }
}

const showMenu = () => {
  emit('menu', props.song)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultCover
}
</script>

<style scoped>
.song-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.song-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.song-item.active {
  background-color: rgba(0, 122, 255, 0.1);
}

.song-item.is-playing {
  background-color: rgba(0, 122, 255, 0.15);
}

.song-index {
  width: 30px;
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-right: 10px;
}

.song-index .playing-icon {
  color: #007aff;
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay,
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.song-cover:hover .play-overlay,
.song-cover:hover .pause-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  margin: 0 15px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}

.song-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.song-item.active .song-title {
  color: #007aff;
}

.song-item.active .song-artist {
  color: #0062cc;
}

@media (max-width: 768px) {
  .song-duration {
    display: none;
  }

  .song-cover {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .song-actions {
    gap: 2px;
  }

  .action-btn {
    padding: 3px;
  }
}
</style>
