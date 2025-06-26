<template>
  <MobileDialog v-model="dialogVisible" title="发布动态" width="90%" :before-close="handleClose">
    <MobileForm ref="formRef" :model="form" :rules="rules">
      <MobileFormItem label="动态类型" prop="type">
        <MobileSelect
          v-model="form.type"
          placeholder="选择动态类型"
          :options="typeOptions"
          @change="handleTypeChange"
        />
      </MobileFormItem>

      <MobileFormItem label="动态内容" prop="content">
        <MobileInput
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="分享你的想法..."
          :maxlength="500"
          show-word-limit
        />
      </MobileFormItem>

      <!-- 选择歌曲 -->
      <MobileFormItem
        v-if="form.type === 'share_song' || form.type === 'like_song'"
        label="选择歌曲"
        prop="songId"
      >
        <div class="song-selector">
          <MobileButton @click="showSongSelector = true" type="primary" plain>
            {{ selectedSong ? selectedSong.title : '点击选择歌曲' }}
          </MobileButton>
          <div v-if="selectedSong" class="selected-item">
            <div class="item-info">
              <div class="item-title">{{ selectedSong.title }}</div>
              <div class="item-subtitle">{{ selectedSong.artist }}</div>
            </div>
            <MobileButton @click="clearSong" type="text" size="small">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </MobileButton>
          </div>
        </div>
      </MobileFormItem>

      <!-- 选择歌单 -->
      <MobileFormItem
        v-if="form.type === 'share_playlist' || form.type === 'create_playlist'"
        label="选择歌单"
        prop="playlistId"
      >
        <div class="playlist-selector">
          <MobileButton @click="showPlaylistSelector = true" type="primary" plain>
            {{ selectedPlaylist ? selectedPlaylist.title : '点击选择歌单' }}
          </MobileButton>
          <div v-if="selectedPlaylist" class="selected-item">
            <div class="item-info">
              <div class="item-title">{{ selectedPlaylist.title }}</div>
              <div class="item-subtitle">{{ selectedPlaylist.description }}</div>
            </div>
            <MobileButton @click="clearPlaylist" type="text" size="small">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </MobileButton>
          </div>
        </div>
      </MobileFormItem>

      <!-- 选择用户 -->
      <MobileFormItem v-if="form.type === 'follow_user'" label="选择用户" prop="targetUserId">
        <div class="user-selector">
          <MobileButton @click="showUserSelector = true" type="primary" plain>
            {{ selectedUser ? selectedUser.username : '点击选择用户' }}
          </MobileButton>
          <div v-if="selectedUser" class="selected-item">
            <MobileAvatar :src="selectedUser.avatar" :size="32">
              {{ selectedUser.username?.charAt(0) }}
            </MobileAvatar>
            <div class="item-info">
              <div class="item-title">{{ selectedUser.username }}</div>
            </div>
            <MobileButton @click="clearUser" type="text" size="small">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </MobileButton>
          </div>
        </div>
      </MobileFormItem>
    </MobileForm>

    <template #footer>
      <div class="dialog-footer">
        <MobileButton @click="handleClose">取消</MobileButton>
        <MobileButton type="primary" @click="handleSubmit" :loading="isSubmitting">
          发布
        </MobileButton>
      </div>
    </template>

    <!-- 歌曲选择器对话框 -->
    <SongSelectorDialog v-model="showSongSelector" @select="handleSongSelect" />

    <!-- 歌单选择器对话框 -->
    <PlaylistSelectorDialog v-model="showPlaylistSelector" @select="handlePlaylistSelect" />

    <!-- 用户选择器对话框 -->
    <UserSelectorDialog v-model="showUserSelector" @select="handleUserSelect" />
  </MobileDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import {
  MobileDialog,
  MobileForm,
  MobileFormItem,
  MobileInput,
  MobileSelect,
  MobileButton,
  MobileAvatar,
  MobileMessage,
  createSelectOptions,
} from '@/components/ui'
import { useSocialStore } from '@/stores/social'
import { FeedType, type CreateFeedDto } from '@/services/social-api'
import SongSelectorDialog from './SongSelectorDialog.vue'
import PlaylistSelectorDialog from './PlaylistSelectorDialog.vue'
import UserSelectorDialog from './UserSelectorDialog.vue'

// 临时类型定义，直到创建正确的类型文件
interface Song {
  id: string
  title: string
  artist: string
}

interface Playlist {
  id: string
  title: string
  description: string
}

interface User {
  id: string
  username: string
  avatar?: string
}

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', feed: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const socialStore = useSocialStore()
const formRef = ref()

// 响应式数据
const isSubmitting = ref(false)
const showSongSelector = ref(false)
const showPlaylistSelector = ref(false)
const showUserSelector = ref(false)

const selectedSong = ref<Song | null>(null)
const selectedPlaylist = ref<Playlist | null>(null)
const selectedUser = ref<User | null>(null)

const form = reactive({
  type: '' as FeedType,
  content: '',
  songId: '',
  playlistId: '',
  targetUserId: '',
})

// 动态类型选项
const typeOptions = createSelectOptions([
  { label: '分享歌曲', value: 'share_song' },
  { label: '分享歌单', value: 'share_playlist' },
  { label: '喜欢歌曲', value: 'like_song' },
  { label: '创建歌单', value: 'create_playlist' },
  { label: '关注用户', value: 'follow_user' },
])

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择动态类型', trigger: 'change' }],
  content: [{ max: 500, message: '内容不能超过500个字符', trigger: 'blur' }],
  songId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if ((form.type === 'share_song' || form.type === 'like_song') && !value) {
          callback(new Error('请选择歌曲'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  playlistId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if ((form.type === 'share_playlist' || form.type === 'create_playlist') && !value) {
          callback(new Error('请选择歌单'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  targetUserId: [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (form.type === 'follow_user' && !value) {
          callback(new Error('请选择用户'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// 监听对话框显示状态
watch(dialogVisible, visible => {
  if (visible) {
    resetForm()
  }
})

// 方法
const resetForm = () => {
  form.type = '' as FeedType
  form.content = ''
  form.songId = ''
  form.playlistId = ''
  form.targetUserId = ''

  selectedSong.value = null
  selectedPlaylist.value = null
  selectedUser.value = null

  formRef.value?.clearValidate()
}

const handleTypeChange = () => {
  // 清除之前选择的内容
  form.songId = ''
  form.playlistId = ''
  form.targetUserId = ''

  selectedSong.value = null
  selectedPlaylist.value = null
  selectedUser.value = null
}

const handleSongSelect = (song: Song) => {
  selectedSong.value = song
  form.songId = song.id
  showSongSelector.value = false
}

const handlePlaylistSelect = (playlist: Playlist) => {
  selectedPlaylist.value = playlist
  form.playlistId = playlist.id
  showPlaylistSelector.value = false
}

const handleUserSelect = (user: User) => {
  selectedUser.value = user
  form.targetUserId = user.id
  showUserSelector.value = false
}

const clearSong = () => {
  selectedSong.value = null
  form.songId = ''
}

const clearPlaylist = () => {
  selectedPlaylist.value = null
  form.playlistId = ''
}

const clearUser = () => {
  selectedUser.value = null
  form.targetUserId = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    isSubmitting.value = true

    const feedData: CreateFeedDto = {
      type: form.type,
      content: form.content || undefined,
      songId: form.songId || undefined,
      playlistId: form.playlistId || undefined,
      targetUserId: form.targetUserId || undefined,
    }

    const newFeed = await socialStore.createFeed(feedData)

    if (newFeed) {
      emit('created', newFeed)
      MobileMessage.success('发布成功')
      dialogVisible.value = false
    }
  } catch (error) {
    console.error('发布动态失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.song-selector,
.playlist-selector,
.user-selector {
  width: 100%;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-subtitle {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  text-align: right;
}
</style>
