<template>
  <!-- 隐藏的音频元素 -->
  <audio
    ref="audioRef"
    :src="audioSrc"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @ended="onEnded"
    @error="onError"
    preload="auto"
  ></audio>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()
const audioRef = ref<HTMLAudioElement | null>(null)

// 计算音频源
const audioSrc = ref('')

// 播放音频
const playAudio = () => {
  if (audioRef.value && audioSrc.value) {
    const playPromise = audioRef.value.play()

    // 处理浏览器的自动播放策略
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 播放成功
        })
        .catch(error => {
          console.error('播放失败:', error)
          // 自动播放被阻止，更新状态
          musicStore.pause()
        })
    }
  }
}

// 暂停音频
const pauseAudio = () => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
}

// 监听当前歌曲变化
watch(
  () => musicStore.currentSong,
  newSong => {
    if (newSong) {
      audioSrc.value = 'src' + newSong.audioUrl
      // 如果当前正在播放，则加载新歌曲后自动播放
      if (musicStore.isPlaying) {
        // 使用setTimeout等待DOM更新后再播放
        setTimeout(() => {
          playAudio()
        }, 0)
      }
    } else {
      audioSrc.value = ''
      pauseAudio()
    }
  },
  { immediate: true }
)

// 监听播放状态变化
watch(
  () => musicStore.isPlaying,
  isPlaying => {
    if (isPlaying) {
      playAudio()
    } else {
      pauseAudio()
    }
  }
)

// 监听音量变化
watch(
  () => musicStore.volume,
  newVolume => {
    if (audioRef.value) {
      audioRef.value.volume = newVolume
    }
  }
)

// 实现设置进度的方法
const setProgress = (progress: number) => {
  if (audioRef.value && musicStore.duration > 0) {
    const newTime = (progress / 100) * musicStore.duration
    audioRef.value.currentTime = newTime
    musicStore.currentTime = newTime
  }
}

// 注册设置进度方法到store
onMounted(() => {
  // 覆盖store中的setProgress方法
  musicStore.setProgress = setProgress

  // 设置初始音量
  if (audioRef.value) {
    audioRef.value.volume = musicStore.volume
  }
})

// 事件处理
const onTimeUpdate = () => {
  if (audioRef.value) {
    musicStore.currentTime = audioRef.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioRef.value) {
    musicStore.duration = audioRef.value.duration || 0
  }
}

const onEnded = () => {
  // 根据播放模式决定下一步操作
  if (musicStore.playMode.repeat === 'one') {
    // 单曲循环
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      playAudio()
    }
  } else {
    // 播放下一首
    musicStore.nextSong()
  }
}

const onError = (error: Event) => {
  console.error('音频播放错误:', error)
  // 可以添加错误处理逻辑，例如尝试下一首歌曲
  musicStore.pause()
}

// 组件卸载时清理
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<style scoped>
audio {
  display: none;
}
</style>
