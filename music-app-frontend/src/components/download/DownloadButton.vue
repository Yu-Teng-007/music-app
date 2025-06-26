<template>
  <div class="download-button">
    <!-- 未下载状态 -->
    <el-dropdown v-if="!isDownloaded && !isDownloading" @command="handleDownload" trigger="click">
      <el-button type="primary" size="small" :loading="isLoading">
        <i class="el-icon-download"></i>
        下载
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="high">
            <div class="quality-option">
              <span class="quality-name">高音质</span>
              <span class="quality-desc">320kbps</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="medium">
            <div class="quality-option">
              <span class="quality-name">标准音质</span>
              <span class="quality-desc">128kbps</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="low">
            <div class="quality-option">
              <span class="quality-name">省流量</span>
              <span class="quality-desc">64kbps</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="lossless" divided>
            <div class="quality-option">
              <span class="quality-name">无损音质</span>
              <span class="quality-desc">FLAC</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <!-- 下载中状态 -->
    <el-button v-else-if="isDownloading" size="small" :loading="true">
      <span>{{ downloadProgress }}%</span>
    </el-button>
    
    <!-- 已下载状态 -->
    <el-button v-else type="success" size="small" @click="handlePlay">
      <i class="el-icon-check"></i>
      已下载
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDownloadStore } from '@/stores/download'
import { AudioQuality, DownloadStatus } from '@/services/download-api'

interface Props {
  songId: string
  songTitle?: string
  disabled?: boolean
}

interface Emits {
  (e: 'download-started', songId: string, quality: AudioQuality): void
  (e: 'play-offline', songId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const downloadStore = useDownloadStore()

// 计算属性
const isLoading = computed(() => downloadStore.isLoading)

const isDownloaded = computed(() => {
  return downloadStore.isSongDownloaded(props.songId)
})

const isDownloading = computed(() => {
  const status = downloadStore.getSongDownloadStatus(props.songId)
  return status === DownloadStatus.DOWNLOADING || status === DownloadStatus.PENDING
})

const downloadProgress = computed(() => {
  return downloadStore.getSongDownloadProgress(props.songId)
})

// 方法
const handleDownload = async (quality: AudioQuality) => {
  if (props.disabled) {
    ElMessage.warning('当前无法下载')
    return
  }

  try {
    const download = await downloadStore.downloadSong(props.songId, quality)
    if (download) {
      ElMessage.success(`开始下载 ${props.songTitle || '歌曲'}`)
      emit('download-started', props.songId, quality)
    }
  } catch (error) {
    console.error('下载失败:', error)
  }
}

const handlePlay = () => {
  emit('play-offline', props.songId)
}
</script>

<style scoped>
.download-button {
  display: inline-block;
}

.quality-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quality-name {
  font-weight: 500;
  color: #303133;
}

.quality-desc {
  font-size: 12px;
  color: #909399;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
}

:deep(.el-button--small) {
  padding: 5px 11px;
  font-size: 12px;
}
</style>
