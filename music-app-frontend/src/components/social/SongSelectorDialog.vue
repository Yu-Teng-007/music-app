<template>
  <MobileDialog v-model="dialogVisible" title="选择歌曲" width="90%">
    <div class="song-selector-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <MobileInput
          v-model="searchKeyword"
          placeholder="搜索歌曲..."
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

      <!-- 歌曲列表 -->
      <div class="songs-list">
        <div v-if="isLoading" class="loading-container">
          <MobileSkeleton :rows="5" animated />
        </div>

        <div v-else-if="songs.length === 0" class="empty-container">
          <MobileEmpty description="暂无歌曲" />
        </div>

        <div v-else class="songs-grid">
          <div v-for="song in songs" :key="song.id" class="song-item" @click="handleSelect(song)">
            <div class="song-cover">
              <img
                :src="song.coverUrl"
                :alt="song.title"
                class="cover-image"
                @error="handleImageError"
              />
              <div v-if="!song.coverUrl" class="cover-placeholder">
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
            </div>
            <div class="song-info">
              <div class="song-title">{{ song.title }}</div>
              <div class="song-artist">{{ song.artist }}</div>
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
import { musicApi } from '@/services'

// 临时类型定义
interface Song {
  id: string
  title: string
  artist: string
  coverUrl?: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', song: Song): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const songs = ref<Song[]>([])
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
    loadSongs()
  }
})

// 方法
const loadSongs = async () => {
  try {
    isLoading.value = true
    const result = await musicApi.getSongs({ page: 1, limit: 50 })
    songs.value = result.items
  } catch (error) {
    console.error('加载歌曲失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    loadSongs()
    return
  }

  try {
    isLoading.value = true
    const result = await musicApi.searchSongs(searchKeyword.value, { page: 1, limit: 50 })
    songs.value = result.items
  } catch (error) {
    console.error('搜索歌曲失败:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (song: Song) => {
  emit('select', song)
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// 初始化
onMounted(() => {
  if (dialogVisible.value) {
    loadSongs()
  }
})
</script>

<style scoped>
.song-selector-content {
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-bottom: 20px;
}

.songs-list {
  flex: 1;
  overflow-y: auto;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.song-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.song-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.song-cover {
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

.song-info {
  text-align: center;
}

.song-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
