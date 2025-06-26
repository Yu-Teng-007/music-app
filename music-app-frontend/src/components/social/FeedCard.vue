<template>
  <div class="feed-card">
    <!-- 用户信息 -->
    <div class="feed-header">
      <div class="user-info" @click="$emit('user-click', feed.user?.id)">
        <el-avatar :src="feed.user?.avatar" :size="40" class="user-avatar">
          {{ feed.user?.username?.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <div class="username">{{ feed.user?.username }}</div>
          <div class="feed-time">{{ formatTime(feed.createdAt) }}</div>
        </div>
      </div>

      <div class="feed-actions">
        <el-dropdown v-if="isMyFeed" @command="handleCommand">
          <el-button type="text" size="small">
            <i class="el-icon-more"></i>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="delete">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 动态内容 -->
    <div class="feed-content">
      <!-- 动态类型标识 -->
      <div class="feed-type">
        <i :class="feedTypeIcon"></i>
        <span>{{ feedTypeText }}</span>
      </div>

      <!-- 文字内容 -->
      <div v-if="feed.content" class="feed-text">
        {{ feed.content }}
      </div>

      <!-- 歌曲信息 -->
      <div v-if="feed.song" class="feed-song" @click="handleSongClick">
        <div class="song-cover">
          <el-image :src="feed.song.coverUrl" fit="cover" class="cover-image">
            <template #error>
              <div class="cover-placeholder">
                <i class="el-icon-picture-outline"></i>
              </div>
            </template>
          </el-image>
          <div class="play-overlay">
            <i class="el-icon-video-play"></i>
          </div>
        </div>
        <div class="song-info">
          <div class="song-title">{{ feed.song.title }}</div>
          <div class="song-artist">{{ feed.song.artist }}</div>
        </div>
      </div>

      <!-- 歌单信息 -->
      <div v-if="feed.playlist" class="feed-playlist" @click="handlePlaylistClick">
        <div class="playlist-cover">
          <el-image :src="feed.playlist.coverUrl" fit="cover" class="cover-image">
            <template #error>
              <div class="cover-placeholder">
                <i class="el-icon-menu"></i>
              </div>
            </template>
          </el-image>
        </div>
        <div class="playlist-info">
          <div class="playlist-title">{{ feed.playlist.title }}</div>
          <div class="playlist-desc">{{ feed.playlist.description }}</div>
        </div>
      </div>

      <!-- 目标用户信息 -->
      <div
        v-if="feed.targetUser"
        class="feed-target-user"
        @click="$emit('user-click', feed.targetUser.id)"
      >
        <el-avatar :src="feed.targetUser.avatar" :size="32">
          {{ feed.targetUser.username?.charAt(0) }}
        </el-avatar>
        <span class="target-username">{{ feed.targetUser.username }}</span>
      </div>
    </div>

    <!-- 互动区域 -->
    <div class="feed-interactions">
      <div class="interaction-buttons">
        <el-button type="text" size="small" :class="{ 'is-liked': isLiked }" @click="handleLike">
          <i :class="isLiked ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
          {{ feed.likeCount || 0 }}
        </el-button>

        <el-button type="text" size="small" @click="handleComment">
          <i class="el-icon-chat-line-round"></i>
          {{ feed.commentCount || 0 }}
        </el-button>

        <el-button type="text" size="small" @click="handleShare">
          <i class="el-icon-share"></i>
          {{ feed.shareCount || 0 }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserFeed } from '@/services/social-api'
// import { formatDistanceToNow } from 'date-fns'
// import { zhCN } from 'date-fns/locale'

interface Props {
  feed: UserFeed
}

interface Emits {
  (e: 'like', feedId: string): void
  (e: 'unlike', feedId: string): void
  (e: 'delete', feedId: string): void
  (e: 'share', feed: UserFeed): void
  (e: 'user-click', userId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

// 计算属性
const isMyFeed = computed(() => {
  return props.feed.userId === authStore.user?.id
})

const isLiked = computed(() => {
  // TODO: 实现点赞状态检查
  return false
})

const feedTypeIcon = computed(() => {
  switch (props.feed.type) {
    case 'share_song':
      return 'el-icon-headset'
    case 'share_playlist':
      return 'el-icon-menu'
    case 'like_song':
      return 'el-icon-star-on'
    case 'create_playlist':
      return 'el-icon-plus'
    case 'follow_user':
      return 'el-icon-user-solid'
    case 'comment_song':
      return 'el-icon-chat-line-round'
    default:
      return 'el-icon-document'
  }
})

const feedTypeText = computed(() => {
  switch (props.feed.type) {
    case 'share_song':
      return '分享了歌曲'
    case 'share_playlist':
      return '分享了歌单'
    case 'like_song':
      return '喜欢了歌曲'
    case 'create_playlist':
      return '创建了歌单'
    case 'follow_user':
      return '关注了用户'
    case 'comment_song':
      return '评论了歌曲'
    default:
      return '发布了动态'
  }
})

// 方法
const formatTime = (time: string) => {
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

const handleCommand = (command: string) => {
  if (command === 'delete') {
    emit('delete', props.feed.id)
  }
}

const handleLike = () => {
  if (isLiked.value) {
    emit('unlike', props.feed.id)
  } else {
    emit('like', props.feed.id)
  }
}

const handleComment = () => {
  // TODO: 实现评论功能
  console.log('评论功能开发中')
}

const handleShare = () => {
  emit('share', props.feed)
}

const handleSongClick = () => {
  if (props.feed.song) {
    router.push(`/song/${props.feed.song.id}`)
  }
}

const handlePlaylistClick = () => {
  if (props.feed.playlist) {
    router.push(`/playlist/${props.feed.playlist.id}`)
  }
}
</script>

<style scoped>
.feed-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.feed-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-info:hover .username {
  color: #409eff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 500;
  color: #303133;
  transition: color 0.3s ease;
}

.feed-time {
  font-size: 12px;
  color: #909399;
}

.feed-content {
  margin-bottom: 16px;
}

.feed-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.feed-text {
  font-size: 16px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
}

.feed-song,
.feed-playlist {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.feed-song:hover,
.feed-playlist:hover {
  background: #ecf5ff;
}

.song-cover,
.playlist-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
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
  font-size: 20px;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feed-song:hover .play-overlay {
  opacity: 1;
}

.song-info,
.playlist-info {
  flex: 1;
  min-width: 0;
}

.song-title,
.playlist-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist,
.playlist-desc {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feed-target-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.feed-target-user:hover {
  background: #e1f5fe;
}

.target-username {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.feed-interactions {
  border-top: 1px solid #ebeef5;
  padding-top: 12px;
}

.interaction-buttons {
  display: flex;
  gap: 24px;
}

.interaction-buttons .el-button {
  color: #606266;
  padding: 4px 8px;
}

.interaction-buttons .el-button:hover {
  color: #409eff;
}

.interaction-buttons .el-button.is-liked {
  color: #f56c6c;
}

@media (max-width: 768px) {
  .feed-card {
    padding: 16px;
  }

  .interaction-buttons {
    gap: 16px;
  }
}
</style>
