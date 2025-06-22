<template>
  <div class="artist-detail">
    <!-- 头部背景和艺人信息 -->
    <div class="artist-header">
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

      <!-- 艺人信息 -->
      <div class="artist-info">
        <div class="artist-avatar">
          <img
            :src="artist.avatarUrl || 'https://picsum.photos/300/300?random=109'"
            :alt="artist.name"
            @error="handleImageError"
          />
        </div>
        <h1 class="artist-name">{{ artist.name }}</h1>
        <p class="artist-stats">{{ artist.followers }}w粉丝</p>

        <!-- 关注按钮 -->
        <button @click="toggleFollow" class="follow-btn" :class="{ following: isFollowing }">
          {{ isFollowing ? '已关注' : '关注' }}
        </button>

        <!-- 播放全部按钮 -->
        <button @click="playAll" class="play-all-btn">
          <Play :size="20" />
          播放全部
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 热门歌曲 -->
      <div class="section">
        <h2 class="section-title">热门歌曲</h2>
        <div class="song-list">
          <div
            v-for="(song, index) in artist.popularSongs"
            :key="song.id"
            class="song-item"
            @click="playSong(song)"
          >
            <div class="song-index">{{ index + 1 }}</div>
            <div class="song-cover">
              <img
                :src="song.coverUrl || 'https://picsum.photos/300/300?random=110'"
                :alt="song.title"
                @error="handleImageError"
              />
            </div>
            <div class="song-info">
              <h3 class="song-title">{{ song.title }}</h3>
              <p class="song-meta">{{ song.artist }} • {{ song.album }}</p>
            </div>
            <button class="song-menu-btn">
              <MoreHorizontal :size="20" />
            </button>
          </div>
        </div>
      </div>

      <!-- 专辑 -->
      <div class="section">
        <h2 class="section-title">专辑</h2>
        <div class="album-grid">
          <div
            v-for="album in artist.albums"
            :key="album.id"
            class="album-item"
            @click="openAlbum(album)"
          >
            <div class="album-cover">
              <img
                :src="album.coverUrl || 'https://picsum.photos/300/300?random=111'"
                :alt="album.title"
                @error="handleImageError"
              />
              <div class="album-overlay">
                <Play :size="24" />
              </div>
            </div>
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-year">{{ album.year }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { ChevronLeft, MoreHorizontal, Play } from 'lucide-vue-next'

interface Album {
  id: string
  title: string
  year: number
  coverUrl: string
}

interface Artist {
  id: string
  name: string
  avatarUrl: string
  backgroundUrl: string
  followers: number
  popularSongs: Song[]
  albums: Album[]
}

const router = useRouter()
const musicStore = useMusicStore()
const isFollowing = ref(false)

// 示例艺人数据
const artist = ref<Artist>({
  id: '1',
  name: '王嘉尔',
  avatarUrl: 'https://picsum.photos/300/300?random=140',
  backgroundUrl: 'https://picsum.photos/800/600?random=141',
  followers: 1423,
  popularSongs: [
    {
      id: '1',
      title: 'I Love You 3000 II',
      artist: '88rising/Stephanie Poetri/王嘉尔-Head...',
      album: 'Head in the Clouds II',
      duration: 210,
      coverUrl: 'https://picsum.photos/300/300?random=112',
      audioUrl: '/demo-audio1.mp3',
    },
    {
      id: '2',
      title: '一个人',
      artist: '王嘉尔',
      album: 'MIRRORS',
      duration: 195,
      coverUrl: 'https://picsum.photos/300/300?random=113',
      audioUrl: '/demo-audio2.mp3',
    },
  ],
  albums: [
    {
      id: '1',
      title: 'MIRRORS',
      year: 2021,
      coverUrl: 'https://picsum.photos/300/300?random=114',
    },
    {
      id: '2',
      title: 'MAGIC MAN',
      year: 2022,
      coverUrl: 'https://picsum.photos/300/300?random=115',
    },
  ],
})

// 背景样式
const backgroundStyle = computed(() => ({
  backgroundImage: `url(${artist.value.backgroundUrl})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}))

// 方法
const goBack = () => {
  router.back()
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
}

const playAll = () => {
  musicStore.setPlaylist(artist.value.popularSongs)
  if (artist.value.popularSongs.length > 0) {
    musicStore.setCurrentSong(artist.value.popularSongs[0])
    musicStore.play()
  }
}

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
}

const openAlbum = (album: Album) => {
  // 导航到专辑详情页
  router.push(`/album/${album.id}`)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=116'
}

onMounted(() => {
  // 这里可以根据路由参数加载具体的艺人数据
})
</script>

<style scoped>
.artist-detail {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a1a 0%, #000 100%);
  color: white;
}

.artist-header {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.header-nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 2rem 1rem 1rem;
}

.nav-btn {
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.artist-info {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.artist-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.artist-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artist-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.artist-stats {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0 0 2rem 0;
}

.follow-btn {
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.follow-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.follow-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

.follow-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.follow-btn:hover {
  background: white;
  color: black;
}

.follow-btn.following {
  background: #007aff;
  border-color: #007aff;
}

.play-all-btn {
  background: #007aff;
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.play-all-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.content-section {
  padding: 2rem 1rem;
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
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
}

.song-item:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.99);
}

.song-item:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.song-index {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.6;
  min-width: 20px;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  overflow: hidden;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.song-meta {
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
}

.song-menu-btn {
  background: none;
  border: none;
  color: white;
  opacity: 0.6;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.song-menu-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.album-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.album-item:hover {
  transform: scale(1.05);
}

.album-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-item:hover .album-overlay {
  opacity: 1;
}

.album-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.album-year {
  font-size: 0.875rem;
  opacity: 0.6;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .artist-header {
    height: 50vh;
    min-height: 350px;
  }

  .artist-name {
    font-size: 1.75rem;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
  }

  .content-section {
    padding: 1.5rem 1rem;
  }
}
</style>
