<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择歌单"
    width="800px"
  >
    <div class="playlist-selector-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索歌单..."
          @input="handleSearch"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>

      <!-- 歌单列表 -->
      <div class="playlists-list">
        <div v-if="isLoading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="playlists.length === 0" class="empty-container">
          <el-empty description="暂无歌单" />
        </div>

        <div v-else class="playlists-grid">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            class="playlist-item"
            @click="handleSelect(playlist)"
          >
            <div class="playlist-cover">
              <el-image 
                :src="playlist.coverUrl" 
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <div class="cover-placeholder">
                    <i class="el-icon-menu"></i>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="playlist-info">
              <div class="playlist-title">{{ playlist.title }}</div>
              <div class="playlist-desc">{{ playlist.description || '暂无描述' }}</div>
              <div class="playlist-count">{{ playlist.songCount || 0 }} 首歌曲</div>
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
import { playlistApi } from '@/services'
import type { Playlist } from '@/types/playlist'

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
  set: (value) => emit('update:modelValue', value)
})

// 监听对话框显示状态
watch(dialogVisible, (visible) => {
  if (visible) {
    loadPlaylists()
  }
})

// 方法
const loadPlaylists = async () => {
  try {
    isLoading.value = true
    const result = await playlistApi.getMyPlaylists({ page: 1, limit: 50 })
    playlists.value = result.items
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
    const allPlaylists = await playlistApi.getMyPlaylists({ page: 1, limit: 100 })
    playlists.value = allPlaylists.items.filter(playlist =>
      playlist.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      (playlist.description && playlist.description.toLowerCase().includes(searchKeyword.value.toLowerCase()))
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
