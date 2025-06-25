<template>
  <div class="playlist-view">
    <div class="header">
      <h1>歌单</h1>
      <button @click="showCreateModal = true" class="create-btn">
        <Plus :size="20" />
        创建歌单
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-bar">
        <Search :size="20" class="search-icon" />
        <input type="text" v-model="searchQuery" placeholder="搜索歌单..." class="search-input" />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
          <X :size="16" />
        </button>
      </div>
    </div>

    <div class="content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else>
        <!-- 我的歌单 -->
        <div class="section" v-if="authStore.isAuthenticated">
          <h2>我的歌单</h2>
          <div v-if="filteredMyPlaylists.length > 0" class="playlist-grid">
            <div
              v-for="playlist in filteredMyPlaylists"
              :key="playlist.id"
              class="playlist-item"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img
                  :src="playlist.coverUrl || 'https://picsum.photos/300/300?random=118'"
                  :alt="playlist.name"
                  @error="handleImageError"
                />
                <div class="playlist-overlay">
                  <Play :size="24" />
                </div>
              </div>
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-info">{{ playlist.songCount }}首歌曲</p>
            </div>
          </div>
          <div v-else class="empty-playlists">
            <p>正在为您创建默认歌单...</p>
          </div>
        </div>

        <!-- 推荐歌单 -->
        <div class="section">
          <h2>推荐歌单</h2>
          <div v-if="filteredRecommendedPlaylists.length > 0" class="playlist-grid">
            <div
              v-for="playlist in filteredRecommendedPlaylists"
              :key="playlist.id"
              class="playlist-item"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <img
                  :src="playlist.coverUrl || 'https://picsum.photos/300/300?random=119'"
                  :alt="playlist.name"
                  @error="handleImageError"
                />
                <div class="playlist-overlay">
                  <Play :size="24" />
                </div>
              </div>
              <h3 class="playlist-name">{{ playlist.name }}</h3>
              <p class="playlist-info">by {{ playlist.creator }}</p>
            </div>
          </div>
          <div v-else class="empty-playlists">
            <p>暂无推荐歌单</p>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!authStore.isAuthenticated" class="empty-state">
          <h3>请先登录</h3>
          <p>登录后可以查看和创建您的歌单</p>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div
        v-if="
          searchQuery &&
          filteredMyPlaylists.length === 0 &&
          filteredRecommendedPlaylists.length === 0
        "
        class="no-results"
      >
        <div class="no-results-icon">
          <Search :size="48" />
        </div>
        <h3>未找到相关歌单</h3>
        <p>尝试使用其他关键词搜索</p>
      </div>
    </div>

    <!-- 创建歌单模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <!-- 模态框头部 -->
        <div class="modal-header">
          <h3>创建新歌单</h3>
          <button @click="showCreateModal = false" class="close-btn">
            <X :size="20" />
          </button>
        </div>

        <!-- 歌单封面选择 -->
        <div class="cover-section">
          <div class="cover-preview">
            <img
              :src="selectedCover || 'https://picsum.photos/300/300?random=200'"
              alt="歌单封面"
              class="cover-image"
            />
            <div class="cover-overlay">
              <Camera :size="24" />
              <span>选择封面</span>
            </div>
          </div>
          <div class="cover-options">
            <button
              v-for="cover in coverOptions"
              :key="cover.id"
              @click="selectedCover = cover.url"
              class="cover-option"
              :class="{ active: selectedCover === cover.url }"
            >
              <img :src="cover.url" :alt="`封面 ${cover.id}`" />
            </button>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="form-section">
          <div class="form-group">
            <label>歌单名称</label>
            <input
              type="text"
              v-model="newPlaylistName"
              placeholder="给你的歌单起个好听的名字"
              @keyup.enter="createPlaylist"
              class="playlist-name-input"
              maxlength="50"
            />
            <div class="input-counter">{{ newPlaylistName.length }}/50</div>
          </div>

          <div class="form-group">
            <label>歌单描述 <span class="optional">(可选)</span></label>
            <textarea
              v-model="newPlaylistDescription"
              placeholder="介绍一下这个歌单的特色..."
              class="playlist-description-input"
              maxlength="200"
              rows="3"
            ></textarea>
            <div class="input-counter">{{ newPlaylistDescription.length }}/200</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">设为私密歌单</span>
            </label>
            <div class="checkbox-desc">
              <input type="checkbox" v-model="isPrivate" class="checkbox-input" />
              <span>私密歌单只有你可以看到</span>
            </div>
          </div>
        </div>

        <!-- 模态框底部 -->
        <div class="modal-footer">
          <button @click="showCreateModal = false" class="cancel-btn">取消</button>
          <button
            @click="createPlaylist"
            class="confirm-btn"
            :disabled="!newPlaylistName.trim() || isCreating"
          >
            {{ isCreating ? '创建中...' : '创建歌单' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { playlistApi } from '@/services/playlist-api'
import { Plus, Play, Search, X, Camera } from 'lucide-vue-next'

interface Playlist {
  id: string
  name: string
  coverUrl: string
  songCount?: number
  creator?: string
}

const router = useRouter()
const authStore = useAuthStore()
const showCreateModal = ref(false)
const newPlaylistName = ref('')
const newPlaylistDescription = ref('')
const isPrivate = ref(false)
const selectedCover = ref('')
const searchQuery = ref('')

// 加载状态
const isLoading = ref(false)
const isCreating = ref(false)

// 封面选项
const coverOptions = ref([
  { id: 1, url: 'https://picsum.photos/300/300?random=201' },
  { id: 2, url: 'https://picsum.photos/300/300?random=202' },
  { id: 3, url: 'https://picsum.photos/300/300?random=203' },
  { id: 4, url: 'https://picsum.photos/300/300?random=204' },
  { id: 5, url: 'https://picsum.photos/300/300?random=205' },
  { id: 6, url: 'https://picsum.photos/300/300?random=206' },
])

// 播放列表数据
const myPlaylists = ref<Playlist[]>([])
const recommendedPlaylists = ref<Playlist[]>([])

// 打开歌单详情页
const openPlaylist = (playlist: Playlist) => {
  router.push(`/playlist/${playlist.id}`)
}

// 加载我的播放列表
const loadMyPlaylists = async () => {
  if (!authStore.isAuthenticated) {
    myPlaylists.value = []
    return
  }

  try {
    isLoading.value = true
    const playlists = await playlistApi.getMyPlaylists()
    myPlaylists.value = playlists.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      coverUrl: playlist.coverUrl || 'https://picsum.photos/300/300?random=120',
      songCount: playlist.songCount || 0,
    }))
  } catch (error) {
    console.error('Failed to load my playlists:', error)
    myPlaylists.value = []
  } finally {
    isLoading.value = false
  }
}

// 加载推荐播放列表
const loadRecommendedPlaylists = async () => {
  try {
    isLoading.value = true
    const playlists = await playlistApi.getRecommendedPlaylists(9)
    recommendedPlaylists.value = playlists.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      coverUrl: playlist.coverUrl || 'https://picsum.photos/300/300?random=122',
      creator: playlist.user?.username || playlist.creator?.name || '未知用户',
    }))
  } catch (error) {
    console.error('Failed to load recommended playlists:', error)
    recommendedPlaylists.value = []
  } finally {
    isLoading.value = false
  }
}

// 搜索过滤计算属性
const filteredMyPlaylists = computed(() => {
  if (!searchQuery.value.trim()) {
    return myPlaylists.value
  }
  return myPlaylists.value.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredRecommendedPlaylists = computed(() => {
  if (!searchQuery.value.trim()) {
    return recommendedPlaylists.value
  }
  return recommendedPlaylists.value.filter(
    playlist =>
      playlist.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (playlist.creator && playlist.creator.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const createPlaylist = async () => {
  if (!newPlaylistName.value.trim() || !authStore.isAuthenticated) {
    return
  }

  try {
    isCreating.value = true
    const playlistData = {
      name: newPlaylistName.value.trim(),
      description: newPlaylistDescription.value.trim(),
      coverUrl: selectedCover.value || 'https://picsum.photos/300/300?random=200',
      isPrivate: isPrivate.value,
    }

    const newPlaylist = await playlistApi.createPlaylist(playlistData)

    // 添加到我的播放列表
    myPlaylists.value.unshift({
      id: newPlaylist.id,
      name: newPlaylist.name,
      coverUrl: newPlaylist.coverUrl,
      songCount: 0,
    })

    // 重置表单
    newPlaylistName.value = ''
    newPlaylistDescription.value = ''
    isPrivate.value = false
    selectedCover.value = ''
    showCreateModal.value = false
  } catch (error) {
    console.error('Failed to create playlist:', error)
    // 这里可以添加错误提示
  } finally {
    isCreating.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://picsum.photos/300/300?random=127'
}

onMounted(() => {
  loadMyPlaylists()
  loadRecommendedPlaylists()
})
</script>

<style scoped>
.playlist-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding-bottom: 100px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.create-btn {
  background: #007aff;
  border: none;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.search-section {
  padding: 0 1rem 1rem;
  background: rgba(0, 0, 0, 0.1);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 0.75rem 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
  padding: 0;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.clear-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.content {
  padding: 1rem;
}

.section {
  margin-bottom: 2rem;
}

.section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.playlist-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-item:hover {
  transform: scale(1.05);
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
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

.playlist-item:hover .playlist-overlay {
  opacity: 1;
}

.playlist-name {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.playlist-info {
  font-size: 0.875rem;
  opacity: 0.7;
  margin: 0;
}

.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.no-results-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: white;
}

.no-results p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
}

.empty-playlists {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: white;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.8;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: linear-gradient(145deg, #2a2a3e 0%, #1e1e2e 100%);
  border-radius: 1.5rem;
  width: 90%;
  max-width: 500px;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem 0;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.cover-section {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.cover-preview {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cover-preview:hover {
  transform: scale(1.02);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.cover-options {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.cover-options::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.cover-option {
  width: 50px;
  height: 50px;
  border-radius: 0.625rem;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  padding: 0;
  flex-shrink: 0; /* 防止在flex容器中收缩 */
}

.cover-option:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.3);
}

.cover-option.active {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.3);
}

.cover-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-section {
  padding: 0 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: white;
}

.optional {
  font-weight: 400;
  opacity: 0.7;
  font-size: 0.8125rem;
}

.playlist-name-input,
.playlist-description-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 1rem;
  color: white;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: none;
}

.playlist-name-input:focus,
.playlist-description-input:focus {
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.playlist-name-input::placeholder,
.playlist-description-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-counter {
  text-align: right;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkbox-custom {
  background: #007aff;
  border-color: #007aff;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: white;
}

.checkbox-desc {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  margin-left: 2.75rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.875rem 1.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 100px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.cancel-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

.cancel-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.confirm-btn {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.confirm-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.confirm-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

/* 移动端按钮优化 */
@media (hover: none) {
  .cancel-btn:active {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .cancel-btn:focus {
    outline: none;
    box-shadow: none;
  }

  .confirm-btn:active:not(:disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .confirm-btn:focus {
    outline: none;
    box-shadow: none;
  }
}

.confirm-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .create-btn {
    justify-content: center;
  }

  .search-section {
    padding: 0 0.75rem 1rem;
  }

  .search-bar {
    padding: 0.625rem 0.875rem;
  }

  .search-input {
    font-size: 0.9375rem;
  }

  .no-results {
    padding: 2rem 1rem;
  }

  .no-results h3 {
    font-size: 1.125rem;
  }

  /* 模态框响应式 */
  .modal-content {
    width: 95%;
  }

  .modal-header {
    padding: 1rem 1rem 0;
  }

  .modal-header h3 {
    font-size: 1.25rem;
  }

  .cover-section {
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  .cover-preview {
    width: 80px;
    height: 80px;
  }

  .cover-options {
    gap: 0.5rem;
  }

  .cover-option {
    width: 40px;
    height: 40px;
  }

  .form-section {
    padding: 0 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
    padding: 1rem;
  }
}
</style>
