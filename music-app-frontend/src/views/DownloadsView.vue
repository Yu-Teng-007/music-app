<template>
  <div class="downloads-container">
    <!-- 顶部导航 -->
    <div class="downloads-header">
      <h1 class="page-title">
        <i class="el-icon-download"></i>
        离线音乐
      </h1>

      <div class="header-actions">
        <el-button
          @click="showCleanupDialog = true"
          type="warning"
          :loading="downloadStore.isLoading"
        >
          <i class="el-icon-delete"></i>
          清理空间
        </el-button>
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
          <el-progress
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
      <el-radio-group v-model="currentFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部下载</el-radio-button>
        <el-radio-button label="completed">已完成</el-radio-button>
        <el-radio-button label="downloading">下载中</el-radio-button>
        <el-radio-button label="failed">下载失败</el-radio-button>
        <el-radio-button label="paused">已暂停</el-radio-button>
      </el-radio-group>

      <el-select v-model="qualityFilter" placeholder="音质筛选" style="width: 150px">
        <el-option label="全部音质" value="" />
        <el-option label="省流量" value="low" />
        <el-option label="标准音质" value="medium" />
        <el-option label="高音质" value="high" />
        <el-option label="无损音质" value="lossless" />
      </el-select>
    </div>

    <!-- 下载列表 -->
    <div class="downloads-list-container">
      <div v-if="downloadStore.isLoading && downloads.length === 0" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="downloads.length === 0" class="empty-container">
        <el-empty description="暂无下载文件">
          <el-button type="primary" @click="$router.push('/discover')"> 去发现音乐 </el-button>
        </el-empty>
      </div>

      <div v-else class="downloads-list">
        <DownloadCard
          v-for="download in downloads"
          :key="download.id"
          :download="download"
          @pause="handlePauseDownload"
          @resume="handleResumeDownload"
          @retry="handleRetryDownload"
          @delete="handleDeleteDownload"
          @play="handlePlaySong"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="downloadStore.hasMoreDownloads" class="load-more">
        <el-button @click="loadMoreDownloads" :loading="downloadStore.isLoading" type="text">
          加载更多
        </el-button>
      </div>
    </div>

    <!-- 清理对话框 -->
    <CleanupDialog v-model="showCleanupDialog" @cleanup="handleCleanup" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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
    ElMessage.success('下载已暂停')
  }
}

// 处理恢复下载
const handleResumeDownload = async (downloadId: string) => {
  const success = await downloadStore.resumeDownload(downloadId)
  if (success) {
    ElMessage.success('下载已恢复')
  }
}

// 处理重试下载
const handleRetryDownload = async (downloadId: string) => {
  const success = await downloadStore.retryDownload(downloadId)
  if (success) {
    ElMessage.success('重新开始下载')
  }
}

// 处理删除下载
const handleDeleteDownload = async (downloadId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个下载任务吗？本地文件也会被删除。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await downloadStore.deleteDownload(downloadId)
    if (success) {
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 处理播放歌曲
const handlePlaySong = (download: any) => {
  // TODO: 实现离线播放功能
  ElMessage.info('离线播放功能开发中')
}

// 处理清理
const handleCleanup = async (options: CleanupOptions) => {
  const result = await downloadStore.cleanupDownloads(options)
  if (result) {
    ElMessage.success(
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
.downloads-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.downloads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-stats {
  margin-bottom: 24px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.usage-percentage {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.progress-bar {
  margin-bottom: 16px;
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: #606266;
  font-size: 14px;
}

.stat-item .value {
  color: #303133;
  font-weight: 500;
}

.download-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.downloads-list-container {
  min-height: 400px;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.downloads-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .downloads-container {
    padding: 16px;
  }

  .downloads-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .stats-details {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .download-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
