<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import type { Song } from '@/stores/music'
import { Play, Heart, MoreHorizontal } from 'lucide-vue-next'

const router = useRouter()
const musicStore = useMusicStore()

// 用户信息
const userInfo = ref({
  name: 'Kiki',
  avatar: 'https://picsum.photos/60/60?random=100',
  greeting: '戴上耳机好好听',
  subGreeting: '今日榜单上歌曲的准备吧！',
})

// 最近播放的歌曲
const recentSongs = ref<Song[]>([
  {
    id: '1',
    title: 'Dawn of us',
    artist: '王嘉尔',
    album: 'Dawn of us',
    duration: 210,
    coverUrl: 'https://picsum.photos/300/300?random=20',
    audioUrl: '/demo-audio1.mp3',
  },
  {
    id: '2',
    title: 'Eyes Closed',
    artist: 'Halsey',
    album: 'Eyes Closed',
    duration: 195,
    coverUrl: 'https://picsum.photos/300/300?random=21',
    audioUrl: '/demo-audio2.mp3',
  },
])

// 排行榜类型
const chartTypes = ref([
  {
    id: 'new',
    title: '新歌榜',
    subtitle: '每小时更新',
    coverUrl: 'https://picsum.photos/300/300?random=30',
  },
  {
    id: 'hot',
    title: '热歌榜',
    subtitle: '每周更新',
    coverUrl: 'https://picsum.photos/300/300?random=31',
  },
  {
    id: 'mv',
    title: 'MV榜',
    subtitle: '每日更新',
    coverUrl: 'https://picsum.photos/300/300?random=32',
  },
])

const playSong = (song: Song) => {
  musicStore.setCurrentSong(song)
  musicStore.addToPlaylist(song)
  musicStore.play()
  router.push('/player')
}

const goToChart = (chartId: string) => {
  router.push(`/chart/${chartId}`)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=104'
}

onMounted(() => {
  // 初始化默认播放列表（如果还没有歌曲的话）
  if (!musicStore.currentSong) {
    musicStore.initializeDefaultPlaylist()
    if (musicStore.playlist.length > 0) {
      // 设置当前歌曲为第一首默认歌曲，但不自动播放
      musicStore.setCurrentSong(musicStore.playlist[0])
    }
  }

  // 如果用户还没有播放列表，则设置推荐歌曲
  if (musicStore.playlist.length === 0) {
    musicStore.setPlaylist(recentSongs.value)
  }
})
</script>

<template>
  <div class="home-view">
    <!-- 头部用户信息区域 -->
    <div class="header-section">
      <div class="user-info">
        <div class="user-text">
          <h1>欢迎回来，{{ userInfo.name }}</h1>
          <p>{{ userInfo.greeting }}</p>
          <p>{{ userInfo.subGreeting }}</p>
        </div>
        <div class="user-avatar">
          <img :src="userInfo.avatar" :alt="userInfo.name" @error="handleImageError" />
        </div>
      </div>
    </div>

    <!-- 最近播放 -->
    <div class="section">
      <h2>最近播放</h2>
      <div class="recent-songs">
        <div v-for="song in recentSongs" :key="song.id" class="recent-card" @click="playSong(song)">
          <img
            :src="song.coverUrl || 'https://picsum.photos/300/300?random=105'"
            :alt="song.title"
            @error="handleImageError"
            class="recent-background"
          />
          <div class="recent-overlay"></div>
          <div class="recent-content">
            <div class="recent-info">
              <h3 class="recent-title">{{ song.title }}</h3>
              <p class="recent-artist">{{ song.artist }}</p>
            </div>
            <div class="play-button">
              <Play :size="24" fill="white" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 流行趋势 -->
    <div class="section">
      <div class="section-header">
        <h2>流行趋势</h2>
      </div>
      <div class="charts-grid">
        <div
          v-for="chart in chartTypes"
          :key="chart.id"
          class="chart-card"
          @click="goToChart(chart.id)"
        >
          <div class="chart-cover">
            <img :src="chart.coverUrl" :alt="chart.title" @error="handleImageError" />
          </div>
          <div class="chart-info">
            <h3 class="chart-title">{{ chart.title }}</h3>
            <p class="chart-subtitle">{{ chart.subtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding: 1.5rem;
  padding-bottom: 100px; /* 为底部导航留空间 */
}

.header-section {
  padding: 2rem 0 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-sizing: border-box;
}

.user-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.user-text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* 最近播放样式 */
.recent-songs {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.recent-songs::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.recent-card {
  flex: 0 0 auto;
  width: 280px;
  height: 160px;
  border-radius: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.recent-card:hover {
  transform: scale(1.02);
}

.recent-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.recent-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 2;
}

.recent-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 3;
}

.recent-info {
  color: white;
}

.recent-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.recent-artist {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.play-button {
  align-self: flex-end;
  width: 48px;
  height: 48px;
  background: #007aff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
  transition: all 0.2s ease;
}

.recent-card:hover .play-button {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.5);
}

/* 排行榜样式 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-tap-highlight-color: transparent;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.chart-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.chart-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chart-info {
  text-align: center;
}

.chart-title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: white;
}

.chart-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home-view {
    padding: 1.5rem;
    padding-bottom: 100px; 
  }

  .user-text h1 {
    font-size: 2rem;
  }

  .recent-card {
    width: 240px;
    height: 140px;
  }

  .play-button {
    width: 40px;
    height: 40px;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .user-info {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 80px;
    height: 80px;
  }

  .recent-card {
    width: 200px;
    height: 120px;
  }

  .recent-title {
    font-size: 1rem;
  }

  .recent-artist {
    font-size: 0.8125rem;
  }

  .play-button {
    width: 36px;
    height: 36px;
  }

  .charts-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}
</style>
