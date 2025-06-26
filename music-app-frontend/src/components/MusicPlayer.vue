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
    <AlbumCover
      :coverUrl="currentSong?.coverUrl"
      :albumName="currentSong?.album"
      :isPlaying="isPlaying"
      :progress="displayProgress"
    />

    <!-- 歌曲信息 -->
    <SongInfo :song="currentSong" />

    <!-- 进度条 -->
    <ProgressBar :bufferProgress="75" />

    <!-- 播放控制 -->
    <PlayerControls />

    <!-- 底部操作 -->
    <div class="player-bottom" v-if="isFullScreen">
      <button class="bottom-btn" @click="toggleFavorite">
        <Heart :size="20" :fill="isFavorite ? 'currentColor' : 'none'" />
      </button>
      <button class="bottom-btn" @click="showComments">
        <MessageCircle :size="20" />
      </button>
      <button class="bottom-btn" @click="shareSong">
        <Share :size="20" />
      </button>
      <button class="bottom-btn" @click="showPlaylist">
        <List :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import { useFavoritesStore } from '@/stores/favorites'
import { ChevronDown, MoreHorizontal, Heart, MessageCircle, Share, List } from 'lucide-vue-next'

// 导入拆分后的子组件
import AlbumCover from './player/AlbumCover.vue'
import SongInfo from './player/SongInfo.vue'
import ProgressBar from './player/ProgressBar.vue'
import PlayerControls from './player/PlayerControls.vue'

const router = useRouter()
const musicStore = useMusicStore()
const favoritesStore = useFavoritesStore()
const isFullScreen = ref(false)

// 从 store 中获取状态 - 使用computed保持响应性
const currentSong = computed(() => musicStore.currentSong)
const isPlaying = computed(() => musicStore.isPlaying)
const displayProgress = computed(() => musicStore.progress)

// 检查当前歌曲是否收藏
const isFavorite = computed(() => {
  if (!currentSong.value) return false
  return favoritesStore.isFavorite(currentSong.value.id)
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

const toggleFavorite = async () => {
  if (!currentSong.value) return

  if (isFavorite.value) {
    await favoritesStore.removeFavorite(currentSong.value.id)
  } else {
    await favoritesStore.addFavorite(currentSong.value.id)
  }
}

const showComments = () => {
  if (!currentSong.value) return
  // 实现显示评论的逻辑
}

const shareSong = () => {
  if (!currentSong.value) return
  // 实现分享歌曲的逻辑
}

const showPlaylist = () => {
  // 实现显示播放列表的逻辑
}
</script>

<style scoped>
.music-player {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  overflow: hidden;
  padding-bottom: 20px;
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  height: 60px;
}

.back-btn,
.menu-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-title {
  font-size: 16px;
  font-weight: 500;
}

.player-bottom {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  margin-top: auto;
}

.bottom-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
