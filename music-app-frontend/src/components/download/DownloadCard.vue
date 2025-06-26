<template>
  <div class="download-card">
    <!-- 歌曲信息 -->
    <div class="song-info">
      <div class="song-cover">
        <MobileImage
          :src="download.song?.coverUrl"
          :alt="download.song?.title || '歌曲封面'"
          fit="cover"
          width="60"
          height="60"
          border-radius="8"
          class="cover-image"
        >
          <template #error>
            <MobileIcon name="headset" :size="24" />
          </template>
        </MobileImage>

        <!-- 播放按钮覆盖层 -->
        <div
          v-if="download.status === 'completed'"
          class="play-overlay"
          @click="$emit('play', download)"
        >
          <MobileIcon name="play" :size="24" />
        </div>
      </div>

      <div class="song-details">
        <div class="song-title">{{ download.song?.title || '未知歌曲' }}</div>
        <div class="song-artist">{{ download.song?.artist || '未知艺人' }}</div>
        <div class="download-info">
          <span class="quality-tag">{{ getQualityDisplayName(download.quality) }}</span>
          <span class="file-size">{{ formatFileSize(download.fileSize) }}</span>
        </div>
      </div>
    </div>

    <!-- 下载状态和进度 -->
    <div class="download-status">
      <div class="status-header">
        <span class="status-text" :class="getStatusClass(download.status)">
          {{ getStatusDisplayName(download.status) }}
        </span>
        <span class="download-time">{{ formatTime(download.createdAt) }}</span>
      </div>

      <!-- 进度条 -->
      <div v-if="showProgress" class="progress-container">
        <MobileProgress
          :percentage="download.progress"
          :color="getProgressColor(download.status)"
          :stroke-width="6"
          :show-text="false"
        />
        <div class="progress-text">
          <span>{{ download.progress }}%</span>
          <span v-if="download.status === 'downloading'">
            {{ formatFileSize(download.downloadedSize) }} / {{ formatFileSize(download.fileSize) }}
          </span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="download.status === 'failed' && download.errorMessage" class="error-message">
        <MobileIcon name="alert-triangle" :size="16" />
        {{ download.errorMessage }}
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="download-actions">
      <!-- 下载中状态的按钮 -->
      <template v-if="download.status === 'downloading'">
        <MobileButton size="small" @click="$emit('pause', download.id)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          暂停
        </MobileButton>
      </template>

      <!-- 暂停状态的按钮 -->
      <template v-else-if="download.status === 'paused'">
        <MobileButton size="small" type="primary" @click="$emit('resume', download.id)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="5,3 19,12 5,21"></polygon>
          </svg>
          继续
        </MobileButton>
      </template>

      <!-- 失败状态的按钮 -->
      <template v-else-if="download.status === 'failed'">
        <MobileButton size="small" type="primary" @click="$emit('retry', download.id)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="23,4 23,10 17,10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          重试
        </MobileButton>
      </template>

      <!-- 已完成状态的按钮 -->
      <template v-else-if="download.status === 'completed'">
        <MobileButton size="small" type="success" @click="$emit('play', download)">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="5,3 19,12 5,21"></polygon>
          </svg>
          播放
        </MobileButton>
      </template>

      <!-- 删除按钮 -->
      <MobileButton
        size="small"
        type="danger"
        @click="$emit('delete', download.id)"
        :disabled="download.status === 'downloading'"
      >
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
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          ></path>
        </svg>
        删除
      </MobileButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MobileButton, MobileImage, MobileProgress, MobileIcon } from '@/components/ui'
import { downloadApi } from '@/services'
import type { Download, DownloadStatus, AudioQuality } from '@/services/download-api'

interface Props {
  download: Download
}

interface Emits {
  (e: 'pause', downloadId: string): void
  (e: 'resume', downloadId: string): void
  (e: 'retry', downloadId: string): void
  (e: 'delete', downloadId: string): void
  (e: 'play', download: Download): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const showProgress = computed(() => {
  return ['downloading', 'paused'].includes(props.download.status)
})

// 方法

const formatFileSize = (bytes: number): string => {
  return downloadApi.formatFileSize(bytes)
}

const getQualityDisplayName = (quality: AudioQuality): string => {
  return downloadApi.getQualityDisplayName(quality)
}

const getStatusDisplayName = (status: DownloadStatus): string => {
  return downloadApi.getStatusDisplayName(status)
}

const getStatusClass = (status: DownloadStatus): string => {
  const statusClasses = {
    pending: 'status-pending',
    downloading: 'status-downloading',
    completed: 'status-completed',
    failed: 'status-failed',
    paused: 'status-paused',
  }
  return statusClasses[status] || ''
}

const getProgressColor = (status: DownloadStatus): string => {
  const progressColors = {
    downloading: '#409eff',
    paused: '#e6a23c',
    completed: '#67c23a',
    failed: '#f56c6c',
    pending: '#909399',
  }
  return progressColors[status] || '#409eff'
}

const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.download-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  display: flex;
  gap: 20px;
  align-items: center;
}

.download-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.song-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.song-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-cover:hover .play-overlay {
  opacity: 1;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 16px;
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
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.quality-tag {
  background: #f0f9ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.download-status {
  flex: 1;
  min-width: 200px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.status-pending {
  color: #909399;
}
.status-downloading {
  color: #409eff;
}
.status-completed {
  color: #67c23a;
}
.status-failed {
  color: #f56c6c;
}
.status-paused {
  color: #e6a23c;
}

.download-time {
  font-size: 12px;
  color: #909399;
}

.progress-container {
  margin-bottom: 8px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #606266;
  margin-top: 4px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #f56c6c;
  background: #fef0f0;
  padding: 8px;
  border-radius: 4px;
}

.download-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .download-card {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .song-info {
    gap: 12px;
  }

  .song-cover {
    width: 60px;
    height: 60px;
  }

  .song-title {
    font-size: 15px;
  }

  .song-artist {
    font-size: 13px;
  }

  .download-status {
    min-width: auto;
    margin-top: 8px;
  }

  .status-badge {
    padding: 6px 12px;
    font-size: 12px;
  }

  .download-progress {
    margin-top: 8px;
  }

  .progress-info {
    font-size: 11px;
  }

  .download-actions {
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .download-actions button {
    min-height: 44px; /* 移动端最小触摸目标 */
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .download-card {
    padding: 12px;
    gap: 12px;
  }

  .song-info {
    gap: 10px;
  }

  .song-cover {
    width: 50px;
    height: 50px;
  }

  .song-title {
    font-size: 14px;
  }

  .song-artist {
    font-size: 12px;
  }

  .status-badge {
    padding: 4px 8px;
    font-size: 11px;
  }

  .progress-info {
    font-size: 10px;
  }

  .download-actions {
    gap: 8px;
  }

  .download-actions button {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .download-card {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
  }

  .song-title {
    color: #ffffff;
  }

  .song-artist {
    color: #999999;
  }

  .status-badge {
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    color: #ffffff;
  }

  .status-completed {
    background: rgba(103, 194, 58, 0.2);
    color: #67c23a;
  }

  .status-downloading {
    background: rgba(64, 158, 255, 0.2);
    color: #409eff;
  }

  .status-failed {
    background: rgba(245, 108, 108, 0.2);
    color: #f56c6c;
  }

  .status-paused {
    background: rgba(230, 162, 60, 0.2);
    color: #e6a23c;
  }

  .progress-info {
    color: #999999;
  }

  .error-message {
    background: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.3);
  }
}
</style>
