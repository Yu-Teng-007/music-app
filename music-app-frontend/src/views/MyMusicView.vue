<template>
  <div class="my-music-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>我的音乐</h1>
        <p>管理你上传的音乐作品</p>
      </div>
      <div class="header-actions">
        <button @click="$router.push('/upload-music')" class="btn-primary">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          上传音乐
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"
            ></polygon>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ totalSongs }}</h3>
          <p>总歌曲数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ totalPlays }}</h3>
          <p>总播放量</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ totalLikes }}</h3>
          <p>总收藏数</p>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="search-box">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="搜索歌曲..." @input="handleSearch" />
      </div>

      <div class="filter-controls">
        <select v-model="sortBy" @change="handleSort">
          <option value="createdAt">按上传时间</option>
          <option value="title">按歌曲名称</option>
          <option value="playCount">按播放量</option>
          <option value="likes">按收藏数</option>
        </select>

        <button @click="toggleSortOrder" class="sort-btn" :class="{ active: sortOrder === 'desc' }">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18M7 12h10m-7 6h4"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="songs-section">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredSongs.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          >
            <polygon
              points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"
            ></polygon>
          </svg>
        </div>
        <h3>{{ searchQuery ? '没有找到相关歌曲' : '还没有上传任何音乐' }}</h3>
        <p>{{ searchQuery ? '尝试使用其他关键词搜索' : '点击上方按钮开始上传你的音乐作品' }}</p>
        <button v-if="!searchQuery" @click="$router.push('/upload-music')" class="btn-primary">
          立即上传
        </button>
      </div>

      <div v-else class="songs-list">
        <div v-for="song in paginatedSongs" :key="song.id" class="song-item">
          <!-- 歌曲封面 -->
          <div class="song-cover">
            <img
              :src="song.coverUrl || '/default-cover.jpg'"
              :alt="song.title"
              @error="handleImageError"
            />
            <div class="play-overlay">
              <button @click="playSong(song)" class="play-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
              </button>
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="song-info">
            <h4>{{ song.title }}</h4>
            <p class="artist">{{ song.artist }}</p>
            <p class="album" v-if="song.album">{{ song.album }}</p>
            <div class="song-meta">
              <span class="upload-date">{{ formatDate(song.createdAt) }}</span>
              <span class="separator">•</span>
              <span class="plays">{{ song.playCount || 0 }} 播放</span>
              <span class="separator">•</span>
              <span class="likes">{{ (song as any).likes || 0 }} 收藏</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="song-actions">
            <button @click="editSong(song)" class="action-btn" title="编辑">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>

            <button @click="shareSong(song)" class="action-btn" title="分享">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>

            <button @click="deleteSong(song)" class="action-btn delete" title="删除">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3,6 5,6 21,6"></polyline>
                <path
                  d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
                ></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
          上一页
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="page-btn"
            :class="{ active: page === currentPage }"
          >
            {{ page }}
          </button>
        </div>

        <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
          下一页
        </button>
      </div>
    </div>

    <!-- 编辑歌曲对话框 -->
    <EditSongDialog
      v-if="editingSong"
      :song="editingSong"
      @close="editingSong = null"
      @updated="handleSongUpdated"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-if="deletingSong"
      title="删除歌曲"
      :message="`确定要删除歌曲《${deletingSong.title}》吗？此操作不可撤销。`"
      @confirm="confirmDelete"
      @cancel="deletingSong = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ConfirmDialog } from '@/components/ui'
import { musicApi } from '@/services/music-api'
import type { Song } from '@/types'

// 组件引入（需要创建）
// import EditSongDialog from '@/components/music/EditSongDialog.vue'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(true)
const songs = ref<Song[]>([])
const searchQuery = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)

// 统计数据
const stats = ref({
  totalSongs: 0,
  totalPlays: 0,
  totalLikes: 0,
})

// 编辑和删除状态
const editingSong = ref<Song | null>(null)
const deletingSong = ref<Song | null>(null)

// 统计数据计算属性
const totalSongs = computed(() => stats.value.totalSongs)
const totalPlays = computed(() => stats.value.totalPlays)
const totalLikes = computed(() => stats.value.totalLikes)

// 筛选和排序现在由后端处理，直接返回歌曲列表
const filteredSongs = computed(() => songs.value)

// 分页（现在由后端处理）
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// 直接使用从API获取的歌曲数据，不需要前端分页
const paginatedSongs = computed(() => songs.value)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// 方法
const loadSongs = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value.toUpperCase() as 'ASC' | 'DESC',
    }

    const result = await musicApi.getMySongs(params)
    songs.value = result.data
    totalCount.value = result.pagination.total
  } catch (error) {
    console.error('加载歌曲失败:', error)
    // 可以添加错误提示
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const result = await musicApi.getMyStats()
    stats.value = result
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  // loadSongs() 会通过 watch 自动调用
}

const handleSort = () => {
  currentPage.value = 1
  // loadSongs() 会通过 watch 自动调用
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  currentPage.value = 1
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-cover.jpg'
}

const playSong = (song: Song) => {
  // TODO: 播放歌曲
  console.log('播放歌曲:', song.title)
}

const editSong = (song: Song) => {
  editingSong.value = song
}

const shareSong = (song: Song) => {
  // TODO: 分享歌曲
  console.log('分享歌曲:', song.title)
}

const deleteSong = (song: Song) => {
  deletingSong.value = song
}

const confirmDelete = async () => {
  if (!deletingSong.value) return

  try {
    await musicApi.deleteSong(deletingSong.value.id)
    deletingSong.value = null

    // 重新加载数据
    await loadSongs()
    await loadStats()

    // 如果当前页没有数据且不是第一页，回到上一页
    if (songs.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
      await loadSongs()
    }
  } catch (error) {
    console.error('删除歌曲失败:', error)
    // 可以添加错误提示
  }
}

const handleSongUpdated = async () => {
  editingSong.value = null
  // 重新加载数据以确保数据一致性
  await loadSongs()
}

// 监听搜索、排序、分页变化
watch(
  [searchQuery, sortBy, sortOrder, currentPage],
  () => {
    loadSongs()
  },
  { deep: true }
)

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([loadSongs(), loadStats()])
})
</script>

<style scoped>
.my-music-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.header-content p {
  color: #666;
  font-size: 1rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-content p {
  color: #666;
  font-size: 0.875rem;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-controls select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.sort-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover,
.sort-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.songs-list {
  display: grid;
  gap: 16px;
}

.song-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.song-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.song-cover {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
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

.song-cover:hover .play-overlay {
  opacity: 1;
}

.play-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.1);
}

.song-info {
  flex: 1;
}

.song-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.song-info .artist {
  color: #666;
  font-size: 1rem;
  margin-bottom: 2px;
}

.song-info .album {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.song-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #9ca3af;
}

.separator {
  color: #d1d5db;
}

.song-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
}

.page-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

@media (max-width: 768px) {
  .my-music-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .song-item {
    flex-direction: column;
    text-align: center;
  }

  .song-info {
    text-align: center;
  }

  .song-meta {
    justify-content: center;
  }
}
</style>
