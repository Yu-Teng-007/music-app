<template>
  <audio
    ref="audioRef"
    :src="currentSong?.audioUrl"
    @loadedmetadata="handleLoadedMetadata"
    @loadeddata="handleLoadedData"
    @timeupdate="handleTimeUpdate"
    @ended="handleEnded"
    @error="handleError"
    @canplay="handleCanPlay"
    @loadstart="handleLoadStart"
    @waiting="handleWaiting"
    @playing="handlePlaying"
    @pause="handlePause"
    preload="metadata"
    crossorigin="anonymous"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()
const audioRef = ref<HTMLAudioElement>()

// 从store中获取响应式引用 - 使用computed保持响应性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const volume = computed(() => musicStore.volume)
const currentTime = computed(() => musicStore.currentTime)

// 监听当前歌曲变化
watch(
  currentSong,
  (newSong, oldSong) => {
    if (newSong && audioRef.value) {
      // 重置播放状态
      musicStore.currentTime = 0
      musicStore.duration = 0

      // 设置音频源并加载
      audioRef.value.src = newSong.audioUrl
      audioRef.value.load()
    }
  },
  { immediate: true }
)

// 监听播放状态变化
watch(isPlaying, playing => {
  if (!audioRef.value) {
    return
  }

  if (playing) {
    audioRef.value
      .play()
      .then(() => {})
      .catch(error => {
        musicStore.pause()
      })
  } else {
    audioRef.value.pause()
  }
})

// 监听音量变化
watch(volume, vol => {
  if (audioRef.value) {
    audioRef.value.volume = vol
  }
})

// 监听进度设置 - 移除这个watch，因为会造成循环更新

// 音频事件处理
const handleLoadedMetadata = () => {
  if (audioRef.value) {
    musicStore.duration = audioRef.value.duration
    audioRef.value.volume = musicStore.volume
  }
}

const handleTimeUpdate = () => {
  if (audioRef.value) {
    musicStore.currentTime = audioRef.value.currentTime
  }
}

const handleEnded = () => {
  // 歌曲播放结束
  if (musicStore.playMode.repeat === 'one') {
    // 单曲循环
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.play()
    }
  } else {
    // 播放下一首
    musicStore.nextSong()
  }
}

const handleError = (event: Event) => {
  const audio = event.target as HTMLAudioElement

  musicStore.pause()
}

const handleCanPlay = () => {
  // 音频可以播放
}

const handleLoadStart = () => {
  // 开始加载音频
}

const handleLoadedData = () => {
  // 音频数据加载完成
}

const handleWaiting = () => {
  // 音频缓冲中...
}

const handlePlaying = () => {
  // 音频开始播放
}

const handlePause = () => {
  // 音频暂停
}

// 设置进度的方法
const setProgress = (progress: number) => {
  if (audioRef.value && musicStore.duration > 0) {
    const newTime = (progress / 100) * musicStore.duration
    audioRef.value.currentTime = newTime
    musicStore.currentTime = newTime
  }
}

// 暴露方法给store使用
onMounted(() => {
  // 将setProgress方法添加到store中
  musicStore.setProgress = setProgress

  // 如果有当前歌曲，确保音频元素正确设置
  if (currentSong.value && audioRef.value) {
    audioRef.value.src = currentSong.value.audioUrl
    audioRef.value.load()
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style scoped>
audio {
  display: none;
}
</style>
