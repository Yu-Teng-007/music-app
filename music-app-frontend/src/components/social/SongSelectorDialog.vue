<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择歌曲"
    width="800px"
  >
    <div class="song-selector-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索歌曲..."
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>

      <!-- 歌曲列表 -->
      <div class="songs-list">
        <div v-if="isLoading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="songs.length === 0" class="empty-container">
          <el-empty description="暂无歌曲" />
        </div>

        <div v-else class="songs-grid">
          <div
            v-for="song in songs"
            :key="song.id"
            class="song-item"
            @click="handleSelect(song)"
          >
            <div class="song-cover">
              <el-image 
                :src="song.coverUrl" 
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <div class="cover-placeholder">
                    <i class="el-icon-headset"></i>
                  </div>
                </template>
              </el-image>
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
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { musicApi } from '@/services'
import type { Song } from '@/types/song'

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
  set: (value) => emit('update:modelValue', value)
})

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
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
