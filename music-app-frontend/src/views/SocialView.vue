<template>
  <div class="social-container">
    <!-- 顶部导航 -->
    <div class="social-header">
      <h1 class="page-title">
        <i class="el-icon-user-solid"></i>
        社交动态
      </h1>
      
      <div class="header-actions">
        <el-button 
          type="primary" 
          @click="showCreateFeedDialog = true"
          :loading="socialStore.isLoading"
        >
          <i class="el-icon-edit"></i>
          发布动态
        </el-button>
      </div>
    </div>

    <!-- 我的社交统计 -->
    <div class="social-stats" v-if="socialStats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">{{ socialStats.followingCount }}</div>
          <div class="stat-label">关注</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ socialStats.followerCount }}</div>
          <div class="stat-label">粉丝</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ socialStats.feedCount }}</div>
          <div class="stat-label">动态</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ socialStats.totalLikes }}</div>
          <div class="stat-label">获赞</div>
        </div>
      </div>
    </div>

    <!-- 动态筛选 -->
    <div class="feed-filters">
      <el-radio-group v-model="currentFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部动态</el-radio-button>
        <el-radio-button label="following">关注的人</el-radio-button>
        <el-radio-button label="share_song">分享歌曲</el-radio-button>
        <el-radio-button label="share_playlist">分享歌单</el-radio-button>
        <el-radio-button label="like_song">喜欢歌曲</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 动态列表 -->
    <div class="feeds-container">
      <div v-if="socialStore.isLoading && feeds.length === 0" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else-if="feeds.length === 0" class="empty-container">
        <el-empty description="暂无动态">
          <el-button type="primary" @click="showCreateFeedDialog = true">
            发布第一条动态
          </el-button>
        </el-empty>
      </div>

      <div v-else class="feeds-list">
        <FeedCard
          v-for="feed in feeds"
          :key="feed.id"
          :feed="feed"
          @like="handleLikeFeed"
          @unlike="handleUnlikeFeed"
          @delete="handleDeleteFeed"
          @share="handleShareFeed"
          @user-click="handleUserClick"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="socialStore.hasMoreFeeds" class="load-more">
        <el-button 
          @click="loadMoreFeeds" 
          :loading="socialStore.isLoading"
          type="text"
        >
          加载更多
        </el-button>
      </div>
    </div>

    <!-- 发布动态对话框 -->
    <CreateFeedDialog
      v-model="showCreateFeedDialog"
      @created="handleFeedCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSocialStore } from '@/stores/social'
import FeedCard from '@/components/social/FeedCard.vue'
import CreateFeedDialog from '@/components/social/CreateFeedDialog.vue'
import type { UserFeed, FeedType } from '@/services/social-api'

const router = useRouter()
const socialStore = useSocialStore()

// 响应式数据
const showCreateFeedDialog = ref(false)
const currentFilter = ref<string>('all')

// 计算属性
const feeds = computed(() => socialStore.feeds)
const socialStats = computed(() => socialStore.socialStats)

// 处理筛选变化
const handleFilterChange = (filter: string) => {
  const params: any = { page: 1, limit: 20 }
  
  if (filter !== 'all') {
    if (filter === 'following') {
      // 只显示关注用户的动态，这个在后端已经处理
    } else {
      params.type = filter as FeedType
    }
  }
  
  socialStore.getFeeds(params)
}

// 加载更多动态
const loadMoreFeeds = () => {
  const nextPage = socialStore.feedsMeta.page + 1
  const params: any = { 
    page: nextPage, 
    limit: 20 
  }
  
  if (currentFilter.value !== 'all' && currentFilter.value !== 'following') {
    params.type = currentFilter.value as FeedType
  }
  
  socialStore.getFeeds(params, true) // append = true
}

// 处理点赞
const handleLikeFeed = async (feedId: string) => {
  const success = await socialStore.likeFeed(feedId)
  if (success) {
    ElMessage.success('点赞成功')
  }
}

// 处理取消点赞
const handleUnlikeFeed = async (feedId: string) => {
  const success = await socialStore.unlikeFeed(feedId)
  if (success) {
    ElMessage.success('取消点赞成功')
  }
}

// 处理删除动态
const handleDeleteFeed = async (feedId: string) => {
  const success = await socialStore.deleteFeed(feedId)
  if (success) {
    ElMessage.success('删除成功')
  }
}

// 处理分享动态
const handleShareFeed = (feed: UserFeed) => {
  // TODO: 实现分享功能
  ElMessage.info('分享功能开发中')
}

// 处理用户点击
const handleUserClick = (userId: string) => {
  router.push(`/user/${userId}`)
}

// 处理动态创建成功
const handleFeedCreated = (feed: UserFeed) => {
  showCreateFeedDialog.value = false
  ElMessage.success('发布成功')
}

// 初始化
onMounted(async () => {
  // 获取我的社交统计
  await socialStore.getMySocialStats()
  
  // 获取动态列表
  await socialStore.getFeeds({ page: 1, limit: 20 })
})
</script>

<style scoped>
.social-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.social-header {
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

.social-stats {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.feed-filters {
  margin-bottom: 24px;
}

.feeds-container {
  min-height: 400px;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.feeds-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .social-container {
    padding: 16px;
  }
  
  .social-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .feed-filters {
    overflow-x: auto;
  }
}
</style>
