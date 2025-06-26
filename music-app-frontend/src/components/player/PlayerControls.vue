<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-vue-next'
import { useMusicStore } from '@/stores/music'

const musicStore = useMusicStore()

// 从store获取状态
const isPlaying = computed(() => musicStore.isPlaying)
const playMode = computed(() => musicStore.playMode)

// 方法
const togglePlay = () => musicStore.togglePlay()
const previousSong = () => musicStore.previousSong()
const nextSong = () => musicStore.nextSong()
const toggleShuffle = () => musicStore.toggleShuffle()
const toggleRepeat = () => musicStore.toggleRepeat()
</script>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.control-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.control-btn.active {
  color: #007aff;
}

.play-btn {
  background: white;
  border: none;
  color: #121212;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}
</style>
