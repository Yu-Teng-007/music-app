<template>
  <div class="album-view">
    <!-- 专辑头部 -->
    <div class="album-header">
      <div class="header-background" :style="backgroundStyle"></div>
      <div class="header-overlay"></div>

      <!-- 导航栏 -->
      <div class="header-nav">
        <button @click="goBack" class="nav-btn">
          <ChevronLeft :size="24" />
        </button>
        <button class="nav-btn">
          <MoreHorizontal :size="24" />
        </button>
      </div>

      <!-- 专辑信息 -->
      <div class="album-info">
        <div class="album-cover">
          <img
            :src="album.coverUrl || 'https://picsum.photos/300/300?random=107'"
            :alt="album.title"
            @error="handleImageError"
          />
        </div>
        <h1 class="album-title">{{ album.title }}</h1>
        <p class="album-artist" @click="goToArtist">{{ album.artist }}</p>
        <p class="album-meta">
          {{ album.year }} • {{ album.songs.length }}首歌曲 • {{ totalDuration }}
        </p>

        <!-- 播放全部按钮 -->
        <button @click="playAll" class="play-all-btn">
          <Play :size="20" />
          播放全部
        </button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-section">
      <div class="songs-list">
        <div
          v-for="(song, index) in album.songs"
          :key="song.id"
          class="song-item"
          @click="playSong(song, index)"
        >
          <div class="song-index">{{ index + 1 }}</div>
          <div class="song-info">
            <h3 class="song-title">{{ song.title }}</h3>
            <p class="song-meta">{{ song.artist }}</p>
          </div>
          <div class="song-duration">{{ formatDuration(song.duration) }}</div>
          <button class="song-menu-btn" @click.stop="showSongMenu(song)">
            <MoreHorizontal :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { ChevronLeft, MoreHorizontal, Play } from 'lucide-vue-next'

interface Album {
  id: string
  title: string
  artist: string
  year: number
  coverUrl: string
  backgroundUrl: string
  songs: Song[]
}

const router = useRouter()
const route = useRoute()
const musicStore = useMusicStore()

// 示例专辑数据
const album = ref<Album>({
  id: '1',
  title: 'MIRRORS',
  artist: '王嘉尔',
  year: 2021,
  coverUrl: 'https://picsum.photos/300/300?random=1',
  backgroundUrl: 'https://picsum.photos/800/600?random=1',
  songs: [
    {
      id: '1',
      title: 'LMLY',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 180,
      coverUrl: 'https://picsum.photos/300/300?random=2',
      audioUrl: '/demo-audio1.mp3',
    },
    {
      id: '2',
      title: 'Drive It Like You Stole It',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 195,
      coverUrl: 'https://picsum.photos/300/300?random=3',
      audioUrl: '/demo-audio2.mp3',
    },
    {
      id: '3',
      title: 'DWAY!',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 210,
      coverUrl: 'https://picsum.photos/300/300?random=4',
      audioUrl: '/demo-audio3.mp3',
    },
    {
      id: '4',
      title: 'Cruel',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 225,
      coverUrl: 'https://picsum.photos/300/300?random=5',
      audioUrl: '/demo-audio4.mp3',
    },
    {
      id: '5',
      title: 'TITANIC',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 240,
      coverUrl: 'https://picsum.photos/300/300?random=6',
      audioUrl: '/demo-audio5.mp3',
    },
    {
      id: '6',
      title: 'Blue',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 200,
      coverUrl: 'https://picsum.photos/300/300?random=7',
      audioUrl: '/demo-audio6.mp3',
    },
  ],
})

// 计算属性
const backgroundStyle = computed(() => ({
  backgroundImage: `url(${album.value.backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}))

const totalDuration = computed(() => {
  const total = album.value.songs.reduce((sum, song) => sum + song.duration, 0)
  return formatDuration(total)
})

// 方法
const goBack = () => {
  router.back()
}

const goToArtist = () => {
  router.push(`/artist/1`) // 假设艺人ID为1
}

const playAll = () => {
  musicStore.setPlaylist(album.value.songs)
  if (album.value.songs.length > 0) {
    musicStore.setCurrentSong(album.value.songs[0])
    musicStore.play()
  }
}

const playSong = (song: Song, index: number) => {
  musicStore.setPlaylist(album.value.songs)
  musicStore.setCurrentSong(song)
  musicStore.play()
  router.push('/player')
}

const showSongMenu = (song: Song) => {
  // 显示歌曲菜单的逻辑
  // TODO: 实现歌曲菜单功能
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=108'
}

onMounted(() => {
  // 这里可以根据路由参数加载具体的专辑数据
  const albumId = route.params.id
  // TODO: 根据albumId加载专辑数据
})
</script>

<style scoped>
.album-view {
  min-height: 100vh;
  background: #0f0f23;
  color: white;
  padding-bottom: 160px; /* 为迷你播放器和导航栏留出空间 */
}

/* 专辑头部 */
.album-header {
  position: relative;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  transform: scale(1.1);
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 15, 35, 0.3) 0%,
    rgba(15, 15, 35, 0.7) 70%,
    rgba(15, 15, 35, 0.95) 100%
  );
}

.header-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 3rem 1.5rem 1rem;
  z-index: 10;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.05);
}

.nav-btn:active {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(0.98);
}

.nav-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.album-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1.5rem;
  z-index: 10;
  text-align: center;
}

.album-cover {
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.album-artist {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 0.5rem 0;
  cursor: pointer;
  transition: opacity 0.2s;
}

.album-artist:hover {
  opacity: 1;
  text-decoration: underline;
}

.album-meta {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0 0 2rem 0;
}

.play-all-btn {
  background: #007aff;
  border: none;
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.play-all-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 122, 255, 0.4);
}

.play-all-btn:active {
  background: #004494;
  transform: translateY(0px);
  box-shadow: 0 2px 10px rgba(0, 122, 255, 0.5);
}

.play-all-btn:focus {
  outline: none;
  box-shadow:
    0 4px 20px rgba(0, 122, 255, 0.3),
    0 0 0 3px rgba(0, 122, 255, 0.3);
}

/* 歌曲列表 */
.songs-section {
  background: #0f0f23;
  padding: 1.5rem;
}

.songs-list {
  max-width: 600px;
  margin: 0 auto;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 1rem;
  /* 移除点击高亮效果 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  outline: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.song-item:active {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.song-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.song-index {
  width: 24px;
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.6;
  font-weight: 500;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta {
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 0.875rem;
  opacity: 0.6;
  margin-right: 0.5rem;
}

.song-menu-btn {
  background: none;
  border: none;
  color: white;
  opacity: 0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.song-item:hover .song-menu-btn {
  opacity: 0.6;
}

.song-menu-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.song-menu-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.95);
}

.song-menu-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .album-header {
    height: 50vh;
    min-height: 350px;
  }

  .header-nav {
    padding: 2rem 1rem 1rem;
  }

  .album-info {
    padding: 1.5rem 1rem;
  }

  .album-cover {
    width: 160px;
    height: 160px;
    margin-bottom: 1rem;
  }

  .album-title {
    font-size: 1.5rem;
  }

  .album-artist {
    font-size: 1rem;
  }

  .songs-section {
    padding: 1rem;
  }

  .song-item {
    gap: 0.75rem;
  }

  .song-title {
    font-size: 0.9375rem;
  }

  .song-meta {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .album-cover {
    width: 140px;
    height: 140px;
  }

  .album-title {
    font-size: 1.25rem;
  }

  .play-all-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9375rem;
  }

  .song-item {
    padding: 0.625rem 0;
  }
}

/* 适配安全区域 */
@supports (padding: max(0px)) {
  .header-nav {
    padding-top: max(3rem, env(safe-area-inset-top) + 1rem);
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }

  .album-info {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }

  .songs-section {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }
}
</style>
