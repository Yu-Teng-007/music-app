<template>
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
        <div class="progress-buffer" :style="{ width: bufferProgress + '%' }"></div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const props = defineProps({
  bufferProgress: {
    type: Number,
    default: 0,
  },
})

const musicStore = useMusicStore()
const progressBarRef = ref<HTMLElement>()
const isDragging = ref(false)
const dragProgress = ref(0)

// 从 store 中获取状态
const formattedCurrentTime = computed(() => musicStore.formattedCurrentTime)
const formattedDuration = computed(() => musicStore.formattedDuration)

// 计算显示的进度（拖拽时使用拖拽进度）
const displayProgress = computed(() => {
  return isDragging.value ? dragProgress.value : musicStore.progress
})

// 进度条点击事件
const handleProgressClick = (event: MouseEvent) => {
  if (!progressBarRef.value) return

  const rect = progressBarRef.value.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const progress = (offsetX / rect.width) * 100

  musicStore.setProgress(progress)
}

// 进度条拖动事件
const handleProgressMouseDown = (event: MouseEvent) => {
  handleProgressClick(event)
  isDragging.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleThumbMouseDown = (event: MouseEvent) => {
  event.stopPropagation()
  isDragging.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleThumbTouchStart = (event: TouchEvent) => {
  event.stopPropagation()
  isDragging.value = true
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !progressBarRef.value) return

  const rect = progressBarRef.value.getBoundingClientRect()
  const offsetX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  dragProgress.value = (offsetX / rect.width) * 100
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || !progressBarRef.value) return

  const touch = event.touches[0]
  const rect = progressBarRef.value.getBoundingClientRect()
  const offsetX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
  dragProgress.value = (offsetX / rect.width) * 100
}

const handleMouseUp = () => {
  if (!isDragging.value) return

  musicStore.setProgress(dragProgress.value)
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  musicStore.setProgress(dragProgress.value)
  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.progress-section {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  gap: 10px;
}

.time-current,
.time-duration {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
}

.time-current {
  text-align: right;
}

.time-duration {
  text-align: left;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #007aff, #5ac8fa);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-thumb,
.progress-thumb.dragging {
  opacity: 1;
}
</style>
