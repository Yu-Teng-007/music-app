<template>
  <MobileDialog v-model="dialogVisible" title="选择歌单" width="90%">
    <div class="playlist-selector-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <MobileInput
          v-model="searchKeyword"
          placeholder="搜索歌单..."
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </template>
        </MobileInput>
      </div>

      <!-- 歌单列表 -->
      <div class="playlists-list">
        <div v-if="isLoading" class="loading-container">
          <MobileSkeleton :rows="5" animated />
        </div>

        <div v-else-if="playlists.length === 0" class="empty-container">
          <MobileEmpty description="暂无歌单" />
        </div>

        <div v-else class="playlists-grid">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            class="playlist-item"
            @click="handleSelect(playlist)"
          >
            <div class="playlist-cover">
              <img
                :src="playlist.coverUrl"
                :alt="playlist.title || playlist.name"
                class="cover-image"
                @error="handleImageError"
              />
              <div v-if="!playlist.coverUrl" class="cover-placeholder">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 12h18l-3-3m0 6l3-3"></path>
                  <path d="M3 6h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
              </div>
            </div>
            <div class="playlist-info">
              <div class="playlist-title">{{ playlist.title || playlist.name }}</div>
              <div class="playlist-desc">{{ playlist.description || '暂无描述' }}</div>
              <div class="playlist-count">{{ playlist.songCount || 0 }} 首歌曲</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <MobileButton @click="dialogVisible = false">取消</MobileButton>
      </div>
    </template>
  </MobileDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  MobileDialog,
  MobileInput,
  MobileSkeleton,
  MobileEmpty,
  MobileButton,
} from '@/components/ui'
import { playlistApi } from '@/services'
import type { Playlist } from '@/types'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', playlist: Playlist): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const playlists = ref<Playlist[]>([])
const searchKeyword = ref('')
const isLoading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// 监听对话框显示状态
watch(dialogVisible, visible => {
  if (visible) {
    loadPlaylists()
  }
})

// 方法
const loadPlaylists = async () => {
  try {
    isLoading.value = true
    const result = await playlistApi.getMyPlaylists()
    playlists.value = result
  } catch (error) {
    console.error('加载歌单失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    loadPlaylists()
    return
  }

  try {
    isLoading.value = true
    // 简单的本地搜索
    const allPlaylists = await playlistApi.getMyPlaylists()
    playlists.value = allPlaylists.filter(
      (playlist: any) =>
        playlist.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        (playlist.description &&
          playlist.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
  } catch (error) {
    console.error('搜索歌单失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (playlist: Playlist) => {
  emit('select', playlist)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// 初始化
onMounted(() => {
  if (dialogVisible.value) {
    loadPlaylists()
  }
})
</script>

<style scoped>
.playlist-selector-content {
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 20px;
}

.playlists-list {
  flex: 1;
  overflow-y: auto;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.playlist-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.playlist-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e4e7ed;
  color: #909399;
  font-size: 24px;
}

.playlist-info {
  text-align: center;
}

.playlist-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-count {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
}
</style>
