<template>
  <div class="feed-card">
    <!-- 用户信息 -->
    <div class="feed-header">
      <div class="user-info" @click="feed.user?.id && $emit('user-click', feed.user.id)">
        <MobileAvatar :src="feed.user?.avatar" :size="40" class="user-avatar">
          {{ feed.user?.username?.charAt(0) }}
        </MobileAvatar>
        <div class="user-details">
          <div class="username">{{ feed.user?.username }}</div>
          <div class="feed-time">{{ formatTime(feed.createdAt) }}</div>
        </div>
      </div>

      <div class="feed-actions">
        <MobileDropdown v-if="isMyFeed" @command="handleCommand">
          <MobileButton type="text" size="small">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </MobileButton>
          <template #dropdown>
            <MobileDropdownMenu>
              <MobileDropdownItem command="delete">删除</MobileDropdownItem>
            </MobileDropdownMenu>
          </template>
        </MobileDropdown>
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
          <img
            :src="feed.song.coverUrl"
            :alt="feed.song.title"
            class="cover-image"
            @error="handleImageError"
          />
          <div v-if="!feed.song.coverUrl" class="cover-placeholder">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div class="play-overlay">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
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
          <img
            :src="feed.playlist.coverUrl"
            :alt="feed.playlist.title || feed.playlist.name"
            class="cover-image"
            @error="handleImageError"
          />
          <div v-if="!feed.playlist.coverUrl" class="cover-placeholder">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12h18l-3-3m0 6l3-3"></path>
              <path d="M3 6h18"></path>
              <path d="M3 18h18"></path>
            </svg>
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-title">{{ feed.playlist.title || feed.playlist.name }}</div>
          <div class="playlist-desc">{{ feed.playlist.description }}</div>
        </div>
      </div>

      <!-- 目标用户信息 -->
      <div
        v-if="feed.targetUser"
        class="feed-target-user"
        @click="$emit('user-click', feed.targetUser.id)"
      >
        <MobileAvatar :src="feed.targetUser.avatar" :size="32">
          {{ feed.targetUser.username?.charAt(0) }}
        </MobileAvatar>
        <span class="target-username">{{ feed.targetUser.username }}</span>
      </div>
    </div>

    <!-- 互动区域 -->
    <div class="feed-interactions">
      <div class="interaction-buttons">
        <MobileButton type="text" size="small" :class="{ 'is-liked': isLiked }" @click="handleLike">
          <svg
            v-if="isLiked"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            ></polygon>
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            ></polygon>
          </svg>
          {{ feed.likeCount || 0 }}
        </MobileButton>

        <MobileButton type="text" size="small" @click="handleComment">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {{ feed.commentCount || 0 }}
        </MobileButton>

        <MobileButton type="text" size="small" @click="handleShare">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          {{ feed.shareCount || 0 }}
        </MobileButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MobileAvatar,
  MobileButton,
  MobileDropdown,
  MobileDropdownMenu,
  MobileDropdownItem,
} from '@/components/ui'
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

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
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

.interaction-buttons button {
  color: #606266;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  min-height: 44px; /* 移动端最小触摸目标 */
  border-radius: 6px;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.interaction-buttons button:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.interaction-buttons button:active {
  transform: scale(0.98);
}

.interaction-buttons button.is-liked {
  color: #f56c6c;
}

.interaction-buttons button.is-liked:hover {
  background-color: rgba(245, 108, 108, 0.1);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .feed-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .feed-header {
    margin-bottom: 12px;
  }

  .user-info {
    gap: 10px;
  }

  .username {
    font-size: 15px;
  }

  .feed-time {
    font-size: 12px;
  }

  .feed-content {
    margin-bottom: 12px;
  }

  .content-text {
    font-size: 15px;
    line-height: 1.5;
  }

  .feed-song,
  .feed-playlist {
    padding: 12px;
  }

  .song-cover,
  .playlist-cover {
    width: 60px;
    height: 60px;
  }

  .song-title,
  .playlist-title {
    font-size: 15px;
  }

  .song-artist,
  .playlist-desc {
    font-size: 13px;
  }

  .interaction-buttons {
    gap: 16px;
    justify-content: space-around;
  }

  .interaction-buttons button {
    flex: 1;
    justify-content: center;
    padding: 12px 8px;
    font-size: 13px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .feed-card {
    padding: 12px;
    border-radius: 8px;
  }

  .user-info {
    gap: 8px;
  }

  .username {
    font-size: 14px;
  }

  .feed-time {
    font-size: 11px;
  }

  .content-text {
    font-size: 14px;
  }

  .feed-song,
  .feed-playlist {
    padding: 10px;
  }

  .song-cover,
  .playlist-cover {
    width: 50px;
    height: 50px;
  }

  .song-title,
  .playlist-title {
    font-size: 14px;
  }

  .song-artist,
  .playlist-desc {
    font-size: 12px;
  }

  .interaction-buttons button {
    padding: 10px 6px;
    font-size: 12px;
  }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .feed-card {
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
  }

  .username {
    color: #ffffff;
  }

  .feed-time {
    color: #999999;
  }

  .content-text {
    color: #ffffff;
  }

  .feed-song,
  .feed-playlist {
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
  }

  .song-title,
  .playlist-title {
    color: #ffffff;
  }

  .song-artist,
  .playlist-desc {
    color: #999999;
  }

  .feed-target-user {
    background: rgba(64, 158, 255, 0.1);
  }

  .feed-interactions {
    border-top-color: #3a3a3a;
  }

  .interaction-buttons button {
    color: #999999;
  }

  .interaction-buttons button:hover {
    color: #409eff;
    background-color: rgba(64, 158, 255, 0.1);
  }
}
</style>
