<template>
  <!-- 纯逻辑组件，不需要模板 -->
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useMusicStore } from '@/stores/music'
import audioService from '@/services/AudioService'

const musicStore = useMusicStore()

// 监听当前歌曲变化
watch(
  () => musicStore.currentSong,
  newSong => {
    if (newSong) {
      audioService.loadSong(newSong)

      // 如果当前是播放状态，加载新歌曲后自动播放
      if (musicStore.isPlaying) {
        audioService.play().catch(() => {
          // 播放失败，更新状态
          musicStore.pause()
        })
      }
    }
  },
  { immediate: true }
)

// 监听播放状态变化
watch(
  () => musicStore.isPlaying,
  isPlaying => {
    if (isPlaying) {
      audioService.play().catch(() => {
        musicStore.pause()
      })
    } else {
      audioService.pause()
    }
  }
)

// 监听音量变化
watch(
  () => musicStore.volume,
  newVolume => {
    audioService.setVolume(newVolume)
  }
)

// 设置事件监听
onMounted(() => {
  // 更新store中的setProgress方法
  musicStore.setProgress = (progress: number) => {
    audioService.setProgress(progress)
  }

  // 设置初始音量
  audioService.setVolume(musicStore.volume)

  // 设置事件监听
  audioService.onTimeUpdate(currentTime => {
    musicStore.currentTime = currentTime
  })

  audioService.onDurationChange(duration => {
    musicStore.duration = duration
  })

  audioService.onEnded(() => {
    // 根据播放模式决定下一步操作
    if (musicStore.playMode.repeat === 'one') {
      // 单曲循环
      audioService.setCurrentTime(0)
      audioService.play().catch(() => {
        musicStore.pause()
      })
    } else {
      // 播放下一首
      musicStore.nextSong()
    }
  })

  audioService.onError(error => {
    console.error('音频播放错误:', error)
    musicStore.pause()
    // 可以在这里添加错误处理逻辑
    musicStore.setError('音频播放失败，请尝试其他歌曲')
  })
})

// 组件卸载时清理
onUnmounted(() => {
  audioService.destroy()
})
</script>

<style scoped>
/* 无需样式 */
</style>
