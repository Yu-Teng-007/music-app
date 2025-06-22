<template>
  <div v-if="currentSong" class="mini-player" @click="goToFullPlayer">
    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- 播放器内容 -->
    <div class="player-content">
      <!-- 歌曲信息 -->
      <div class="song-info">
        <div class="song-cover">
          <img
            :src="currentSong.coverUrl || 'https://picsum.photos/300/300?random=100'"
            :alt="currentSong.title"
            @error="handleImageError"
          />
        </div>
        <div class="song-details">
          <h4 class="song-title">{{ currentSong.title }}</h4>
          <p class="song-artist">{{ currentSong.artist }}</p>
        </div>
      </div>

      <!-- 播放控制 -->
      <div class="player-controls">
        <button @click.stop="togglePlay" class="play-btn" :class="{ playing: isPlaying }">
          <Pause v-if="isPlaying" :size="20" />
          <Play v-else :size="20" />
        </button>

        <button @click.stop="nextSong" class="next-btn">
          <SkipForward :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { Play, Pause, SkipForward } from 'lucide-vue-next'

const router = useRouter()
const musicStore = useMusicStore()

// 从 store 获取状态
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const progress = computed(() => musicStore.progress)

// 方法
const togglePlay = () => {
  musicStore.togglePlay()
}

const nextSong = () => {
  musicStore.nextSong()
}

const goToFullPlayer = () => {
  router.push('/player')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=101'
}
</script>

<style scoped>
.mini-player {
  position: fixed;
  bottom: 65px; /* 在底部导航栏上方 */
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
}

.mini-player:hover {
  background: rgba(15, 23, 42, 0.98);
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  background: #007aff;
  transition: width 0.1s ease;
}

.player-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: white;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0; /* 允许文本截断 */
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.125rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.75rem;
  opacity: 0.7;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.play-btn,
.next-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  /* 确保按钮状态正确重置 */
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.play-btn {
  background: #007aff;
  width: 36px;
  height: 36px;
}

.play-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.play-btn:active {
  background: #004494;
  transform: scale(0.98);
}

.play-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.next-btn {
  opacity: 0.7;
  width: 32px;
  height: 32px;
}

.next-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.next-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.next-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 播放动画 */
.play-btn.playing {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(0, 122, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .player-content {
    padding: 0.5rem 0.75rem;
  }

  .song-info {
    gap: 0.5rem;
  }

  .song-cover {
    width: 36px;
    height: 36px;
  }

  .song-title {
    font-size: 0.8125rem;
  }

  .song-artist {
    font-size: 0.6875rem;
  }

  .play-btn {
    width: 32px;
    height: 32px;
  }

  .next-btn {
    width: 28px;
    height: 28px;
  }
}

/* 适配安全区域 */
@supports (padding: max(0px)) {
  .mini-player {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}
</style>
