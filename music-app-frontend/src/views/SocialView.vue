<template>
  <div class="social-view">
    <!-- 顶部导航 -->
    <div class="social-header">
      <h1 class="page-title">
        <i class="el-icon-user-solid"></i>
        社交动态
      </h1>

      <div class="header-actions">
        <MobileButton
          type="primary"
          @click="showCreateFeedDialog = true"
          :loading="socialStore.isLoading"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          发布动态
        </MobileButton>
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
        <MobileSkeleton :rows="3" animated />
      </div>

      <div v-else-if="feeds.length === 0" class="empty-container">
        <MobileEmpty description="暂无动态">
          <MobileButton type="primary" @click="showCreateFeedDialog = true">
            发布第一条动态
          </MobileButton>
        </MobileEmpty>
      </div>

      <div v-else class="feeds-list">
        <FeedCard
          v-for="feed in feeds"
          :key="feed.id"
          :feed="{
            ...feed,
            likeCount: feed.likeCount || 0,
            commentCount: feed.commentCount || 0,
            shareCount: feed.shareCount || 0,
            isVisible: feed.isVisible !== false,
          }"
          @like="handleLikeFeed"
          @unlike="handleUnlikeFeed"
          @delete="handleDeleteFeed"
          @share="handleShareFeed"
          @user-click="handleUserClick"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="socialStore.hasMoreFeeds" class="load-more">
        <el-button @click="loadMoreFeeds" :loading="socialStore.isLoading" type="text">
          加载更多
        </el-button>
      </div>
    </div>

    <!-- 发布动态对话框 -->
    <CreateFeedDialog v-model="showCreateFeedDialog" @created="handleFeedCreated" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MobileButton, MobileSkeleton, MobileEmpty, MobileMessage } from '@/components/ui'
import { useSocialStore } from '@/stores/social'
import { realtimeService } from '@/services'
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
    limit: 20,
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
    MobileMessage.success('点赞成功')
  }
}

// 处理取消点赞
const handleUnlikeFeed = async (feedId: string) => {
  const success = await socialStore.unlikeFeed(feedId)
  if (success) {
    MobileMessage.success('取消点赞成功')
  }
}

// 处理删除动态
const handleDeleteFeed = async (feedId: string) => {
  const success = await socialStore.deleteFeed(feedId)
  if (success) {
    MobileMessage.success('删除成功')
  }
}

// 处理分享动态
const handleShareFeed = (feed: UserFeed) => {
  // TODO: 实现分享功能
  MobileMessage.info('分享功能开发中')
}

// 处理用户点击
const handleUserClick = (userId: string) => {
  router.push(`/user/${userId}`)
}

// 处理动态创建成功
const handleFeedCreated = (feed: UserFeed) => {
  showCreateFeedDialog.value = false
  MobileMessage.success('发布成功')
}

// 设置实时通信监听
const setupRealtimeListeners = () => {
  // 监听新动态
  realtimeService.onNewFeed(data => {
    console.log('收到新动态:', data)
    MobileMessage.info('有新动态发布')
  })

  // 监听动态更新
  realtimeService.onFeedUpdate(data => {
    console.log('动态更新:', data)
    // 将新动态添加到列表开头
    if (data.data) {
      socialStore.feeds.unshift(data.data)
    }
  })

  // 监听点赞通知
  realtimeService.onFeedLiked(data => {
    console.log('收到点赞通知:', data)
    MobileMessage.success('有人点赞了你的动态')
  })

  // 监听新关注者
  realtimeService.onNewFollower(data => {
    console.log('收到关注通知:', data)
    MobileMessage.success('有新的关注者')
    // 更新统计数据
    if (socialStats.value) {
      socialStats.value.followerCount++
    }
  })
}

// 清理实时通信监听
const cleanupRealtimeListeners = () => {
  realtimeService.offSocialEvents()
}

// 初始化
onMounted(async () => {
  // 获取我的社交统计
  await socialStore.getMySocialStats()

  // 获取动态列表
  await socialStore.getFeeds({ page: 1, limit: 20 })

  // 设置实时通信监听
  setupRealtimeListeners()
})

// 清理
onUnmounted(() => {
  cleanupRealtimeListeners()
})
</script>

<style scoped>
.social-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  padding: 1.5rem;
  padding-bottom: calc(140px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
}

.social-header {
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

.social-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #64b5f6;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.feed-filters {
  margin-bottom: 1.5rem;
}

.feeds-container {
  min-height: 400px;
}

.loading-container,
.empty-container {
  padding: 2.5rem 1.25rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.feeds-list {
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
  .social-view {
    padding: 1rem;
    padding-bottom: calc(150px + env(safe-area-inset-bottom)); /* 为底部导航栏和mini播放器留空间 */
  }

  .social-header {
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
    width: 100%;
  }

  .header-actions button {
    width: 100%;
    min-height: 48px; /* 移动端最小触摸目标 */
  }

  .social-stats {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8125rem;
  }

  .feed-filters {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
  }

  .loading-container,
  .empty-container {
    padding: 3.75rem 1.25rem;
  }

  .feeds-list {
    gap: 0.75rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .social-view {
    padding: 0.75rem;
  }

  .social-header {
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.125rem;
  }

  .social-stats {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .stats-grid {
    gap: 0.75rem;
  }

  .stat-number {
    font-size: 1.125rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}
</style>
