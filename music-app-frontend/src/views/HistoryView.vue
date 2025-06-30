<template>
  <div class="history-view">
    <!-- 顶部导航 -->
    <TopNavigation title="播放历史" :icon="Clock">
      <template #actions>
        <NavTextButton v-if="historyList.length > 0" type="danger" @click="showClearConfirm = true">
          <Trash2 :size="16" />
          清空历史
        </NavTextButton>
      </template>
    </TopNavigation>

    <!-- 搜索栏 -->
    <div v-if="historyList.length > 0" class="search-section">
      <div class="search-input-wrapper">
        <Search :size="20" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索播放历史..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
          <X :size="16" />
        </button>
      </div>
    </div>

    <!-- 历史列表 -->
    <div class="history-content">
      <!-- 空状态 -->
      <div v-if="filteredHistory.length === 0 && !searchQuery" class="empty-state">
        <Clock :size="64" />
        <h3>暂无播放历史</h3>
        <p>开始播放音乐，这里会显示你的播放记录</p>
      </div>

      <!-- 搜索无结果 -->
      <div v-else-if="filteredHistory.length === 0 && searchQuery" class="empty-state">
        <Search :size="64" />
        <h3>未找到相关记录</h3>
        <p>尝试使用其他关键词搜索</p>
      </div>

      <!-- 历史记录列表 -->
      <div v-else class="history-list">
        <!-- 分组显示 -->
        <div v-for="group in groupedHistory" :key="group.date" class="history-group">
          <h3 class="group-title">{{ group.title }}</h3>
          <div class="song-list">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="song-item"
              @click="playSong(item.song)"
            >
              <div class="song-cover">
                <img :src="item.song.coverUrl" :alt="item.song.title" @error="handleImageError" />
                <div class="play-overlay">
                  <Play :size="20" />
                </div>
              </div>

              <div class="song-info">
                <h4 class="song-title">{{ item.song.title }}</h4>
                <p class="song-artist">{{ item.song.artist }}</p>
                <div class="play-info">
                  <span class="play-time">{{ formatPlayTime(item.playedAt) }}</span>
                  <span class="play-duration">播放 {{ formatDuration(item.playDuration) }}</span>
                </div>
              </div>

              <button class="remove-button" @click.stop="removeHistoryItem(item.id)">
                <X :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div v-if="showClearConfirm" class="modal-overlay" @click="showClearConfirm = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">清空播放历史</h3>
        <p class="modal-message">确定要清空所有播放历史记录吗？此操作无法撤销。</p>
        <div class="modal-actions">
          <button class="cancel-button" @click="showClearConfirm = false">取消</button>
          <button class="confirm-button" @click="clearAllHistory">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicStore } from '@/stores/music'
import type { PlayHistoryItem, Song } from '@/stores/music'
import { Clock, Search, X, Trash2, Play } from 'lucide-vue-next'
import TopNavigation from '@/components/TopNavigation.vue'
import NavTextButton from '@/components/NavTextButton.vue'

const router = useRouter()
const musicStore = useMusicStore()

// 页面状态
const searchQuery = ref('')
const showClearConfirm = ref(false)

// 获取播放历史
const historyList = computed(() => musicStore.playHistory)

// 搜索过滤
const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) {
    return historyList.value
  }

  const query = searchQuery.value.toLowerCase()
  return historyList.value.filter(
    item =>
      item.song.title.toLowerCase().includes(query) ||
      item.song.artist.toLowerCase().includes(query) ||
      item.song.album.toLowerCase().includes(query)
  )
})

// 按日期分组
const groupedHistory = computed(() => {
  const groups: { [key: string]: PlayHistoryItem[] } = {}

  filteredHistory.value.forEach(item => {
    const date = new Date(item.playedAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey: string
    if (isSameDay(date, today)) {
      groupKey = 'today'
    } else if (isSameDay(date, yesterday)) {
      groupKey = 'yesterday'
    } else {
      groupKey = formatDate(date)
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
  })

  // 转换为数组并排序
  return Object.entries(groups)
    .map(([date, items]) => ({
      date,
      title: getGroupTitle(date),
      items: items.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()),
    }))
    .sort((a, b) => {
      if (a.date === 'today') return -1
      if (b.date === 'today') return 1
      if (a.date === 'yesterday') return -1
      if (b.date === 'yesterday') return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
})

// 工具函数
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getGroupTitle(dateKey: string): string {
  if (dateKey === 'today') return '今天'
  if (dateKey === 'yesterday') return '昨天'

  const date = new Date(dateKey)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    })
  }
}

function formatPlayTime(playedAt: string): string {
  const date = new Date(playedAt)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins}分${secs}秒`
  }
  return `${secs}秒`
}

// 事件处理
function clearSearch() {
  searchQuery.value = ''
}

function playSong(song: Song) {
  musicStore.setCurrentSong(song)
  musicStore.play()
}

function removeHistoryItem(historyId: string) {
  musicStore.removeFromPlayHistory(historyId)
}

function clearAllHistory() {
  musicStore.clearPlayHistory()
  showClearConfirm.value = false
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=' + Math.floor(Math.random() * 1000)
}

onMounted(() => {
  // 确保播放历史已加载
  musicStore.initializePlayHistory()
})
</script>

<style scoped>
.history-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: calc(140px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
}

.search-section {
  padding: 0 1rem 1rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.history-content {
  padding: 0 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.history-group {
  margin-bottom: 2rem;
}

.group-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  padding: 0 0.5rem;
}

.song-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
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

.song-item:hover .play-overlay {
  opacity: 1;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-info {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.remove-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.remove-button:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-align: center;
}

.modal-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 2rem 0;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.cancel-button {
  flex: 1;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.confirm-button {
  flex: 1;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #ff4757, #ff3742);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-button:hover {
  background: linear-gradient(135deg, #ff3742, #ff2837);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column;
  }

  .play-info {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
