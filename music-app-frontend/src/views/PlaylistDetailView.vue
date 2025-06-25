<template>
  <div class="playlist-detail-view">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <AlertCircle :size="48" />
      <h3>{{ error }}</h3>
      <button @click="goBack" class="back-btn">返回</button>
    </div>

    <div v-else class="content">
      <!-- 歌单头部信息 -->
      <div class="playlist-header">
        <div class="playlist-cover">
          <img 
            :src="playlist?.coverUrl || 'https://picsum.photos/300/300?random=120'" 
            :alt="playlist?.name" 
            @error="handleImageError"
          />
        </div>
        <div class="playlist-info">
          <div class="playlist-type">歌单</div>
          <h1 class="playlist-name">{{ playlist?.name }}</h1>
          <div class="playlist-meta">
            <div class="playlist-creator">
              <span>创建者: {{ playlist?.creator || '未知用户' }}</span>
            </div>
            <div class="playlist-stats">
              <span>{{ playlist?.songCount || 0 }}首歌曲</span>
              <span>{{ formatDate(playlist?.createdAt) }}</span>
            </div>
          </div>
          <p v-if="playlist?.description" class="playlist-description">{{ playlist?.description }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button @click="playAll" class="play-btn">
          <Play :size="18" />
          播放全部
        </button>
        <button 
          v-if="isOwner" 
          @click="showEditModal = true" 
          class="edit-btn"
        >
          <Edit :size="16" />
          编辑歌单
        </button>
        <button 
          v-if="!isOwner" 
          @click="toggleFavorite" 
          class="favorite-btn"
          :class="{ active: isFavorite }"
        >
          <Heart :size="16" :fill="isFavorite ? 'currentColor' : 'none'" />
          {{ isFavorite ? '已收藏' : '收藏' }}
        </button>
        <button @click="showShareOptions = true" class="share-btn">
          <Share :size="16" />
          分享
        </button>
      </div>

      <!-- 歌曲列表 -->
      <div class="songs-container">
        <div class="songs-header">
          <div class="song-index">#</div>
          <div class="song-info">歌曲</div>
          <div class="song-artist">歌手</div>
          <div class="song-album">专辑</div>
          <div class="song-duration">时长</div>
          <div class="song-actions"></div>
        </div>

        <div v-if="playlist?.songs && playlist.songs.length > 0" class="songs-list">
          <div 
            v-for="(song, index) in playlist.songs" 
            :key="song.id" 
            class="song-item"
            :class="{ active: currentSongId === song.id }"
            @dblclick="playSong(song, index)"
          >
            <div class="song-index">{{ index + 1 }}</div>
            <div class="song-info">
              <img 
                :src="song.coverUrl || 'https://picsum.photos/50/50?random=121'" 
                :alt="song.title" 
                class="song-cover"
                @error="handleImageError"
              />
              <div class="song-title-wrapper">
                <div class="song-title">{{ song.title }}</div>
                <div v-if="song.features" class="song-features">feat. {{ song.features }}</div>
              </div>
            </div>
            <div class="song-artist">{{ song.artist }}</div>
            <div class="song-album">{{ song.album }}</div>
            <div class="song-duration">{{ formatDuration(song.duration) }}</div>
            <div class="song-actions">
              <button @click="playSong(song, index)" class="action-btn">
                <Play :size="16" />
              </button>
              <button @click="showSongOptions(song)" class="action-btn">
                <MoreHorizontal :size="16" />
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-songs">
          <Music :size="48" />
          <p>这个歌单还没有歌曲</p>
          <button v-if="isOwner" @click="showAddSongsModal = true" class="add-songs-btn">
            <Plus :size="16" />
            添加歌曲
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑歌单模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑歌单</h3>
          <button @click="showEditModal = false" class="close-btn">
            <X :size="20" />
          </button>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label>歌单名称</label>
            <input
              type="text"
              v-model="editForm.name"
              placeholder="歌单名称"
              class="input-field"
              maxlength="50"
            />
            <div class="input-counter">{{ editForm.name.length }}/50</div>
          </div>

          <div class="form-group">
            <label>歌单描述 <span class="optional">(可选)</span></label>
            <textarea
              v-model="editForm.description"
              placeholder="介绍一下这个歌单的特色..."
              class="textarea-field"
              maxlength="200"
              rows="3"
            ></textarea>
            <div class="input-counter">{{ editForm.description.length }}/200</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="editForm.isPrivate" class="checkbox-input" />
              <span class="checkbox-text">设为私密歌单</span>
              <span class="checkbox-desc">私密歌单只有你可以看到</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showEditModal = false" class="cancel-btn">取消</button>
          <button
            @click="updatePlaylist"
            class="confirm-btn"
            :disabled="!editForm.name.trim() || isUpdating"
          >
            {{ isUpdating ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分享选项模态框 -->
    <div v-if="showShareOptions" class="modal-overlay" @click="showShareOptions = false">
      <div class="modal-content share-modal" @click.stop>
        <div class="modal-header">
          <h3>分享歌单</h3>
          <button @click="showShareOptions = false" class="close-btn">
            <X :size="20" />
          </button>
        </div>

        <div class="share-options">
          <button class="share-option">
            <MessageSquare :size="24" />
            <span>微信</span>
          </button>
          <button class="share-option">
            <Send :size="24" />
            <span>微博</span>
          </button>
          <button class="share-option">
            <Link :size="24" />
            <span>复制链接</span>
          </button>
          <button class="share-option">
            <QrCode :size="24" />
            <span>二维码</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { playlistApi } from '@/services/playlist-api'
import { 
  Play, 
  Edit, 
  Heart, 
  Share, 
  Music, 
  Plus, 
  X, 
  MoreHorizontal, 
  AlertCircle,
  MessageSquare,
  Send,
  Link,
  QrCode
} from 'lucide-vue-next'

// 路由和认证信息
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 状态变量
const isLoading = ref(true)
const error = ref('')
const playlist = ref<any>(null)
const currentSongId = ref('')
const isFavorite = ref(false)
const showEditModal = ref(false)
const showShareOptions = ref(false)
const showAddSongsModal = ref(false)
const isUpdating = ref(false)

// 编辑表单
const editForm = ref({
  name: '',
  description: '',
  isPrivate: false
})

// 计算属性
const isOwner = computed(() => {
  return authStore.isAuthenticated && 
    playlist.value?.userId === authStore.user?.id
})

// 加载歌单详情
const loadPlaylistDetail = async () => {
  const playlistId = route.params.id as string
  if (!playlistId) {
    error.value = '歌单ID不存在'
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    const data = await playlistApi.getPlaylist(playlistId)
    playlist.value = data
    
    // 初始化编辑表单
    if (data) {
      editForm.value.name = data.name || ''
      editForm.value.description = data.description || ''
      editForm.value.isPrivate = data.isPrivate || false
    }
  } catch (err: any) {
    console.error('加载歌单详情失败:', err)
    error.value = err.message || '加载歌单详情失败'
  } finally {
    isLoading.value = false
  }
}

// 播放全部歌曲
const playAll = () => {
  if (!playlist.value?.songs || playlist.value.songs.length === 0) {
    return
  }
  
  // 这里应该调用播放器的播放队列功能
  console.log('播放全部歌曲', playlist.value.songs)
  
  // 播放第一首歌曲
  playSong(playlist.value.songs[0], 0)
}

// 播放单首歌曲
const playSong = (song: any, index: number) => {
  if (!song) return
  
  currentSongId.value = song.id
  
  // 这里应该调用播放器的播放功能
  console.log('播放歌曲', song, '索引:', index)
}

// 切换收藏状态
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  // 这里应该调用收藏API
  console.log(isFavorite.value ? '收藏歌单' : '取消收藏歌单', playlist.value?.id)
}

// 更新歌单信息
const updatePlaylist = async () => {
  if (!playlist.value?.id || !editForm.value.name.trim()) return
  
  try {
    isUpdating.value = true
    await playlistApi.updatePlaylist(playlist.value.id, {
      name: editForm.value.name,
      description: editForm.value.description,
      isPrivate: editForm.value.isPrivate
    })
    
    // 更新本地数据
    playlist.value.name = editForm.value.name
    playlist.value.description = editForm.value.description
    playlist.value.isPrivate = editForm.value.isPrivate
    
    showEditModal.value = false
  } catch (err: any) {
    console.error('更新歌单失败:', err)
    // 这里可以添加错误提示
  } finally {
    isUpdating.value = false
  }
}

// 显示歌曲操作菜单
const showSongOptions = (song: any) => {
  console.log('显示歌曲操作菜单', song)
  // 这里可以实现歌曲操作菜单
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://picsum.photos/300/300?random=404'
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 格式化时长
const formatDuration = (seconds?: number) => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 生命周期钩子
onMounted(() => {
  loadPlaylistDetail()
})
</script>

<style scoped>
.playlist-detail-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--color-primary);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 歌单头部样式 */
.playlist-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-type {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.playlist-name {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 12px;
}

.playlist-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.playlist-creator {
  font-size: 14px;
}

.playlist-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.playlist-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-buttons button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn {
  background-color: var(--color-primary);
  color: white;
}

.edit-btn,
.favorite-btn,
.share-btn {
  background-color: rgba(0, 0, 0, 0.05);
}

.favorite-btn.active {
  color: var(--color-primary);
}

/* 歌曲列表样式 */
.songs-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.songs-header {
  display: grid;
  grid-template-columns: 50px 3fr 2fr 2fr 100px 80px;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.song-item {
  display: grid;
  grid-template-columns: 50px 3fr 2fr 2fr 100px 80px;
  padding: 12px 16px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}

.song-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.song-item.active {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-title-wrapper {
  display: flex;
  flex-direction: column;
}

.song-title {
  font-weight: 500;
}

.song-features {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.song-artist,
.song-album {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

/* 空状态样式 */
.empty-songs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--color-text-secondary);
}

.empty-songs p {
  margin: 16px 0;
}

.add-songs-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.form-section {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 14px;
}

.input-counter {
  text-align: right;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  padding: 8px 16px;
  background: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn {
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 分享模态框样式 */
.share-modal {
  max-width: 400px;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.share-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .playlist-cover {
    width: 150px;
    height: 150px;
  }
  
  .songs-header,
  .song-item {
    grid-template-columns: 40px 3fr 2fr 80px 40px;
  }
  
  .song-album {
    display: none;
  }
}
</style>
</code_block_to_apply_changes_from>
</rewritten_file>