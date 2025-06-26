<template>
  <div class="album-cover-container">
    <div class="album-cover" :class="{ spinning: isPlaying }">
      <img :src="coverUrl || defaultCover" :alt="albumName" @error="handleImageError" />
      <div class="vinyl-center"></div>
    </div>
    <!-- 进度环 -->
    <div class="progress-ring" v-if="showProgressRing">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  coverUrl: {
    type: String,
    default: '',
  },
  albumName: {
    type: String,
    default: '未知专辑',
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  showProgressRing: {
    type: Boolean,
    default: true,
  },
})

const defaultCover = 'https://picsum.photos/300/300?random=102'

// 进度环计算
const circumference = 2 * Math.PI * 140
const progressOffset = computed(() => {
  return circumference - (props.progress / 100) * circumference
})

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = defaultCover
}
</script>

<style scoped>
.album-cover-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  animation: rotate 20s linear infinite;
  animation-play-state: paused;
}

.album-cover.spinning {
  animation-play-state: running;
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
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #333 0%, #111 70%, #000 100%);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.progress-circle {
  transition: stroke-dashoffset 0.1s linear;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
