<template>
  <div class="downloads-view">
    <!-- 顶部导航 -->
    <div class="downloads-header">
      <h1 class="page-title">
        <MobileIcon name="download" :size="24" />
        离线音乐
      </h1>

      <div class="header-actions">
        <MobileButton
          @click="showCleanupDialog = true"
          type="warning"
          :loading="downloadStore.isLoading"
        >
          <MobileIcon name="trash-2" :size="16" />
          清理空间
        </MobileButton>
      </div>
    </div>

    <!-- 存储统计 -->
    <div class="storage-stats" v-if="storageStats">
      <div class="stats-card">
        <div class="stats-header">
          <h3>存储使用情况</h3>
          <div class="usage-percentage">{{ storageStats.usagePercentage.toFixed(1) }}%</div>
        </div>

        <div class="progress-bar">
          <MobileProgress
            :percentage="storageStats.usagePercentage"
            :color="getProgressColor(storageStats.usagePercentage)"
            :show-text="false"
          />
        </div>

        <div class="stats-details">
          <div class="stat-item">
            <span class="label">已用空间:</span>
            <span class="value">{{ formatFileSize(storageStats.usedSpace) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">总空间:</span>
            <span class="value">{{ formatFileSize(storageStats.totalSpace) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">下载数量:</span>
            <span class="value"
              >{{ storageStats.downloadCount }} / {{ storageStats.maxDownloads }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 下载筛选 -->
    <div class="download-filters">
      <MobileRadioGroup
        v-model="currentFilter"
        :options="filterOptions"
        @change="handleFilterChange"
      />

      <MobileSelect
        v-model="qualityFilter"
        placeholder="音质筛选"
        :options="qualityOptions"
        style="width: 150px"
      />
    </div>

    <!-- 下载列表 -->
    <div class="downloads-list-container">
      <div v-if="downloadStore.isLoading && downloads.length === 0" class="loading-container">
        <MobileSkeleton :rows="5" animated />
      </div>

      <div v-else-if="downloads.length === 0" class="empty-container">
        <MobileEmpty description="暂无下载文件">
          <MobileButton type="primary" @click="$router.push('/discover')">
            去发现音乐
          </MobileButton>
        </MobileEmpty>
      </div>

      <div v-else class="downloads-list">
        <DownloadCard
          v-for="download in downloads"
          :key="download.id"
          :download="{
            ...download,
            downloadedSize: download.downloadedSize || 0,
          }"
          @pause="handlePauseDownload"
          @resume="handleResumeDownload"
          @retry="handleRetryDownload"
          @delete="handleDeleteDownload"
          @play="handlePlaySong"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="downloadStore.hasMoreDownloads" class="load-more">
        <MobileButton @click="loadMoreDownloads" :loading="downloadStore.isLoading" type="text">
          加载更多
        </MobileButton>
      </div>
    </div>

    <!-- 清理对话框 -->
    <CleanupDialog v-model="showCleanupDialog" @cleanup="handleCleanup" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  MobileButton,
  MobileSkeleton,
  MobileEmpty,
  MobileSelect,
  MobileRadioGroup,
  MobileMessage,
  MobileIcon,
  MobileProgress,
  createSelectOptions,
} from '@/components/ui'
import { useDownloadStore } from '@/stores/download'
import { downloadApi } from '@/services'
import DownloadCard from '@/components/download/DownloadCard.vue'
import CleanupDialog from '@/components/download/CleanupDialog.vue'
import type { DownloadStatus, AudioQuality, CleanupOptions } from '@/services/download-api'

const router = useRouter()
const downloadStore = useDownloadStore()

// 响应式数据
const showCleanupDialog = ref(false)
const currentFilter = ref<string>('all')
const qualityFilter = ref<string>('')

// 筛选选项
const filterOptions = [
  { label: '全部下载', value: 'all' },
  { label: '已完成', value: 'completed' },
  { label: '下载中', value: 'downloading' },
  { label: '下载失败', value: 'failed' },
  { label: '已暂停', value: 'paused' },
]

const qualityOptions = createSelectOptions([
  { label: '全部音质', value: '' },
  { label: '省流量', value: 'low' },
  { label: '标准音质', value: 'medium' },
  { label: '高音质', value: 'high' },
  { label: '无损音质', value: 'lossless' },
])

// 计算属性
const downloads = computed(() => downloadStore.downloads)
const storageStats = computed(() => downloadStore.storageStats)

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  return downloadApi.formatFileSize(bytes)
}

// 获取进度条颜色
const getProgressColor = (percentage: number): string => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

// 处理筛选变化
const handleFilterChange = () => {
  loadDownloads()
}

// 监听音质筛选变化
watch(qualityFilter, () => {
  loadDownloads()
})

// 加载下载列表
const loadDownloads = () => {
  const params: any = { page: 1, limit: 20 }

  if (currentFilter.value !== 'all') {
    params.status = currentFilter.value as DownloadStatus
  }

  if (qualityFilter.value) {
    params.quality = qualityFilter.value as AudioQuality
  }

  downloadStore.getDownloads(params)
}

// 加载更多下载
const loadMoreDownloads = () => {
  const nextPage = downloadStore.downloadsMeta.page + 1
  const params: any = {
    page: nextPage,
    limit: 20,
  }

  if (currentFilter.value !== 'all') {
    params.status = currentFilter.value as DownloadStatus
  }

  if (qualityFilter.value) {
    params.quality = qualityFilter.value as AudioQuality
  }

  downloadStore.getDownloads(params, true) // append = true
}

// 处理暂停下载
const handlePauseDownload = async (downloadId: string) => {
  const success = await downloadStore.pauseDownload(downloadId)
  if (success) {
    MobileMessage.success('下载已暂停')
  }
}

// 处理恢复下载
const handleResumeDownload = async (downloadId: string) => {
  const success = await downloadStore.resumeDownload(downloadId)
  if (success) {
    MobileMessage.success('下载已恢复')
  }
}

// 处理重试下载
const handleRetryDownload = async (downloadId: string) => {
  const success = await downloadStore.retryDownload(downloadId)
  if (success) {
    MobileMessage.success('重新开始下载')
  }
}

// 处理删除下载
const handleDeleteDownload = async (downloadId: string) => {
  try {
    // 简单的确认对话框替代
    if (!confirm('确定要删除这个下载任务吗？本地文件也会被删除。')) {
      return
    }

    const success = await downloadStore.deleteDownload(downloadId)
    if (success) {
      MobileMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 处理播放歌曲
const handlePlaySong = (download: any) => {
  // TODO: 实现离线播放功能
  MobileMessage.info('离线播放功能开发中')
}

// 处理清理
const handleCleanup = async (options: CleanupOptions) => {
  const result = await downloadStore.cleanupDownloads(options)
  if (result) {
    MobileMessage.success(
      `清理完成：删除了 ${result.cleaned} 个文件，释放了 ${formatFileSize(result.freedSpace)} 空间`
    )
    showCleanupDialog.value = false
  }
}

// 初始化
onMounted(async () => {
  // 获取存储统计
  await downloadStore.getStorageStats()

  // 获取下载列表
  await loadDownloads()
})
</script>

<style scoped>
.downloads-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding: 1.5rem;
  padding-bottom: calc(140px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
}

.downloads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.storage-stats {
  margin-bottom: 2rem;
}

.stats-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stats-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.usage-percentage {
  font-size: 1.75rem;
  font-weight: 700;
  color: #64b5f6;
}

.progress-bar {
  margin-bottom: 1rem;
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.stat-item .value {
  color: white;
  font-weight: 600;
}

.download-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.downloads-list-container {
  min-height: 400px;
}

.loading-container,
.empty-container {
  padding: 2.5rem 1.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.downloads-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.load-more {
  text-align: center;
  padding: 1.25rem;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .downloads-view {
    padding: 1rem;
    padding-bottom: calc(150px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
  }

  .downloads-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .header-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
  }

  .header-actions button {
    flex: 1;
    min-height: 48px; /* 移动端最小触摸目标 */
  }

  .stats-card {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .stats-header h3 {
    font-size: 1rem;
  }

  .usage-percentage {
    font-size: 1.5rem;
  }

  .stats-details {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-item .label {
    font-size: 0.8125rem;
  }

  .download-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .loading-container,
  .empty-container {
    padding: 3.75rem 1.25rem;
  }

  .downloads-list {
    gap: 0.75rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .downloads-view {
    padding: 0.75rem;
  }

  .downloads-header {
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.125rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-card {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .stats-header h3 {
    font-size: 0.9375rem;
  }

  .usage-percentage {
    font-size: 1.125rem;
  }

  .download-filters {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
}
</style>
