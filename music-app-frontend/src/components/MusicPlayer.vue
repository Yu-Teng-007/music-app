<template>
  <div class="music-player" :class="{ 'full-screen': isFullScreen }">
    <!-- 背景渐变 -->
    <div class="background-gradient" :style="backgroundStyle"></div>

    <!-- 头部控制栏 -->
    <div class="player-header">
      <button @click="goBack" class="back-btn">
        <ChevronDown :size="24" />
      </button>
      <div class="player-title">正在播放</div>
      <button class="menu-btn">
        <MoreHorizontal :size="24" />
      </button>
    </div>

    <!-- 专辑封面 -->
    <div class="album-cover-container">
      <div class="album-cover" :class="{ spinning: isPlaying }">
        <img
          :src="currentSong?.coverUrl || 'https://picsum.photos/300/300?random=102'"
          :alt="currentSong?.album"
          @error="handleImageError"
        />
        <div class="vinyl-center"></div>
      </div>
      <!-- 进度环 -->
      <div class="progress-ring">
        <svg width="300" height="300" viewBox="0 0 300 300">
          <defs>
            <linearGradient id="progressGradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#007AFF" />
              <stop offset="100%" stop-color="#5AC8FA" />
            </linearGradient>
          </defs>
          <!-- 背景圆环 -->
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            stroke-width="4"
          />
          <!-- 进度圆环 -->
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="url(#progressGradient)"
            stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 150 150)"
            class="progress-circle"
          />
        </svg>
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="song-info">
      <h2 class="song-title">{{ currentSong?.title || '未选择歌曲' }}</h2>
      <p class="song-artist">{{ currentSong?.artist || '未知艺人' }}</p>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <span class="time-current">{{ formattedCurrentTime }}</span>
      <div
        class="progress-bar"
        @click="handleProgressClick"
        @mousedown="handleProgressMouseDown"
        ref="progressBarRef"
      >
        <div class="progress-track">
          <!-- 缓冲进度条 -->
          <div class="progress-buffer" :style="{ width: '75%' }"></div>
        </div>
        <div class="progress-fill" :style="{ width: displayProgress + '%' }"></div>
        <div
          class="progress-thumb"
          :class="{ dragging: isDragging }"
          :style="{ left: displayProgress + '%' }"
          @mousedown="handleThumbMouseDown"
          @touchstart="handleThumbTouchStart"
        ></div>
      </div>
      <span class="time-duration">{{ formattedDuration }}</span>
    </div>

    <!-- 播放控制 -->
    <div class="player-controls">
      <button @click="toggleShuffle" class="control-btn" :class="{ active: playMode.shuffle }">
        <Shuffle :size="20" />
      </button>

      <button @click="previousSong" class="control-btn">
        <SkipBack :size="24" />
      </button>

      <button @click="togglePlay" class="play-btn">
        <Pause v-if="isPlaying" :size="32" />
        <Play v-else :size="32" />
      </button>

      <button @click="nextSong" class="control-btn">
        <SkipForward :size="24" />
      </button>

      <button
        @click="toggleRepeat"
        class="control-btn"
        :class="{ active: playMode.repeat !== 'none' }"
      >
        <Repeat1 v-if="playMode.repeat === 'one'" :size="20" />
        <Repeat v-else :size="20" />
      </button>
    </div>

    <!-- 底部操作 -->
    <div class="player-bottom" v-if="isFullScreen">
      <button class="bottom-btn">
        <Heart :size="20" />
      </button>
      <button class="bottom-btn">
        <MessageCircle :size="20" />
      </button>
      <button class="bottom-btn">
        <Share :size="20" />
      </button>
      <button class="bottom-btn">
        <List :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share,
  List,
} from 'lucide-vue-next'

const router = useRouter()
const musicStore = useMusicStore()
const isFullScreen = ref(false)
const progressBarRef = ref<HTMLElement>()
const isDragging = ref(false)
const dragProgress = ref(0)

// 从 store 中获取状态 - 使用computed保持响应性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const formattedCurrentTime = computed(() => musicStore.formattedCurrentTime)
const formattedDuration = computed(() => musicStore.formattedDuration)
const playMode = computed(() => musicStore.playMode)

// 计算显示的进度（拖拽时使用拖拽进度）
const displayProgress = computed(() => {
  return isDragging.value ? dragProgress.value : musicStore.progress
})

// 进度环计算
const circumference = 2 * Math.PI * 140
const progressOffset = computed(() => {
  return circumference - (displayProgress.value / 100) * circumference
})

// 背景渐变样式
const backgroundStyle = computed(() => {
  if (!currentSong.value) return {}

  return {
    background: `linear-gradient(135deg, 
      rgba(59, 130, 246, 0.8) 0%, 
      rgba(147, 51, 234, 0.8) 50%, 
      rgba(239, 68, 68, 0.8) 100%)`,
  }
})

// 方法
const goBack = () => {
  router.go(-1) // 返回上一页
}

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const togglePlay = () => {
  musicStore.togglePlay()
}

const nextSong = () => {
  musicStore.nextSong()
}

const previousSong = () => {
  musicStore.previousSong()
}

const toggleShuffle = () => {
  musicStore.toggleShuffle()
}

const toggleRepeat = () => {
  musicStore.toggleRepeat()
}

const handleProgressClick = (event: MouseEvent) => {
  if (!progressBarRef.value || isDragging.value) return

  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const newProgress = (clickX / rect.width) * 100
  musicStore.setProgress(Math.max(0, Math.min(100, newProgress)))
}

const handleProgressMouseDown = (event: MouseEvent) => {
  if (event.target === progressBarRef.value) {
    handleProgressClick(event)
  }
}

const handleThumbMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragProgress.value = musicStore.progress

  const handleMouseMove = (e: MouseEvent) => {
    if (!progressBarRef.value || !isDragging.value) return

    const rect = progressBarRef.value.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    dragProgress.value = newProgress
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      musicStore.setProgress(dragProgress.value)
      isDragging.value = false
    }

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleThumbTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragProgress.value = musicStore.progress

  const handleTouchMove = (e: TouchEvent) => {
    if (!progressBarRef.value || !isDragging.value || e.touches.length === 0) return

    const rect = progressBarRef.value.getBoundingClientRect()
    const touchX = e.touches[0].clientX - rect.left
    const newProgress = Math.max(0, Math.min(100, (touchX / rect.width) * 100))
    dragProgress.value = newProgress
  }

  const handleTouchEnd = () => {
    if (isDragging.value) {
      musicStore.setProgress(dragProgress.value)
      isDragging.value = false
    }

    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=103'
}

// 生命周期
onMounted(() => {
  // 初始化默认播放列表
  if (!currentSong.value) {
    // 使用默认音源
    musicStore.initializeDefaultPlaylist()
    if (musicStore.playlist.length > 0) {
      // 设置当前歌曲为第一首默认歌曲
      musicStore.setCurrentSong(musicStore.playlist[0])
    }
  }
})
</script>

<style scoped>
.music-player {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  transition: all 0.3s ease;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  padding-top: 2rem;
}

.back-btn,
.menu-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:hover,
.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-btn:active,
.menu-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.back-btn:focus,
.menu-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.player-title {
  font-size: 1rem;
  font-weight: 500;
}

.album-cover-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 2rem;
}

.album-cover {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.album-cover.spinning {
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: #333;
  border-radius: 50%;
  border: 2px solid #666;
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
}

.progress-circle {
  transition: stroke-dashoffset 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(0, 122, 255, 0.3));
}

/* 播放时的脉动效果 */
.album-cover.spinning + .progress-ring .progress-circle {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(0, 122, 255, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(0, 122, 255, 0.6));
  }
}

.song-info {
  text-align: center;
  padding: 1rem 2rem;
}

.song-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.song-artist {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.progress-section {
  display: flex;
  align-items: center;
  padding: 0 2rem;
  gap: 1rem;
  margin: 1rem 0;
}

.time-current,
.time-duration {
  font-size: 0.875rem;
  opacity: 0.7;
  min-width: 45px;
  text-align: center;
  font-weight: 500;
}

.progress-bar {
  position: relative;
  flex: 1;
  height: 6px;
  cursor: pointer;
  padding: 8px 0; /* 增加点击区域 */
  margin: 0 8px;
}

.progress-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #007aff 0%, #5ac8fa 100%);
  border-radius: 2px;
  transition: width 0.15s ease;
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #ffffff;
  border: 2px solid #007aff;
  border-radius: 50%;
  cursor: grab;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    left 0.1s ease,
    transform 0.1s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.progress-bar:hover .progress-thumb,
.progress-thumb.dragging {
  opacity: 1;
}

.progress-bar:hover .progress-fill {
  box-shadow: 0 0 12px rgba(0, 122, 255, 0.5);
}

.progress-thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.progress-thumb:active,
.progress-thumb.dragging {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.6);
  border-color: #5ac8fa;
}

.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  gap: 2rem;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.control-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.control-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.control-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.control-btn.active {
  opacity: 1;
  color: #007aff;
}

.play-btn {
  background: #007aff;
  border: none;
  color: white;
  cursor: pointer;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 122, 255, 0.4);
}

.play-btn:active {
  background: #004494;
  transform: scale(0.98);
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.5);
}

.play-btn:focus {
  outline: none;
  box-shadow:
    0 8px 16px rgba(0, 122, 255, 0.3),
    0 0 0 3px rgba(0, 122, 255, 0.3);
}

.player-bottom {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 1rem 2rem 2rem;
}

.bottom-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.bottom-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

.bottom-btn:active {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.bottom-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .album-cover {
    width: 240px;
    height: 240px;
  }

  .progress-ring svg {
    width: 260px;
    height: 260px;
  }

  .player-controls {
    gap: 1.5rem;
  }

  .song-title {
    font-size: 1.25rem;
  }

  /* 移动设备上的进度条优化 */
  .progress-thumb {
    width: 18px;
    height: 18px;
    opacity: 0.9; /* 移动设备上默认显示 */
    border-width: 3px;
  }

  .progress-bar {
    height: 8px; /* 进度条在移动设备上稍微高一点 */
    padding: 12px 0; /* 增加点击区域 */
  }

  .progress-track {
    height: 5px;
  }

  .time-current,
  .time-duration {
    font-size: 0.8rem;
    min-width: 42px;
  }
}
</style>
