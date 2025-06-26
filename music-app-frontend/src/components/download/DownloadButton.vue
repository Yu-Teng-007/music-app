<template>
  <div class="download-button">
    <!-- 未下载状态 -->
    <MobileDropdown
      v-if="!isDownloaded && !isDownloading"
      @command="handleDownload"
      trigger="click"
    >
      <MobileButton type="primary" size="small" :loading="isLoading">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        下载
      </MobileButton>
      <template #dropdown>
        <MobileDropdownMenu>
          <MobileDropdownItem command="high">
            <div class="quality-option">
              <span class="quality-name">高音质</span>
              <span class="quality-desc">320kbps</span>
            </div>
          </MobileDropdownItem>
          <MobileDropdownItem command="medium">
            <div class="quality-option">
              <span class="quality-name">标准音质</span>
              <span class="quality-desc">128kbps</span>
            </div>
          </MobileDropdownItem>
          <MobileDropdownItem command="low">
            <div class="quality-option">
              <span class="quality-name">省流量</span>
              <span class="quality-desc">64kbps</span>
            </div>
          </MobileDropdownItem>
          <MobileDropdownItem command="lossless" divided>
            <div class="quality-option">
              <span class="quality-name">无损音质</span>
              <span class="quality-desc">FLAC</span>
            </div>
          </MobileDropdownItem>
        </MobileDropdownMenu>
      </template>
    </MobileDropdown>

    <!-- 下载中状态 -->
    <MobileButton v-else-if="isDownloading" size="small" :loading="true">
      <span>{{ downloadProgress }}%</span>
    </MobileButton>

    <!-- 已下载状态 -->
    <MobileButton v-else type="success" size="small" @click="handlePlay">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      已下载
    </MobileButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  MobileButton,
  MobileDropdown,
  MobileDropdownMenu,
  MobileDropdownItem,
  MobileMessage,
} from '@/components/ui'
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
const handleDownload = async (command: string) => {
  if (props.disabled) {
    MobileMessage.warning('当前无法下载')
    return
  }

  // 将command转换为AudioQuality
  const qualityMap: Record<string, AudioQuality> = {
    high: AudioQuality.HIGH,
    medium: AudioQuality.MEDIUM,
    low: AudioQuality.LOW,
    lossless: AudioQuality.LOSSLESS,
  }

  const quality = qualityMap[command]
  if (!quality) return

  try {
    const download = await downloadStore.downloadSong(props.songId, quality)
    if (download) {
      MobileMessage.success(`开始下载 ${props.songTitle || '歌曲'}`)
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

:deep(.mobile-dropdown-item) {
  padding: 8px 16px;
}

:deep(.mobile-btn--small) {
  padding: 5px 11px;
  font-size: 12px;
}
</style>
